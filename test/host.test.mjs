import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import test from 'node:test';

import { BoardStore } from '../host-store.js';
import { createKeepNotesTools } from '../host-tools.js';
import { apply, createBoardRoutes } from '../index.js';

async function tempStore() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'keep-notes-'));
  return new BoardStore({ file: path.join(directory, 'board.json') });
}

test('the Host store initializes once and survives a reload', async () => {
  const store = await tempStore();
  const initialized = await store.initialize({
    todos: [{ id: 't-1', text: 'ship it', date: '2026-11-04', done: false }],
    notes: [{ id: 'n-1', text: 'remember', date: null, color: 'blue' }],
  });
  assert.equal(initialized.revision, 1);
  assert.equal(initialized.todos[0].text, 'ship it');

  const again = await store.initialize({ todos: [], notes: [] });
  assert.equal(again.revision, 1);

  const reloaded = new BoardStore({ file: store.file });
  const snapshot = await reloaded.list();
  assert.equal(snapshot.revision, 1);
  assert.equal(snapshot.todos.length, 1);
  assert.equal(snapshot.notes[0].color, 'blue');
});

test('tool calls mutate the same board the panel reads', async () => {
  const store = await tempStore();
  await store.initialize({ todos: [], notes: [] });
  const tools = new Map(createKeepNotesTools(store).map((tool) => [tool.name, tool]));

  const added = await tools.get('keep_notes_add_todo').execute({ text: 'write tests', date: '2026-11-04' }, {});
  assert.equal(added.todo.text, 'write tests');
  assert.equal(added.revision, 2);

  const updated = await tools.get('keep_notes_update_todo').execute({ id: added.todo.id, done: true }, {});
  assert.equal(updated.todo.done, true);

  const note = await tools.get('keep_notes_add_note').execute({ text: 'agent note', color: 'green' }, {});
  assert.equal(note.note.color, 'green');

  const listed = await tools.get('keep_notes_list').execute({}, {});
  assert.equal(listed.todos.length, 1);
  assert.equal(listed.notes.length, 1);

  const removed = await tools.get('keep_notes_remove').execute({ kind: 'note', id: note.note.id }, {});
  assert.equal(removed.removed, true);
  assert.equal((await store.list()).notes.length, 0);
});

test('browser operations are idempotent by opId and update one revision', async () => {
  const store = await tempStore();
  await store.initialize({ todos: [], notes: [] });
  const todo = { id: 't-2', text: 'retry me', date: null, done: false, createdAt: 1, completedAt: null };
  const op = { type: 'addTodo', opId: 'op-1', todo: todo };

  const first = await store.applyOps([op]);
  const second = await store.applyOps([op]);
  assert.equal(first.todos.length, 1);
  assert.equal(second.todos.length, 1);
  assert.equal(second.revision, first.revision);

  const toggled = await store.applyOps([{ type: 'updateTodo', opId: 'op-2', id: 't-2', done: true }]);
  assert.equal(toggled.todos[0].done, true);
});

test('a failed operation batch leaves both memory and disk unchanged', async () => {
  const store = await tempStore();
  await store.initialize({ todos: [], notes: [] });
  const before = await store.list();

  await assert.rejects(
    store.applyOps([
      {
        type: 'addTodo',
        opId: 'partial-add',
        todo: { id: 't-partial', text: 'must roll back', date: null, done: false },
      },
      { type: 'unknown-operation', opId: 'partial-unknown' },
    ]),
    /unknown operation/,
  );

  const after = await store.list();
  assert.deepEqual(after, before);
  const reloaded = new BoardStore({ file: store.file });
  assert.deepEqual(await reloaded.list(), before);
});

