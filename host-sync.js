/**
 * Shared-folder sync for the keep-notes board.
 *
 * The plugin does not run a server. A user points this adapter at a folder that
 * an existing sync client (OneDrive, Dropbox, Syncthing, ...) already replicates.
 * Only the board snapshot is written there; browser-only appearance images never
 * leave the machine.
 */
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  sanitizeNote,
  sanitizeTodo,
  sanitizeTombstones,
  MAX_TOMBSTONES,
} from './host-store.js';

export const REMOTE_FILE = 'dsh-keep-notes.board.json';
export const SYNC_VERSION = 1;
export const DEFAULT_INTERVAL_MS = 5000;

export function defaultSyncConfigFile() {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
  return path.join(home, 'keep-notes', 'sync.json');
}

function expandFolder(value) {
  let text = String(value || '').trim();
  if (!text) return '';
  if (text === '~' || text.startsWith('~/') || text.startsWith('~\\')) {
    text = path.join(os.homedir(), text.slice(1).replace(/^[/\\]+/, ''));
  }
  return path.resolve(text);
}

function itemTime(item) {
  return Math.max(Number(item.updatedAt) || 0, Number(item.createdAt) || 0);
}

function itemKey(item) {
  return JSON.stringify(item);
}

function newerItem(current, candidate) {
  const currentTime = itemTime(current);
  const candidateTime = itemTime(candidate);
  if (candidateTime !== currentTime) return candidateTime > currentTime;
  return itemKey(candidate) > itemKey(current);
}

function sortedItems(items) {
  return items
    .slice()
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0) || String(a.id).localeCompare(String(b.id)));
}

function normalizeState(value) {
  const source = value && typeof value === 'object' ? value : {};
  const revision = Number.isInteger(source.revision) && source.revision >= 0 ? source.revision : 0;
  return {
    version: SYNC_VERSION,
    revision: revision,
    todos: Array.isArray(source.todos) ? source.todos.map((todo) => sanitizeTodo(todo)).filter(Boolean) : [],
    notes: Array.isArray(source.notes) ? source.notes.map((note) => sanitizeNote(note)).filter(Boolean) : [],
    tombstones: sanitizeTombstones(source.tombstones),
  };
}

function mergeItems(kind, localItems, remoteItems, tombstones) {
  const items = new Map();
  for (const item of localItems.concat(remoteItems)) {
    const current = items.get(item.id);
    if (!current || newerItem(current, item)) items.set(item.id, item);
  }
  const deleted = new Map(
    tombstones.filter((item) => item.kind === kind).map((item) => [item.id, item.deletedAt]),
  );
  return sortedItems(
    [...items.values()].filter((item) => {
      const deletedAt = deleted.get(item.id);
      return deletedAt === undefined || deletedAt < itemTime(item);
    }),
  );
}

function canonical(state) {
  const source = normalizeState(state);
  return JSON.stringify({
    todos: source.todos.slice().sort((a, b) => a.id.localeCompare(b.id)),
    notes: source.notes.slice().sort((a, b) => a.id.localeCompare(b.id)),
    tombstones: source.tombstones.slice().sort((a, b) => (a.kind + ':' + a.id).localeCompare(b.kind + ':' + b.id)),
  });
}

function sameBoard(left, right) {
  return canonical(left) === canonical(right);
}

/**
 * Merge two snapshots by item timestamp. Deletions are represented by
 * tombstones, so an offline device cannot resurrect an item that was removed.
 */
export function mergeBoards(localValue, remoteValue) {
  const local = normalizeState(localValue);
  const remote = normalizeState(remoteValue);
  const tombstones = sanitizeTombstones(local.tombstones.concat(remote.tombstones));
  const todos = mergeItems('todo', local.todos, remote.todos, tombstones);
  const notes = mergeItems('note', local.notes, remote.notes, tombstones);

  /* A board has at most one pinned note. Keep the newest one if two devices
     independently pinned different notes. */
  const pinned = notes.filter((note) => note.fixed).sort((a, b) => itemTime(b) - itemTime(a) || a.id.localeCompare(b.id));
  const winner = pinned[0];
  if (winner) {
    for (const note of notes) {
      if (note.fixed && note.id !== winner.id) note.fixed = false;
    }
  }

  return {
    version: SYNC_VERSION,
    revision: Math.max(local.revision, remote.revision),
    todos: todos,
    notes: notes,
    tombstones: tombstones.slice(-MAX_TOMBSTONES),
  };
}

function configError(message) {
  const error = new Error(message);
  error.code = 'ESYNC';
  return error;
}

export class FolderSync {
  constructor(options = {}) {
    if (!options.store) throw new Error('FolderSync requires a board store');
    this.store = options.store;
    this.configFile = options.configFile || defaultSyncConfigFile();
    this.intervalMs = Number.isFinite(options.intervalMs) && options.intervalMs >= 1000
      ? options.intervalMs
      : DEFAULT_INTERVAL_MS;
    this.folder = '';
    this.state = 'disabled';
    this.lastSyncAt = 0;
    this.lastError = '';
    this.remoteRevision = 0;
    this.started = false;
    this.running = null;
    this.timer = null;
  }

