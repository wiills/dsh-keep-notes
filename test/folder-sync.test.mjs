import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { BoardStore } from '../host-store.js';
import { FolderSync, mergeBoards, REMOTE_FILE } from '../host-sync.js';

async function tempRoot() {
  return mkdtemp(path.join(os.tmpdir(), 'keep-notes-folder-'));
}

function todo(id, text, updatedAt) {
  return {
    id: id,
    text: text,
    date: null,
    done: false,
    createdAt: 1,
    updatedAt: updatedAt,
    completedAt: null,
  };
}

function note(id, text, updatedAt) {
  return {
    id: id,
    text: text,
    date: null,
    fixed: false,
    color: 'default',
    createdAt: 1,
    updatedAt: updatedAt,
  };
}

test('mergeBoards keeps the newest item and the union of tombstones', () => {
  const local = {
    revision: 2,
    todos: [todo('t-1', 'local', 10)],
    notes: [note('n-1', 'local note', 10)],
    tombstones: [],
  };
  const remote = {
    revision: 3,
    todos: [todo('t-1', 'remote', 20), todo('t-2', 'remote only', 5)],
    notes: [note('n-1', 'remote note', 20)],
    tombstones: [{ kind: 'todo', id: 't-old', deletedAt: 30 }],
  };

  const merged = mergeBoards(local, remote);
  assert.equal(merged.revision, 3);
  assert.equal(merged.todos.find((item) => item.id === 't-1').text, 'remote');
  assert.equal(merged.todos.find((item) => item.id === 't-2').text, 'remote only');
  assert.equal(merged.notes[0].text, 'remote note');
  assert.deepEqual(merged.tombstones, [{ kind: 'todo', id: 't-old', deletedAt: 30 }]);
});

test('mergeBoards lets a newer deletion win and an older deletion lose', () => {
  const local = {
    revision: 1,
    todos: [todo('t-delete', 'delete me', 10), todo('t-keep', 'keep me', 40)],
    notes: [],
    tombstones: [],
  };
  const remote = {
    revision: 2,
    todos: [],
    notes: [],
    tombstones: [
      { kind: 'todo', id: 't-delete', deletedAt: 20 },
      { kind: 'todo', id: 't-keep', deletedAt: 30 },
    ],
  };

  const merged = mergeBoards(local, remote);
  assert.equal(merged.todos.some((item) => item.id === 't-delete'), false);
  assert.equal(merged.todos.some((item) => item.id === 't-keep'), true);
  assert.equal(merged.tombstones.length, 2);
});

test('mergeBoards keeps only one pinned note', () => {
  const local = {
    revision: 1,
    todos: [],
    notes: [{ ...note('n-old', 'old pinned', 10), fixed: true }],
    tombstones: [],
  };
  const remote = {
    revision: 1,
    todos: [],
    notes: [{ ...note('n-new', 'new pinned', 20), fixed: true }],
    tombstones: [],
  };

  const merged = mergeBoards(local, remote);
  assert.equal(merged.notes.filter((item) => item.fixed).length, 1);
  assert.equal(merged.notes.find((item) => item.fixed).id, 'n-new');
});

test('FolderSync exchanges changes between two Host stores through a shared folder', async () => {
  const root = await tempRoot();
  const shared = path.join(root, 'shared');
  await mkdir(shared);
  const storeA = new BoardStore({ file: path.join(root, 'a.json') });
  const storeB = new BoardStore({ file: path.join(root, 'b.json') });
  await storeA.initialize({ todos: [], notes: [] });
  await storeB.initialize({ todos: [], notes: [] });

  const syncA = new FolderSync({
    store: storeA,
    configFile: path.join(root, 'a-sync.json'),
    intervalMs: 1000,
  });
  const syncB = new FolderSync({
    store: storeB,
    configFile: path.join(root, 'b-sync.json'),
    intervalMs: 1000,
  });

  await syncA.setFolder(shared);
  await syncB.setFolder(shared);
  await syncA.tick();
  await syncB.tick();

  const added = await storeA.addTodo({ text: 'from A', date: null });
  await syncA.tick();
  await syncB.tick();
  assert.equal((await storeB.list()).todos.some((item) => item.id === added.todo.id), true);

  await storeB.remove('todo', added.todo.id);
  await syncB.tick();
  await syncA.tick();
  assert.equal((await storeA.list()).todos.some((item) => item.id === added.todo.id), false);
});

