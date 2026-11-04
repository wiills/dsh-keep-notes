    function loadAppearance(fallback) {
      let meta = null;
      try {
        const raw = window.localStorage.getItem(APPEARANCE_KEY);
        if (raw) meta = JSON.parse(raw);
      } catch (error) {
        meta = null;
      }
      const fromFallback = !meta && Boolean(fallback);
      const source = meta || fallback || null;
      const storedImages = readStoredImages();
      if (storedImages) {
        return {
          appearance: Object.assign({}, sanitizeMeta(source), storedImages),
          imagesPersisted: true,
          fromFallback: fromFallback,
        };
      }
      const images = sanitizeImages(source);
      return {
        appearance: Object.assign({}, sanitizeMeta(source), images),
        imagesPersisted: !hasImages(images),
        fromFallback: fromFallback,
      };
    }

    function readBoard(lang) {
      let stored = null;
      let storageIssue = false;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) stored = JSON.parse(raw);
      } catch (error) {
        stored = null;
        storageIssue = true;
      }

      const loaded = loadAppearance(stored && stored.appearance);
      let legacyAppearance = false;
      if (loaded.fromFallback) {
        try {
          const payload = loaded.imagesPersisted
            ? { version: 3, dim: loaded.appearance.dim, mode: loaded.appearance.mode }
            : {
                version: 3,
                dim: loaded.appearance.dim,
                mode: loaded.appearance.mode,
                header: loaded.appearance.header,
                todos: loaded.appearance.todos,
                notes: loaded.appearance.notes,
              };
          window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(payload));
        } catch (error) {
          storageIssue = true;
          legacyAppearance = true;
        }
      }

      if (stored) {
        return {
          todos: Array.isArray(stored.todos) ? stored.todos.map(sanitizeTodo).filter(Boolean) : [],
          notes: Array.isArray(stored.notes) ? stored.notes.map(sanitizeNote).filter(Boolean) : [],
          appearance: loaded.appearance,
          imagesPersisted: loaded.imagesPersisted,
          storageIssue: storageIssue,
          legacyAppearance: legacyAppearance,
        };
      }

      const seeded = seedBoard(lang);
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: 2, todos: seeded.todos, notes: seeded.notes }),
        );
      } catch (error) {
        storageIssue = true;
      }
      return {
        todos: seeded.todos,
        notes: seeded.notes,
        appearance: loaded.appearance,
        imagesPersisted: loaded.imagesPersisted,
        storageIssue: storageIssue,
        legacyAppearance: legacyAppearance,
      };
    }