  getStatus() {
    return {
      enabled: Boolean(this.folder),
      folder: this.folder,
      state: this.state,
      lastSyncAt: this.lastSyncAt,
      lastError: this.lastError,
      remoteRevision: this.remoteRevision,
    };
  }

  status() {
    return this.getStatus();
  }

  async loadConfig() {
    try {
      const parsed = JSON.parse(await readFile(this.configFile, 'utf8'));
      const folder = expandFolder(parsed && parsed.folder);
      this.folder = folder;
      this.state = folder ? 'idle' : 'disabled';
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        this.folder = '';
        this.state = 'disabled';
        return;
      }
      this.state = 'error';
      this.lastError = 'could not read sync config: ' + (error && error.message ? error.message : String(error));
    }
  }

  async saveConfig(folder) {
    await mkdir(path.dirname(this.configFile), { recursive: true, mode: 0o700 });
    const temporary = this.configFile + '.' + process.pid + '.' + randomUUID() + '.tmp';
    try {
      await writeFile(
        temporary,
        JSON.stringify({ version: SYNC_VERSION, folder: folder }, null, 2),
        { encoding: 'utf8', mode: 0o600 },
      );
      await rename(temporary, this.configFile);
    } catch (error) {
      try {
        await unlink(temporary);
      } catch (ignored) {
        /* The original write failure is the useful error. */
      }
      throw error;
    }
  }

  arm() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (!this.started || !this.folder) return;
    this.timer = setInterval(() => {
      this.tick().catch(() => {});
    }, this.intervalMs);
  }

  start() {
    if (this.started) return () => {};
    this.started = true;
    this.loadConfig()
      .then(() => {
        if (!this.started || !this.folder) return undefined;
        this.arm();
        return this.tick();
      })
      .catch((error) => {
        this.state = 'error';
        this.lastError = error && error.message ? error.message : String(error);
      });
    return () => this.stop();
  }

  stop() {
    this.started = false;
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
  }

  async setFolder(value) {
    const folder = expandFolder(value);
    if (!folder) {
      await this.saveConfig('');
      this.folder = '';
      this.state = 'disabled';
      this.lastError = '';
      this.remoteRevision = 0;
      if (this.timer !== null) clearInterval(this.timer);
      this.timer = null;
      return this.getStatus();
    }

    let info;
    try {
      info = await stat(folder);
    } catch (error) {
      throw configError('sync folder does not exist or is not readable');
    }
    if (!info.isDirectory()) throw configError('sync folder must be a directory');
    if (path.resolve(folder, REMOTE_FILE) === path.resolve(this.store.file)) {
      throw configError('sync folder cannot contain the local board');
    }

    await this.saveConfig(folder);
    this.folder = folder;
    this.state = 'idle';
    this.lastError = '';
    if (this.started) {
      this.arm();
      await this.tick();
    }
    return this.getStatus();
  }

  async readRemote() {
    const file = path.join(this.folder, REMOTE_FILE);
    try {
      return normalizeState(JSON.parse(await readFile(file, 'utf8')));
    } catch (error) {
      if (error && error.code === 'ENOENT') return null;
      if (error instanceof SyntaxError) {
        throw new Error('shared board is not valid JSON: ' + file);
      }
      throw error;
    }
  }

  async writeRemote(snapshot) {
    const file = path.join(this.folder, REMOTE_FILE);
    const temporary = file + '.' + process.pid + '.' + randomUUID() + '.tmp';
    const payload = {
      version: SYNC_VERSION,
      revision: snapshot.revision,
      updatedAt: Date.now(),
      todos: snapshot.todos,
      notes: snapshot.notes,
      tombstones: snapshot.tombstones,
    };
    try {
      await writeFile(temporary, JSON.stringify(payload, null, 2), { encoding: 'utf8', mode: 0o600 });
      await rename(temporary, file);
    } catch (error) {
      try {
        await unlink(temporary);
      } catch (ignored) {
        /* The original write failure is the useful error. */
      }
      throw error;
    }
  }

  async syncOnce() {
    if (!this.folder) return;
    await this.store.load();
    const local = this.store.syncSnapshot();
    const remote = await this.readRemote();

    if (!remote) {
      await this.writeRemote(local);
      this.remoteRevision = local.revision;
      return;
    }

    const merged = mergeBoards(local, remote);
    const localChanged = !sameBoard(local, merged);
    const remoteChanged = !sameBoard(remote, merged);

    if (localChanged) {
      const applied = await this.store.applySync(merged, local.revision);
      if (applied.stale) return;
      if (applied.snapshot) {
        await this.writeRemote(applied.snapshot);
        this.remoteRevision = applied.snapshot.revision;
      }
      return;
    }

    if (remoteChanged) {
      await this.writeRemote({ ...local, revision: merged.revision });
      this.remoteRevision = merged.revision;
      return;
    }

    this.remoteRevision = remote.revision;
  }

  async tick() {
    if (!this.folder) return this.getStatus();
    if (this.running) return this.running;
    this.state = 'syncing';
    this.lastError = '';
    const run = this.syncOnce()
      .then(() => {
        this.state = 'idle';
        this.lastSyncAt = Date.now();
      })
      .catch((error) => {
        this.state = 'error';
        this.lastError = error && error.message ? error.message : String(error);
      })
      .finally(() => {
        this.running = null;
      });
    this.running = run;
    return run.then(() => this.getStatus());
  }
}
