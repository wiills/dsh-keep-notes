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

      const notify = () => listeners.forEach((listener) => listener());

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
        addTodo(date, text) {
          const value = String(text || '').trim().slice(0, MAX_TODO_TEXT);
          if (!value) return false;
          return updateTodos((todos) =>
            todos.concat([
              { id: newId('t'), text: value, date: date, done: false, createdAt: Date.now(), completedAt: null },
            ]),
          );
        },
        toggleTodo(id) {
          return updateTodos((todos) =>
            todos.map((todo) =>
              todo.id === id ? { ...todo, done: !todo.done, completedAt: todo.done ? null : Date.now() } : todo,
            ),
          );
        },
        renameTodo(id, text) {
          const value = String(text || '').trim().slice(0, MAX_TODO_TEXT);
          if (!value) return false;
          return updateTodos((todos) => todos.map((todo) => (todo.id === id ? { ...todo, text: value } : todo)));
        },
        removeTodo(id) {
          return updateTodos((todos) => todos.filter((todo) => todo.id !== id));
        },
        addNote(date, fixed, color, text) {
          const value = String(text || '').trim().slice(0, MAX_NOTE_TEXT);
          if (!value) return false;
          const now = Date.now();
          return updateNotes((notes) =>
            notes.concat([
              {
                id: newId('n'),
                text: value,
                date: fixed ? null : date,
                fixed: fixed === true,
                color: NOTE_COLORS.indexOf(color) >= 0 ? color : 'default',
                createdAt: now,
                updatedAt: now,
              },
            ]),
          );
        },
        updateNote(id, patch) {
          const nextPatch = { ...patch };
          if (typeof nextPatch.text === 'string') nextPatch.text = nextPatch.text.slice(0, MAX_NOTE_TEXT);
          return updateNotes((notes) =>
            notes.map((note) => (note.id === id ? { ...note, ...nextPatch, updatedAt: Date.now() } : note)),
          );
        },
        removeNote(id) {
          return updateNotes((notes) => notes.filter((note) => note.id !== id));
        },
        saveFixed(text, color) {
          const value = String(text || '').trim().slice(0, MAX_NOTE_TEXT);
          const tint = NOTE_COLORS.indexOf(color) >= 0 ? color : 'default';
          const existing = state.notes.find((note) => note.fixed === true);
          if (existing) {
            if (!value) return updateNotes((notes) => notes.filter((note) => note.id !== existing.id));
            if (existing.text === value && existing.color === tint) return true;
            return updateNotes((notes) =>
              notes.map((note) =>
                note.id === existing.id ? { ...note, text: value, color: tint, updatedAt: Date.now() } : note,
              ),
            );
          }
          if (!value) return true;
          const now = Date.now();
          return updateNotes((notes) =>
            notes.concat([
              { id: newId('n'), text: value, date: null, fixed: true, color: tint, createdAt: now, updatedAt: now },
            ]),
          );
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
