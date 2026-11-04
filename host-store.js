/**
 * Host-owned board store shared by the agent tools and the browser panel.
 *
 * The browser keeps its localStorage copy as an offline cache; the Host file is
 * the source of truth once the panel has connected. Ops are idempotent by
 * `opId` so a retried POST cannot add the same todo or note twice.
 */
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export const MAX_TODO_TEXT = 1000;
export const MAX_NOTE_TEXT = 20000;
export const MAX_APPLIED_OPS = 500;
export const NOTE_COLORS = ['default', 'yellow', 'green', 'blue', 'purple', 'red'];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;
const VERSION = 1;

function defaultFile() {
  const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
  return path.join(home, 'keep-notes', 'board.json');
}

function finiteTime(value, fallback) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function normalizeDate(value) {
  return typeof value === 'string' && DATE_PATTERN.test(value) ? value : null;
}

function textValue(value, limit) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function makeId(prefix) {
  return prefix + '-' + Date.now().toString(36) + '-' + randomUUID().slice(0, 8);
}

function validId(value) {
  return typeof value === 'string' && ID_PATTERN.test(value) ? value : '';
}

export function sanitizeTodo(value, fallbackId) {
  const source = value && typeof value === 'object' ? value : {};
  const text = textValue(source.text, MAX_TODO_TEXT);
  if (!text) return null;
  const done = source.done === true;
  return {
    id: validId(source.id) || validId(fallbackId) || makeId('t'),
    text: text,
    date: normalizeDate(source.date),
    done: done,
    createdAt: finiteTime(source.createdAt, Date.now()),
    completedAt: done ? finiteTime(source.completedAt, Date.now()) : null,
  };
}

export function sanitizeNote(value) {
  const source = value && typeof value === 'object' ? value : {};
  const text = textValue(source.text, MAX_NOTE_TEXT);
  if (!text) return null;
  return {
    id: validId(source.id) || makeId('n'),
    text: text,
    date: normalizeDate(source.date),
    fixed: source.fixed === true,
    color: NOTE_COLORS.indexOf(source.color) >= 0 ? source.color : 'default',
    createdAt: finiteTime(source.createdAt, Date.now()),
    updatedAt: finiteTime(source.updatedAt, Date.now()),
  };
}

function publicTodo(todo) {
  return {
    id: todo.id,
    text: todo.text,
    date: todo.date,
    done: todo.done,
    createdAt: todo.createdAt,
    completedAt: todo.completedAt,
  };
}

