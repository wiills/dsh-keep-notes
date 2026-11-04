    function createBoard(lang) {
      const loaded = readBoard(lang);
      let state = {
        todos: loaded.todos,
        notes: loaded.notes,
        appearance: loaded.appearance,
        storageIssue: loaded.storageIssue,
      };
      let imagesPersisted = loaded.imagesPersisted;
      let legacyAppearance = loaded.legacyAppearance;
      let writtenMeta = { dim: state.appearance.dim, mode: state.appearance.mode };
      const listeners = new Set();
      let sync = null;

      const notify = () => listeners.forEach((listener) => listener());
      const push = (op) => {
        if (sync) sync.push(op);
      };

      const writeBoard = () => {
        try {
          const payload = { version: 2, todos: state.todos, notes: state.notes };
          if (legacyAppearance) payload.appearance = state.appearance;
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
          return true;
        } catch (error) {
          return false;
        }
      };

      const writeImages = (appearance) => {
        const payload = {
          version: 3,
          header: appearance.header || '',
          todos: appearance.todos || '',
          notes: appearance.notes || '',
        };
        const raw = JSON.stringify(payload);
        if (raw.length > MAX_IMAGES_TOTAL) return false;
        try {
          window.localStorage.setItem(IMAGES_KEY, raw);
          return true;
        } catch (error) {
          return false;
        }
      };

      const writeMeta = (appearance) => {
        try {
          window.localStorage.setItem(
            APPEARANCE_KEY,
            JSON.stringify({ version: 3, dim: appearance.dim, mode: appearance.mode }),
          );
          return true;
        } catch (error) {
          return false;
        }
      };

      const persistAppearance = (appearance) => {
        let ok = true;
        if (!hasImages(appearance)) imagesPersisted = true;
        if (!imagesPersisted) {
          if (writeImages(appearance)) imagesPersisted = true;
          else ok = false;
        }
        if (imagesPersisted) {
          if (!writeMeta(appearance)) ok = false;
        } else {
          /* A legacy user without room for the split keys keeps the combined
             shape, which is the only complete copy of the images. */
          try {
            window.localStorage.setItem(
              APPEARANCE_KEY,
              JSON.stringify({
                version: 3,
                dim: appearance.dim,
                mode: appearance.mode,
                header: appearance.header || '',
                todos: appearance.todos || '',
                notes: appearance.notes || '',
              }),
            );
            ok = true;
          } catch (error) {
            ok = false;
          }
        }
        if (ok) legacyAppearance = false;
        return ok;
      };

      const commit = (next) => {
        state = { ...state, ...next };
        let persisted = writeBoard();
        const meta = { dim: state.appearance.dim, mode: state.appearance.mode };
        if (meta.dim !== writtenMeta.dim || meta.mode !== writtenMeta.mode) {
          if (persistAppearance(state.appearance)) writtenMeta = meta;
          else persisted = false;
        }
        state = { ...state, storageIssue: state.storageIssue || !persisted };
        notify();
        return persisted;
      };

      const updateTodos = (change) => commit({ ...state, todos: change(state.todos) });
      const updateNotes = (change) => commit({ ...state, notes: change(state.notes) });

      return {
        getSnapshot() {
          return state;
        },
        subscribe(listener) {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        attachSync(next) {
          sync = next;
        },
        applyRemote(snapshot) {
          if (!snapshot || !Array.isArray(snapshot.todos) || !Array.isArray(snapshot.notes)) return;
          state = {
            ...state,
            todos: snapshot.todos.map(sanitizeTodo).filter(Boolean),
            notes: snapshot.notes.map(sanitizeNote).filter(Boolean),
          };
          if (!writeBoard()) state = { ...state, storageIssue: true };
          notify();
        },
        addTodo(date, text, color) {
          const value = String(text || '').trim().slice(0, MAX_TODO_TEXT);
          if (!value) return false;
          const now = Date.now();
          const todo = {
            id: newId('t'),
            text: value,
            date: date,
            done: false,
            color: ITEM_COLORS.indexOf(color) >= 0 ? color : 'default',
            createdAt: now,
            updatedAt: now,
            completedAt: null,
          };
          const saved = updateTodos((todos) => todos.concat([todo]));
          push({ type: 'addTodo', todo: todo });
          return saved;
        },
        toggleTodo(id) {
          const todo = state.todos.find((item) => item.id === id);
          if (!todo) return false;
          const saved = updateTodos((todos) =>
            todos.map((item) =>
              item.id === id
                ? { ...item, done: !item.done, updatedAt: Date.now(), completedAt: item.done ? null : Date.now() }
                : item,
            ),
          );
          push({ type: 'updateTodo', id: id, done: !todo.done });
          return saved;
        },
        updateTodo(id, patch) {
          const nextPatch = {};
          if (typeof patch.text === 'string') {
            const value = patch.text.trim().slice(0, MAX_TODO_TEXT);
            if (!value) return false;
            nextPatch.text = value;
          }
          if (patch.color !== undefined) {
            nextPatch.color = ITEM_COLORS.indexOf(patch.color) >= 0 ? patch.color : 'default';
          }
          if (nextPatch.text === undefined && nextPatch.color === undefined) return false;
          const saved = updateTodos((todos) =>
            todos.map((todo) => (todo.id === id ? { ...todo, ...nextPatch, updatedAt: Date.now() } : todo)),
          );
          push(Object.assign({ type: 'updateTodo', id: id }, nextPatch));
          return saved;
        },
        removeTodo(id) {
          const saved = updateTodos((todos) => todos.filter((todo) => todo.id !== id));
          push({ type: 'removeTodo', id: id });
          return saved;
        },
        addNote(date, fixed, color, text) {
          const value = String(text || '').trim().slice(0, MAX_NOTE_TEXT);
          if (!value) return false;
          const now = Date.now();
          const note = {
            id: newId('n'),
            text: value,
            date: fixed ? null : date,
            fixed: fixed === true,
            color: ITEM_COLORS.indexOf(color) >= 0 ? color : 'default',
            createdAt: now,
            updatedAt: now,
          };
          const saved = updateNotes((notes) => notes.concat([note]));
          push({ type: 'addNote', note: note });
          return saved;
        },
        updateNote(id, patch) {
          const nextPatch = { ...patch };
          if (typeof nextPatch.text === 'string') nextPatch.text = nextPatch.text.slice(0, MAX_NOTE_TEXT);
          const saved = updateNotes((notes) =>
            notes.map((note) => (note.id === id ? { ...note, ...nextPatch, updatedAt: Date.now() } : note)),
          );
          push(Object.assign({ type: 'updateNote', id: id }, nextPatch));
          return saved;
        },
        removeNote(id) {
          const saved = updateNotes((notes) => notes.filter((note) => note.id !== id));
          push({ type: 'removeNote', id: id });
          return saved;
        },
        saveFixed(text, color) {
          const value = String(text || '').trim().slice(0, MAX_NOTE_TEXT);
          const tint = ITEM_COLORS.indexOf(color) >= 0 ? color : 'default';
          const existing = state.notes.find((note) => note.fixed === true);
          let saved = true;
          if (existing) {
            if (!value) {
              saved = updateNotes((notes) => notes.filter((note) => note.id !== existing.id));
            } else if (existing.text === value && existing.color === tint) {
              saved = true;
            } else {
              saved = updateNotes((notes) =>
                notes.map((note) =>
                  note.id === existing.id ? { ...note, text: value, color: tint, updatedAt: Date.now() } : note,
                ),
              );
            }
          } else if (value) {
            const now = Date.now();
            saved = updateNotes((notes) =>
              notes.concat([
                { id: newId('n'), text: value, date: null, fixed: true, color: tint, createdAt: now, updatedAt: now },
              ]),
            );
          }
          push({ type: 'saveFixed', text: value, color: tint });
          return saved;
        },
        setAppearance(patch) {
          const nextMeta = sanitizeMeta(Object.assign({}, state.appearance, patch || {}));
          if (nextMeta.dim === state.appearance.dim && nextMeta.mode === state.appearance.mode) return true;
          const appearance = Object.assign({}, state.appearance, {
            dim: nextMeta.dim,
            mode: nextMeta.mode,
          });
          state = { ...state, appearance: appearance };
          const persisted = persistAppearance(appearance);
          if (persisted) writtenMeta = nextMeta;
          state = { ...state, storageIssue: state.storageIssue || !persisted };
          notify();
          return persisted;
        },
        setImage(slot, dataUrl) {
          if (IMAGE_SLOTS.indexOf(slot) < 0) return false;
          const value = typeof dataUrl === 'string' ? dataUrl : '';
          if (!value || value.length > MAX_IMAGE_DATA_URL) return false;
          const appearance = Object.assign({}, state.appearance, { [slot]: value });
          const stored = writeImages(appearance);
          if (stored) imagesPersisted = true;
          state = { ...state, appearance: appearance, storageIssue: state.storageIssue || !stored };
          if (stored) {
            const metaOk = writeMeta(appearance);
            state = { ...state, storageIssue: state.storageIssue || !metaOk };
            if (metaOk) legacyAppearance = false;
          }
          notify();
          return stored;
        },
        clearImage(slot) {
          if (IMAGE_SLOTS.indexOf(slot) < 0) return false;
          const appearance = Object.assign({}, state.appearance, { [slot]: '' });
          const stored = writeImages(appearance);
          if (stored) imagesPersisted = true;
          state = { ...state, appearance: appearance, storageIssue: state.storageIssue || !stored };
          if (stored) {
            const metaOk = writeMeta(appearance);
            state = { ...state, storageIssue: state.storageIssue || !metaOk };
            if (metaOk) legacyAppearance = false;
          }
          notify();
          return stored;
        },
        clearImages() {
          const appearance = Object.assign({}, state.appearance, { header: '', todos: '', notes: '' });
          const stored = writeImages(appearance);
          if (stored) imagesPersisted = true;
          state = { ...state, appearance: appearance, storageIssue: state.storageIssue || !stored };
          if (stored) {
            const metaOk = writeMeta(appearance);
            state = { ...state, storageIssue: state.storageIssue || !metaOk };
            if (metaOk) legacyAppearance = false;
          }
          notify();
          return stored;
        },
        dismissStorageIssue() {
          if (!state.storageIssue) return;
          state = { ...state, storageIssue: false };
          notify();
        },
      };
    }
