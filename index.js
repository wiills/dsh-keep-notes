/**
 * Host half of the Keep-style notes & todos bundle.
 *
 * It owns the shared JSON board, exposes it to the agent as tools, and serves
 * the browser panel a small same-origin API. The browser keeps its localStorage
 * copy as an offline cache; the Host file is the source of truth once connected.
 */
import { BoardStore } from './host-store.js';
import { createKeepNotesTools } from './host-tools.js';

const STATE_ROUTE = '/dsh-keep-notes/state';
const INIT_ROUTE = '/dsh-keep-notes/init';
const OPS_ROUTE = '/dsh-keep-notes/ops';
const MAX_BODY_BYTES = 2_500_000;

export const inject = ['tools'];

function send(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const type = String((req.headers && req.headers['content-type']) || '').toLowerCase();
    if (!type.startsWith('application/json')) {
      reject(new Error('content-type must be application/json'));
      return;
    }
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error('invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function route(path, handler, admit) {
  return {
    kind: 'exact',
    path: path,
    handler: async (req, res) => {
      try {
        if (req.url !== path) {
          send(res, 404, { error: 'not found' });
          return;
        }
        const admission = admit(req);
        if (admission && admission.rejection) {
          send(res, admission.rejection, {
            error: admission.rejection === 401 ? 'authentication required' : 'request refused',
          });
          return;
        }
        await handler(req, res);
      } catch (error) {
        send(res, 400, { error: error && error.message ? error.message : 'request failed' });
      }
    },
  };
}

export function createBoardRoutes(store, options = {}) {
  const admit = options.admit;
  if (typeof admit !== 'function') throw new Error('createBoardRoutes requires an admit function');
  const authorize = (req) => admit(req);
  return [
    route(STATE_ROUTE, async (req, res) => {
      if (req.method !== 'GET') {
        send(res, 405, { error: 'method not allowed' });
        return;
      }
      send(res, 200, await store.list());
    }, authorize),
    route(INIT_ROUTE, async (req, res) => {
      if (req.method !== 'POST') {
        send(res, 405, { error: 'method not allowed' });
        return;
      }
      send(res, 200, await store.initialize(await readJson(req)));
    }, authorize),
    route(OPS_ROUTE, async (req, res) => {
      if (req.method !== 'POST') {
        send(res, 405, { error: 'method not allowed' });
        return;
      }
      const body = await readJson(req);
      send(res, 200, await store.applyOps(body && body.ops));
    }, authorize),
  ];
}

export function apply(ctx) {
  const store = new BoardStore();
  for (const definition of createKeepNotesTools(store)) {
    ctx.effect(() => ctx.tools.register(definition), 'keep-notes: ' + definition.name);
  }

  ctx.inject(['webServer', 'connection'], (child) => {
    child.effect(() => {
      const disposers = createBoardRoutes(store, {
        admit: (request) => child.connection.admit(request),
      }).map((route) => child.webServer.register(route));
      return () => {
        for (const dispose of disposers) dispose();
      };
    }, 'keep-notes: board api');
  });
}
