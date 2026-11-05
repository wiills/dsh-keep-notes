    /* ------------------------------------------------------------------ */
    /* Plugin                                                              */
    /* ------------------------------------------------------------------ */

    const inject = ['slots', 'locale'];

    /* Every language DSH ships gets a dictionary; the slot's `t` seat follows the
       active locale and falls back to English for anything else. */
    const DICTIONARIES = { zh: zh, en: en, ja: ja, es: es, fr: fr, de: de, ru: ru, pt: pt };

    function apply(ctx) {
      for (const id of Object.keys(DICTIONARIES)) {
        ctx.effect(() => ctx.locale.register(NS, id, DICTIONARIES[id]), 'keep-notes: ' + id + ' dictionary');
      }
      const t = ctx.locale.bind(NS);
      const board = createBoard(ctx.locale.getLocale().active);
      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        const sync = createBoardSync(board);
        board.attachSync(sync);
        ctx.effect(() => sync.start(), 'keep-notes: host sync');
      }

      const themeService = typeof ctx.get === 'function' ? ctx.get('theme') : null;
      const pickDirectory = () => {
        const uiWorkspace = typeof ctx.get === 'function' ? ctx.get('uiWorkspace') : null;
        if (!uiWorkspace || typeof uiWorkspace.pickDirectory !== 'function') {
          return Promise.reject(new Error('directory picker unavailable'));
        }
        return uiWorkspace.pickDirectory();
      };
      const readScheme = () => {
        try {
          const snapshot =
            themeService && typeof themeService.getTheme === 'function' ? themeService.getTheme() : null;
          const colorScheme = snapshot && snapshot.active ? snapshot.active.colorScheme : '';
          return colorScheme === 'light' ? 'light' : 'dark';
        } catch (error) {
          return 'dark';
        }
      };
      let scheme = readScheme();
      const schemeListeners = new Set();
      ctx.effect(() => {
        if (!themeService || typeof ctx.on !== 'function') return undefined;
        return ctx.on('theme/change', () => {
          const next = readScheme();
          if (next === scheme) return;
          scheme = next;
          schemeListeners.forEach((listener) => listener());
        });
      }, 'keep-notes: theme sync');
      const schemeStore = {
        get() {
          return scheme;
        },
        subscribe(listener) {
          schemeListeners.add(listener);
          return () => {
            schemeListeners.delete(listener);
          };
        },
      };

      ctx.slots.inject('main', () =>
        ctx.slots.register(
          {
            name: 'main',
            key: PANEL_ID,
            locale: NS,
            inject: () => ({ board: board, scheme: schemeStore, pickDirectory: pickDirectory }),
          },
          KeepNotesPage,
        ),
      );

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 5,
            locale: NS,
            label: () => t('panel'),
          },
          KeepNotesIcon,
        ),
      );
    }
