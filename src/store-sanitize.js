    function sanitizeTodo(value) {
      if (!value || typeof value !== 'object') return null;
      if (typeof value.id !== 'string' || typeof value.text !== 'string') return null;
      const date = typeof value.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.date) ? value.date : null;
      return {
        id: value.id,
        text: value.text.slice(0, MAX_TODO_TEXT),
        date: date,
        done: value.done === true,
        createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
        completedAt: typeof value.completedAt === 'number' ? value.completedAt : null,
      };
    }

    function sanitizeNote(value) {
      if (!value || typeof value !== 'object') return null;
      if (typeof value.id !== 'string' || typeof value.text !== 'string') return null;
      const date = typeof value.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.date) ? value.date : null;
      return {
        id: value.id,
        text: value.text.slice(0, MAX_NOTE_TEXT),
        date: date,
        fixed: value.fixed === true,
        color: NOTE_COLORS.indexOf(value.color) >= 0 ? value.color : 'default',
        createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
        updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : Date.now(),
      };
    }

    function sanitizeMeta(value) {
      const source = value && typeof value === 'object' ? value : {};
      const dim =
        typeof source.dim === 'number' && source.dim >= 0.3 && source.dim <= 0.98
          ? source.dim
          : DEFAULT_APPEARANCE.dim;
      const mode = source.mode === 'dark' || source.mode === 'light' ? source.mode : 'auto';
      return { dim: dim, mode: mode };
    }

    function sanitizeImages(value) {
      const source = value && typeof value === 'object' ? value : {};
      const image = (input) =>
        typeof input === 'string' &&
        input.indexOf('data:image/') === 0 &&
        input.length <= MAX_LEGACY_IMAGE_DATA_URL
          ? input
          : '';
      return {
        header: image(source.header),
        todos: image(source.todos),
        notes: image(source.notes),
      };
    }

    function hasImages(appearance) {
      return Boolean(appearance.header || appearance.todos || appearance.notes);
    }

    function readStoredImages() {
      try {
        const raw = window.localStorage.getItem(IMAGES_KEY);
        if (!raw) return null;
        return sanitizeImages(JSON.parse(raw));
      } catch (error) {
        return null;
      }
    }
