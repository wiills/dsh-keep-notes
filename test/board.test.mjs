import assert from 'node:assert/strict';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

class MemoryStorage {
  constructor() {
    this.map = new Map();
    this.fail = false;
    this.failKeys = new Set();
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    if (this.fail || this.failKeys.has(key)) throw new Error('quota exceeded');
    this.map.set(key, String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

const storage = new MemoryStorage();
globalThis.window = {
  localStorage: storage,
  addEventListener() {},
  removeEventListener() {},
  __ModuleLoader__: {
    load(spec) {
      globalThis.__clientSpec = spec;
    },
  },
};

await import(new URL('../client.js', import.meta.url));

const spec = globalThis.__clientSpec;
assert.ok(spec, 'client.js should register with the module loader');

class Component {}

const React = {
  createElement() {
    return {};
  },
  Component,
  useState() {
    return [];
  },
  useEffect() {},
  useRef() {
    return { current: null };
  },
  useMemo(factory) {
    return factory();
  },
  useSyncExternalStore() {
    return null;
  },
};

function makeBoard(activeStorage) {
  globalThis.window.localStorage = activeStorage;
  const factory = spec.factory((name) => {
    if (name === 'react') return React;
    throw new Error('unexpected module: ' + name);
  });
  let board = null;
  const ctx = {
    effect(callback) {
      callback();
      return () => {};
    },
    get() {
      return undefined;
    },
    on() {
      return () => {};
    },
    locale: {
      register() {
        return () => {};
      },
      bind() {
        return (key) => key;
      },
      getLocale() {
        return { active: 'zh' };
      },
    },
    slots: {
      inject(name, callback) {
        callback();
        return () => {};
      },
      register(options) {
        if (options.name === 'main') board = options.inject().board;
        return () => {};
      },
    },
  };
  factory.apply(ctx);
  assert.ok(board, 'the main slot should receive a board');
  return board;
}

function emptyStorage() {
  const next = new MemoryStorage();
  next.setItem('dsh.keep-notes.board.v1', JSON.stringify({ version: 2, todos: [], notes: [] }));
  return next;
}

test('client module id matches the package name', () => {
  assert.equal(spec.id, 'dsh-keep-notes');
});

test('todo changes are written to the board key', () => {
  const store = emptyStorage();
  const board = makeBoard(store);
  const iso = '2026-11-04';
  assert.equal(board.addTodo(iso, 'hello'), true);
  let raw = JSON.parse(store.getItem('dsh.keep-notes.board.v1'));
  assert.equal(raw.todos.length, 1);
  assert.equal(raw.todos[0].text, 'hello');
  const id = raw.todos[0].id;

  assert.equal(board.toggleTodo(id), true);
  raw = JSON.parse(store.getItem('dsh.keep-notes.board.v1'));
  assert.equal(raw.todos[0].done, true);

  assert.equal(board.renameTodo(id, 'renamed'), true);
  raw = JSON.parse(store.getItem('dsh.keep-notes.board.v1'));
  assert.equal(raw.todos[0].text, 'renamed');

  assert.equal(board.removeTodo(id), true);
  assert.equal(JSON.parse(store.getItem('dsh.keep-notes.board.v1')).todos.length, 0);
});

test('a failed write is exposed instead of silently discarded', () => {
  const store = emptyStorage();
  const board = makeBoard(store);
  assert.equal(board.getSnapshot().storageIssue, false);

  store.fail = true;
  assert.equal(board.addTodo('2026-11-04', 'not saved'), false);
  assert.equal(board.getSnapshot().storageIssue, true);

  board.dismissStorageIssue();
  assert.equal(board.getSnapshot().storageIssue, false);
});

test('clearing the fixed note removes it instead of leaving an empty note', () => {
  const store = emptyStorage();
  const board = makeBoard(store);

  assert.equal(board.saveFixed('pinned', 'blue'), true);
  assert.equal(board.getSnapshot().notes.filter((note) => note.fixed).length, 1);

  assert.equal(board.saveFixed('', 'blue'), true);
  assert.equal(board.getSnapshot().notes.filter((note) => note.fixed).length, 0);
});

test('appearance metadata and images are stored under separate keys', () => {
  const store = emptyStorage();
  const board = makeBoard(store);
  const image = 'data:image/jpeg;base64,AAAA';

  assert.equal(board.setAppearance({ dim: 0.5 }), true);
  assert.equal(JSON.parse(store.getItem('dsh.keep-notes.appearance.v1')).dim, 0.5);
  assert.equal(store.getItem('dsh.keep-notes.images.v1'), null);

  assert.equal(board.setImage('header', image), true);
  assert.equal(JSON.parse(store.getItem('dsh.keep-notes.images.v1')).header, image);
  assert.equal(JSON.parse(store.getItem('dsh.keep-notes.appearance.v1')).header, undefined);

  assert.equal(board.clearImage('header'), true);
  assert.equal(JSON.parse(store.getItem('dsh.keep-notes.images.v1')).header, '');
});

test('a legacy appearance value with embedded images is split on the next write', () => {
  const store = emptyStorage();
  const image = 'data:image/jpeg;base64,BBBB';
  store.setItem(
    'dsh.keep-notes.appearance.v1',
    JSON.stringify({ header: image, dim: 0.9, mode: 'dark' }),
  );
  const board = makeBoard(store);
  assert.equal(board.getSnapshot().appearance.header, image);

  assert.equal(board.setAppearance({ dim: 0.8 }), true);
  assert.equal(JSON.parse(store.getItem('dsh.keep-notes.images.v1')).header, image);
  assert.equal(JSON.parse(store.getItem('dsh.keep-notes.appearance.v1')).header, undefined);
});

test('a legacy appearance inside the board is copied out before the board is rewritten', () => {
  const store = new MemoryStorage();
  const image = 'data:image/jpeg;base64,CCCC';
  store.setItem(
    'dsh.keep-notes.board.v1',
    JSON.stringify({
      version: 2,
      todos: [],
      notes: [],
      appearance: { header: image, dim: 0.7, mode: 'light' },
    }),
  );
  const board = makeBoard(store);
  assert.equal(board.getSnapshot().appearance.header, image);

  assert.equal(board.addTodo('2026-11-04', 'after migration'), true);
  const boardPayload = JSON.parse(store.getItem('dsh.keep-notes.board.v1'));
  assert.equal(boardPayload.appearance, undefined);
  assert.equal(JSON.parse(store.getItem('dsh.keep-notes.appearance.v1')).header, image);
});

test('oversized images are rejected', () => {
  const store = emptyStorage();
  const board = makeBoard(store);
  const huge = 'data:image/jpeg;base64,' + 'A'.repeat(1200001);
  assert.equal(board.setImage('header', huge), false);
});

test('text lengths are capped before they reach storage', () => {
  const store = emptyStorage();
  const board = makeBoard(store);

  assert.equal(board.addTodo('2026-11-04', 'x'.repeat(1001)), true);
  assert.equal(board.getSnapshot().todos[0].text.length, 1000);

  assert.equal(board.addNote(null, false, 'default', 'y'.repeat(20001)), true);
  assert.equal(board.getSnapshot().notes[0].text.length, 20000);
});