test('FolderSync converges when both devices add items before the next sync', async () => {
  const root = await tempRoot();
  const shared = path.join(root, 'shared');
  await mkdir(shared);
  const storeA = new BoardStore({ file: path.join(root, 'a.json') });
  const storeB = new BoardStore({ file: path.join(root, 'b.json') });
  await storeA.initialize({ todos: [], notes: [] });
  await storeB.initialize({ todos: [], notes: [] });

  const syncA = new FolderSync({ store: storeA, configFile: path.join(root, 'a-sync.json'), intervalMs: 1000 });
  const syncB = new FolderSync({ store: storeB, configFile: path.join(root, 'b-sync.json'), intervalMs: 1000 });
  await syncA.setFolder(shared);
  await syncB.setFolder(shared);

  const first = await storeA.addTodo({ text: 'from A', date: null });
  const second = await storeB.addTodo({ text: 'from B', date: null });
  await syncA.tick();
  await syncB.tick();
  await syncA.tick();

  for (const store of [storeA, storeB]) {
    const ids = (await store.list()).todos.map((item) => item.id).sort();
    assert.deepEqual(ids, [first.todo.id, second.todo.id].sort());
  }
});

test('FolderSync persists the folder and writes only the board snapshot', async () => {
  const root = await tempRoot();
  const shared = path.join(root, 'shared');
  await mkdir(shared);
  const store = new BoardStore({ file: path.join(root, 'board.json') });
  await store.initialize({ todos: [], notes: [] });
  const sync = new FolderSync({ store: store, configFile: path.join(root, 'sync.json') });
  await sync.setFolder(shared);
  await sync.tick();

  const status = sync.getStatus();
  assert.equal(status.enabled, true);
  assert.equal(status.folder, shared);
  const remote = JSON.parse(await readFile(path.join(shared, REMOTE_FILE), 'utf8'));
  assert.equal(Array.isArray(remote.todos), true);
  assert.equal(Array.isArray(remote.notes), true);
  assert.equal('images' in remote, false);
  assert.equal('appearance' in remote, false);
});

test('Host tombstones survive a reload and block a stale re-add', async () => {
  const root = await tempRoot();
  const store = new BoardStore({ file: path.join(root, 'board.json') });
  await store.initialize({ todos: [], notes: [] });
  const added = await store.addTodo({ text: 'gone', date: null });
  await store.remove('todo', added.todo.id);

  const reloaded = new BoardStore({ file: store.file });
  await reloaded.load();
  assert.equal(reloaded.syncSnapshot().tombstones.length, 1);
  await reloaded.applyOps([
    {
      type: 'addTodo',
      opId: 'stale-add',
      todo: { id: added.todo.id, text: 'resurrect?', date: null, updatedAt: 1 },
    },
  ]);
  assert.equal((await reloaded.list()).todos.length, 0);
});

test('FolderSync loads an existing local board before writing the shared file', async () => {
  const root = await tempRoot();
  const shared = path.join(root, 'shared');
  await mkdir(shared);
  const writer = new BoardStore({ file: path.join(root, 'a.json') });
  await writer.initialize({ todos: [], notes: [] });
  await writer.addTodo({ text: 'existing local', date: null });

  const unloaded = new BoardStore({ file: writer.file });
  const sync = new FolderSync({ store: unloaded, configFile: path.join(root, 'a-sync.json') });
  await sync.setFolder(shared);
  await sync.tick();

  const remote = JSON.parse(await readFile(path.join(shared, REMOTE_FILE), 'utf8'));
  assert.equal(remote.todos[0].text, 'existing local');
});

test('FolderSync rejects a missing or relative target folder', async () => {
  const root = await tempRoot();
  const store = new BoardStore({ file: path.join(root, 'board.json') });
  const sync = new FolderSync({ store: store, configFile: path.join(root, 'sync.json') });
  await assert.rejects(sync.setFolder(path.join(root, 'missing')), /does not exist/);
  await assert.rejects(sync.setFolder('relative-folder'), /does not exist|directory/);
});