test('note updates, pinned notes and caps stay inside the Host contract', async () => {
  const store = await tempStore();
  await store.initialize({ todos: [], notes: [] });

  const note = await store.addNote({ text: 'x'.repeat(20001), date: 'not-a-date', color: 'purple' });
  assert.equal(note.note.text.length, 20000);
  assert.equal(note.note.date, null);

  const updated = await store.updateNote(note.note.id, { text: 'updated', color: 'red' });
  assert.equal(updated.note.text, 'updated');
  assert.equal(updated.note.color, 'red');

  await store.applyOps([{ type: 'saveFixed', opId: 'fixed-1', text: 'pinned', color: 'blue' }]);
  const pinned = (await store.list()).notes.filter((item) => item.fixed);
  assert.equal(pinned.length, 1);
  assert.equal(pinned[0].text, 'pinned');

  await store.applyOps([{ type: 'saveFixed', opId: 'fixed-2', text: '', color: 'blue' }]);
  assert.equal((await store.list()).notes.filter((item) => item.fixed).length, 0);
});

test('apply registers the tool surface and the three exact API routes', () => {
  const tools = new Map();
  const routes = new Map();
  const child = {
    effect(callback) {
      callback();
      return () => {};
    },
    connection: {
      admit() {
        return { peer: {} };
      },
    },
    webServer: {
      register(route) {
        routes.set(route.path, route);
        return () => {};
      },
    },
  };
  const ctx = {
    effect(callback) {
      callback();
      return () => {};
    },
    inject(dependencies, callback) {
      if (dependencies.includes('webServer') && dependencies.includes('connection')) callback(child);
    },
    tools: {
      register(definition) {
        tools.set(definition.name, definition);
        return () => {};
      },
    },
  };

  apply(ctx);
  assert.deepEqual([...tools.keys()].sort(), [
    'keep_notes_add_note',
    'keep_notes_add_todo',
    'keep_notes_list',
    'keep_notes_remove',
    'keep_notes_update_note',
    'keep_notes_update_todo',
  ]);
  assert.deepEqual([...routes.keys()].sort(), [
    '/dsh-keep-notes/init',
    '/dsh-keep-notes/ops',
    '/dsh-keep-notes/state',
  ]);
  for (const route of routes.values()) {
    assert.equal(route.kind, 'exact');
    assert.equal(typeof route.handler, 'function');
  }
});

test('the HTTP API initializes, writes and reads the same store', async () => {
  const store = await tempStore();
  const routes = new Map(
    createBoardRoutes(store, { admit: () => ({ peer: {} }) }).map((route) => [route.path, route]),
  );

  const invoke = async (route, method, body, headers = { 'content-type': 'application/json' }) => {
    const request = Readable.from(body ? [Buffer.from(JSON.stringify(body))] : []);
    request.method = method;
    request.url = route.path;
    request.headers = headers;
    let status = 0;
    let payload = '';
    const response = {
      writeHead(code) {
        status = code;
      },
      end(chunk) {
        payload = chunk ? String(chunk) : '';
      },
    };
    await route.handler(request, response);
    return { status, body: payload ? JSON.parse(payload) : null };
  };

  const denied = new Map(
    createBoardRoutes(store, { admit: () => ({ rejection: 401 }) }).map((route) => [route.path, route]),
  );
  const unauthenticated = await invoke(denied.get('/dsh-keep-notes/state'), 'GET');
  assert.equal(unauthenticated.status, 401);

  const rejected = await invoke(
    routes.get('/dsh-keep-notes/ops'),
    'POST',
    { ops: [] },
    { 'content-type': 'text/plain' },
  );
  assert.equal(rejected.status, 400);

  const init = await invoke(
    routes.get('/dsh-keep-notes/init'),
    'POST',
    { todos: [{ id: 't-api', text: 'from panel', date: null }], notes: [] },
  );
  assert.equal(init.status, 200);
  assert.equal(init.body.todos[0].id, 't-api');

  const ops = await invoke(routes.get('/dsh-keep-notes/ops'), 'POST', {
    ops: [{ type: 'addTodo', opId: 'api-1', todo: { id: 't-api-2', text: 'from agent', date: null } }],
  });
  assert.equal(ops.status, 200);
  assert.equal(ops.body.todos.length, 2);

  const state = await invoke(routes.get('/dsh-keep-notes/state'), 'GET');
  assert.equal(state.status, 200);
  assert.equal(state.body.revision, ops.body.revision);
  assert.equal(state.body.todos.length, 2);
});

