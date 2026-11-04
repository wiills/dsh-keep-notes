    /* ------------------------------------------------------------------ */
    /* Host sync                                                           */
    /* ------------------------------------------------------------------ */

    /*
     * Keeps the localStorage board as an offline cache and sends item ops to the
     * Host. Ops carry an id, so a retried request cannot duplicate an item.
     */
    function createBoardSync(board) {
      const API = '/dsh-keep-notes';
      const POLL_MS = 4000;
      const MAX_QUEUE = 200;
      const MAX_BATCH = 100;
      let queue = [];
      let started = false;
      let initialized = false;
      let initializing = false;
      let flushing = false;
      let lastRevision = -1;
      let timer = null;
      let onFocus = null;
      let onVisibility = null;

      const loadQueue = () => {
        try {
          const raw = window.localStorage.getItem(SYNC_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed)
            ? parsed.filter((op) => op && typeof op === 'object' && typeof op.opId === 'string')
            : [];
        } catch (error) {
          return [];
        }
      };

      const saveQueue = () => {
        try {
          window.localStorage.setItem(SYNC_KEY, JSON.stringify(queue));
        } catch (error) {
          /* The board write already reports storage pressure. */
        }
      };

      queue = loadQueue();

      const request = async (method, path, body) => {
        const response = await window.fetch(API + path, {
          method: method,
          cache: 'no-store',
          credentials: 'same-origin',
          headers: body
            ? { accept: 'application/json', 'content-type': 'application/json' }
            : { accept: 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
          let detail = '';
          try {
            const parsed = await response.json();
            detail = parsed && parsed.error ? String(parsed.error) : '';
          } catch (error) {
            detail = '';
          }
          throw new Error('keep-notes sync failed (' + response.status + ')' + (detail ? ': ' + detail : ''));
        }
        return response.json();
      };

      const applyState = (state) => {
        if (!state || typeof state.revision !== 'number') return;
        lastRevision = state.revision;
        board.applyRemote(state);
      };

      const init = async () => {
        if (initialized || initializing) return;
        initializing = true;
        try {
          const state = await request('GET', '/state');
          if (state.revision === 0) {
            const local = board.getSnapshot();
            applyState(await request('POST', '/init', { todos: local.todos, notes: local.notes }));
          } else {
            applyState(state);
          }
          initialized = true;
        } finally {
          initializing = false;
        }
      };

      const flush = async () => {
        if (!initialized || flushing || queue.length === 0) return;
        flushing = true;
        const batch = queue.slice(0, MAX_BATCH);
        try {
          const state = await request('POST', '/ops', { ops: batch });
          const sent = new Set(batch.map((op) => op.opId));
          queue = queue.filter((op) => !sent.has(op.opId));
          saveQueue();
          if (state && typeof state.revision === 'number') lastRevision = state.revision;
          if (queue.length === 0) applyState(state);
        } catch (error) {
          /* Keep the queue; the next tick retries it. */
        } finally {
          flushing = false;
        }
      };

      const poll = async () => {
        if (!initialized || flushing || queue.length > 0) return;
        try {
          const state = await request('GET', '/state');
          if (state.revision !== lastRevision) applyState(state);
        } catch (error) {
          /* Keep the local cache usable while the Host is unreachable. */
        }
      };

      const tick = () => {
        if (!started) return;
        if (!initialized) {
          init()
            .then(() => (queue.length ? flush() : undefined))
            .catch(() => {});
          return;
        }
        (queue.length ? flush() : poll()).catch(() => {});
      };

      const push = (op) => {
        if (!op || typeof op !== 'object') return;
        if (typeof op.opId !== 'string') op.opId = newId('op');
        queue.push(op);
        if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
        saveQueue();
        if (started && initialized) flush();
      };

      return {
        start() {
          if (started) return () => {};
          started = true;
          init()
            .then(() => (queue.length ? flush() : undefined))
            .catch(() => {});
          timer = window.setInterval(tick, POLL_MS);
          onFocus = () => tick();
          onVisibility = () => {
            if (!document.hidden) tick();
          };
          window.addEventListener('focus', onFocus);
          if (typeof document !== 'undefined' && document.addEventListener) {
            document.addEventListener('visibilitychange', onVisibility);
          }
          return () => {
            started = false;
            if (timer !== null) window.clearInterval(timer);
            timer = null;
            window.removeEventListener('focus', onFocus);
            if (typeof document !== 'undefined' && document.removeEventListener) {
              document.removeEventListener('visibilitychange', onVisibility);
            }
          };
        },
        push: push,
      };
    }
