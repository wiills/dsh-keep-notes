import assert from 'node:assert/strict';
import test from 'node:test';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(key, String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
}

const storage = new MemoryStorage();
const intervals = [];
let host = { revision: 0, todos: [], notes: [] };

function response(value) {
  return {
    ok: true,
    status: 200,
    async json() {
      return value;
    },
  };
}

function applyOp(op) {
  if (op.type === 'addTodo') {
    host = { ...host, todos: host.todos.concat([op.todo]), revision: host.revision + 1 };
  } else if (op.type === 'updateTodo') {
    host = {
      ...host,
      todos: host.todos.map((todo) => (todo.id === op.id ? { ...todo, done: op.done } : todo)),
      revision: host.revision + 1,
    };
  } else {
    host = { ...host, revision: host.revision + 1 };
  }
}

globalThis.document = {
  hidden: false,
  addEventListener() {},
  removeEventListener() {},
};

globalThis.window = {
  localStorage: storage,
  addEventListener() {},
  removeEventListener() {},
  setInterval(callback) {
    intervals.push(callback);
    return intervals.length;
  },
  clearInterval() {},
  async fetch(input, options = {}) {
    const path = String(input).replace('/dsh-keep-notes', '');
    const method = options.method || 'GET';
    if (path === '/state' && method === 'GET') return response(host);
    if (path === '/init' && method === 'POST') {
      const body = JSON.parse(options.body);
      host = { revision: 1, todos: body.todos, notes: body.notes };
      return response(host);
    }
    if (path === '/ops' && method === 'POST') {
      const body = JSON.parse(options.body);
      for (const op of body.ops) applyOp(op);
      return response(host);
    }
    throw new Error('unexpected request: ' + method + ' ' + path);
  },
  __ModuleLoader__: {
    load(spec) {
      globalThis.__syncClientSpec = spec;
    },
  },
};

await import(new URL('../client.js', import.meta.url));

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

const empty = JSON.stringify({ version: 2, todos: [], notes: [] });
storage.setItem('dsh.keep-notes.board.v1', empty);

const spec = globalThis.__syncClientSpec;
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

const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

test('the panel initializes the Host board and flushes local ops', async () => {
  await settle();
  assert.equal(host.revision, 1);

  board.addTodo(null, 'synced todo');
  await settle();
  assert.equal(host.todos.length, 1);
  assert.equal(host.todos[0].text, 'synced todo');
  assert.equal(board.getSnapshot().todos.length, 1);
  assert.equal(JSON.parse(storage.getItem('dsh.keep-notes.sync.v1')).length, 0);
});

test('a Host change reaches the panel through the poll', async () => {
  host = {
    revision: host.revision + 1,
    todos: host.todos.concat([{ id: 't-agent', text: 'from agent', date: null, done: false, createdAt: 1, completedAt: null }]),
    notes: [],
  };
  intervals[0]();
  await settle();
  assert.equal(board.getSnapshot().todos.some((todo) => todo.id === 't-agent'), true);
});

test('a large offline queue is sent in Host-sized batches', async () => {
  const before = host.todos.length;
  for (let index = 0; index < 120; index += 1) board.addTodo(null, 'bulk ' + index);
  await settle();
  for (let tick = 0; tick < 8 && host.todos.length < before + 120; tick += 1) {
    intervals[0]();
    await settle();
  }
  assert.equal(host.todos.length, before + 120);
  assert.equal(JSON.parse(storage.getItem('dsh.keep-notes.sync.v1')).length, 0);
  assert.equal(board.getSnapshot().todos.length, before + 120);
});