function publicNote(note) {
  return {
    id: note.id,
    text: note.text,
    date: note.date,
    fixed: note.fixed,
    color: note.color,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

function freshState() {
  return { version: VERSION, revision: 0, todos: [], notes: [], appliedOps: [] };
}

function cloneState(state) {
  return {
    version: state.version,
    revision: state.revision,
    todos: state.todos.map((todo) => ({ ...todo })),
    notes: state.notes.map((note) => ({ ...note })),
    appliedOps: state.appliedOps.slice(),
  };
}

function readState(raw) {
  const parsed = JSON.parse(raw);
  const source = parsed && typeof parsed === 'object' ? parsed : {};
  return {
    version: VERSION,
    revision: Number.isInteger(source.revision) && source.revision >= 0 ? source.revision : 0,
    todos: Array.isArray(source.todos) ? source.todos.map((todo) => sanitizeTodo(todo)).filter(Boolean) : [],
    notes: Array.isArray(source.notes) ? source.notes.map((note) => sanitizeNote(note)).filter(Boolean) : [],
    appliedOps: Array.isArray(source.appliedOps)
      ? source.appliedOps.filter((id) => typeof id === 'string' && id.length <= 100).slice(-MAX_APPLIED_OPS)
      : [],
  };
}

/**
 * Serializable board store. Every mutation is serialized on one promise chain,
 * so concurrent tool calls and browser sync requests cannot interleave writes.
 */
export class BoardStore {
  constructor(options = {}) {
    this.file = options.file || defaultFile();
    this.state = null;
    this.loading = null;
    this.chain = Promise.resolve();
  }

  async load() {
    if (this.state) return this.state;
    if (!this.loading) {
      const loading = (async () => {
        try {
          this.state = readState(await readFile(this.file, 'utf8'));
        } catch (error) {
          if (error && error.code === 'ENOENT') {
            this.state = freshState();
          } else if (error instanceof SyntaxError) {
            /* Keep the unreadable file for diagnosis instead of failing every tool. */
            try {
              await rename(this.file, this.file + '.corrupt-' + Date.now());
            } catch (backupError) {
              /* The fresh board is still usable if the backup cannot be made. */
            }
            this.state = freshState();
          } else {
            throw error;
          }
        }
        return this.state;
      })();
      this.loading = loading;
      try {
        return await loading;
      } catch (error) {
        this.loading = null;
        throw error;
      }
    }
    return this.loading;
  }

  snapshot() {
    const state = this.state || freshState();
    return {
      revision: state.revision,
      todos: state.todos.map(publicTodo),
      notes: state.notes.map(publicNote),
    };
  }

  async list() {
    await this.load();
    return this.snapshot();
  }

  async persist() {
    await mkdir(path.dirname(this.file), { recursive: true, mode: 0o700 });
    const temporary = this.file + '.' + process.pid + '.' + randomUUID() + '.tmp';
    try {
      await writeFile(temporary, JSON.stringify(this.state, null, 2), { encoding: 'utf8', mode: 0o600 });
      await rename(temporary, this.file);
    } catch (error) {
      try {
        await unlink(temporary);
      } catch (ignored) {
        /* The original write failure is the useful error. */
      }
      throw error;
    }
  }

  mutate(change) {
    const run = this.chain.then(async () => {
      await this.load();
      const backup = cloneState(this.state);
      let next;
      try {
        next = change(this.state);
        if (next && next.changed) {
          this.state.revision += 1;
          this.state.appliedOps = this.state.appliedOps.slice(-MAX_APPLIED_OPS);
          await this.persist();
        }
      } catch (error) {
        /* A failed batch or write must not leave a partially applied state. */
        this.state = backup;
        throw error;
      }
      if (!next) return undefined;
      return typeof next.value === 'function' ? next.value() : next.value;
    });
    this.chain = run.catch(() => {});
    return run;
  }

  async initialize(board) {
    return this.mutate((state) => {
      if (state.revision > 0) return { changed: false, value: () => this.snapshot() };
      const todos = Array.isArray(board && board.todos) ? board.todos.map((todo) => sanitizeTodo(todo)).filter(Boolean) : [];
      const notes = Array.isArray(board && board.notes) ? board.notes.map((note) => sanitizeNote(note)).filter(Boolean) : [];
      state.todos = todos;
      state.notes = notes;
      return { changed: true, value: () => this.snapshot() };
    });
  }

  async applyOps(ops) {
    const list = Array.isArray(ops) ? ops : [];
    if (list.length > 100) throw new Error('at most 100 operations per request');
    return this.mutate((state) => {
      let changed = false;
      for (const op of list) {
        if (!op || typeof op !== 'object' || typeof op.type !== 'string') throw new Error('invalid operation');
        const opId = typeof op.opId === 'string' && op.opId.length <= 100 ? op.opId : '';
        if (opId && state.appliedOps.includes(opId)) continue;
        let applied = false;
        switch (op.type) {
          case 'addTodo': {
            const todo = sanitizeTodo(op.todo || op);
            if (!todo) throw new Error('todo text must not be empty');
            if (!state.todos.some((item) => item.id === todo.id)) {
              state.todos.push(todo);
              applied = true;
            }
            break;
          }
          case 'updateTodo': {
            const todo = state.todos.find((item) => item.id === op.id);
            if (todo) {
              applied = applyTodoPatch(todo, op);
            }
            break;
          }
          case 'removeTodo': {
            const index = state.todos.findIndex((item) => item.id === op.id);
            if (index >= 0) {
              state.todos.splice(index, 1);
              applied = true;
            }
            break;
          }
          case 'addNote': {
            const note = sanitizeNote(op.note || op);
            if (!note) throw new Error('note text must not be empty');
            if (!state.notes.some((item) => item.id === note.id)) {
              state.notes.push(note);
              applied = true;
            }
            break;
          }
          case 'updateNote': {
            const note = state.notes.find((item) => item.id === op.id);
            if (note) applied = applyNotePatch(note, op);
            break;
          }
          case 'removeNote': {
            const index = state.notes.findIndex((item) => item.id === op.id);
            if (index >= 0) {
              state.notes.splice(index, 1);
              applied = true;
            }
            break;
          }
          case 'remove': {
            if (op.kind === 'todo') {
              const index = state.todos.findIndex((item) => item.id === op.id);
              if (index >= 0) {
                state.todos.splice(index, 1);
                applied = true;
              }
            } else if (op.kind === 'note') {
              const index = state.notes.findIndex((item) => item.id === op.id);
              if (index >= 0) {
                state.notes.splice(index, 1);
                applied = true;
              }
            } else {
              throw new Error('remove.kind must be todo or note');
            }
            break;
          }
          case 'saveFixed': {
            applied = applyFixedNote(state, op.text, op.color);
            break;
          }
          default:
            throw new Error('unknown operation: ' + op.type);
        }
        if (applied) changed = true;
        if (opId) state.appliedOps.push(opId);
      }
      if (state.appliedOps.length > MAX_APPLIED_OPS) state.appliedOps = state.appliedOps.slice(-MAX_APPLIED_OPS);
      return { changed: changed, value: () => this.snapshot() };
    });
  }

  async addTodo(input = {}) {
    const todo = sanitizeTodo(input, input.id);
    if (!todo) throw new Error('todo text must not be empty');
    return this.mutate((state) => {
      if (state.todos.some((item) => item.id === todo.id)) return { changed: false, value: () => ({ todo: publicTodo(todo), revision: state.revision }) };
      state.todos.push(todo);
      return { changed: true, value: () => ({ todo: publicTodo(todo), revision: state.revision }) };
    });
  }

  async updateTodo(id, patch = {}) {
    return this.mutate((state) => {
      const todo = state.todos.find((item) => item.id === id);
      if (!todo) return { changed: false, value: null };
      const changed = applyTodoPatch(todo, patch);
      return { changed: changed, value: changed ? () => ({ todo: publicTodo(todo), revision: state.revision }) : null };
    });
  }

  async addNote(input = {}) {
    const note = sanitizeNote(input);
    if (!note) throw new Error('note text must not be empty');
    return this.mutate((state) => {
      if (state.notes.some((item) => item.id === note.id)) return { changed: false, value: () => ({ note: publicNote(note), revision: state.revision }) };
      state.notes.push(note);
      return { changed: true, value: () => ({ note: publicNote(note), revision: state.revision }) };
    });
  }

  async updateNote(id, patch = {}) {
    return this.mutate((state) => {
      const note = state.notes.find((item) => item.id === id);
      if (!note) return { changed: false, value: null };
      const changed = applyNotePatch(note, patch);
      return { changed: changed, value: changed ? () => ({ note: publicNote(note), revision: state.revision }) : null };
    });
  }

  async remove(kind, id) {
    return this.mutate((state) => {
      const list = kind === 'todo' ? state.todos : kind === 'note' ? state.notes : null;
      if (!list) throw new Error('kind must be todo or note');
      const index = list.findIndex((item) => item.id === id);
      if (index < 0) return { changed: false, value: () => ({ removed: false, revision: state.revision }) };
      list.splice(index, 1);
      return { changed: true, value: () => ({ removed: true, revision: state.revision }) };
    });
  }
}

function applyTodoPatch(todo, patch) {
  let changed = false;
  if (typeof patch.text === 'string') {
    const text = textValue(patch.text, MAX_TODO_TEXT);
    if (text && text !== todo.text) {
      todo.text = text;
      changed = true;
    }
  }
  if (typeof patch.done === 'boolean' && patch.done !== todo.done) {
    todo.done = patch.done;
    todo.completedAt = patch.done ? Date.now() : null;
    changed = true;
  }
  return changed;
}

function applyNotePatch(note, patch) {
  let changed = false;
  if (typeof patch.text === 'string') {
    const text = textValue(patch.text, MAX_NOTE_TEXT);
    if (text && text !== note.text) {
      note.text = text;
      changed = true;
    }
  }
  if (NOTE_COLORS.indexOf(patch.color) >= 0 && patch.color !== note.color) {
    note.color = patch.color;
    changed = true;
  }
  if (changed) note.updatedAt = Date.now();
  return changed;
}

function applyFixedNote(state, text, color) {
  const value = textValue(text, MAX_NOTE_TEXT);
  const tint = NOTE_COLORS.indexOf(color) >= 0 ? color : 'default';
  const existing = state.notes.find((note) => note.fixed === true);
  if (existing) {
    if (!value) {
      state.notes = state.notes.filter((note) => note.id !== existing.id);
      return true;
    }
    if (existing.text === value && existing.color === tint) return false;
    existing.text = value;
    existing.color = tint;
    existing.updatedAt = Date.now();
    return true;
  }
  if (!value) return false;
  const now = Date.now();
  const note = sanitizeNote({ text: value, date: null, fixed: true, color: tint, createdAt: now, updatedAt: now });
  if (!note) return false;
  state.notes.push(note);
  return true;
}

export { defaultFile };
