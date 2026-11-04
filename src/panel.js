    /* ------------------------------------------------------------------ */
    /* Panel                                                               */
    /* ------------------------------------------------------------------ */

    class SlotBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { failed: false };
      }

      static getDerivedStateFromError() {
        return { failed: true };
      }

      render() {
        if (this.state.failed) {
          return h(
            'div',
            { className: 'kn-root' },
            h('style', null, CSS),
            h('div', { className: 'kn-fallback' }, this.props.t ? this.props.t('crash') : 'Notes panel failed.'),
          );
        }
        return this.props.children;
      }
    }

    function KeepNotesBody(props) {
      const { board, t, pickDirectory } = props;
      const schemeStore = props.scheme || FALLBACK_SCHEME;
      const scheme = React.useSyncExternalStore(schemeStore.subscribe, schemeStore.get);
      const todos = useBoardSlice(board, (snapshot) => snapshot.todos);
      const notes = useBoardSlice(board, (snapshot) => snapshot.notes);
      const appearance = useBoardSlice(board, (snapshot) => snapshot.appearance);
      const storageIssue = useBoardSlice(board, (snapshot) => snapshot.storageIssue);
      const lang = t('lang');
      const today = todayIso();
      const [view, setView] = React.useState('week');
      const [windowStart, setWindowStart] = React.useState(today);
      const [selected, setSelected] = React.useState(today);
      const [monthIso, setMonthIso] = React.useState(() => startOfMonth(today));
      const [settingsOpen, setSettingsOpen] = React.useState(false);
      const toolsEndRef = React.useRef(null);

      React.useEffect(() => {
        if (!settingsOpen) return undefined;
        const onKeyDown = (event) => {
          if (event.key === 'Escape') setSettingsOpen(false);
        };
        const onPointerDown = (event) => {
          const container = toolsEndRef.current;
          const target = event.target;
          if (container && target && container.contains(target)) return;
          setSettingsOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        document.addEventListener('pointerdown', onPointerDown, true);
        return () => {
          window.removeEventListener('keydown', onKeyDown);
          document.removeEventListener('pointerdown', onPointerDown, true);
        };
      }, [settingsOpen]);

      const days = React.useMemo(() => {
        const list = [];
        for (let index = 0; index < 7; index += 1) list.push(addDays(windowStart, index));
        return list;
      }, [windowStart]);

      const calendarNotes = React.useMemo(
        () => notes.filter((note) => note.fixed !== true && note.date === selected),
        [notes, selected],
      );
      const globalNotes = React.useMemo(
        () => notes.filter((note) => note.fixed !== true && note.date === null),
        [notes],
      );
      const fixedNote = notes.find((note) => note.fixed === true) || null;
      const openTodos = todos.filter((todo) => !todo.done).length;

      const selectDate = (iso) => {
        setSelected(iso);
        if (view === 'week') setWindowStart(iso);
        else setMonthIso(startOfMonth(iso));
      };
      const expand = () => {
        setView('month');
        setMonthIso(startOfMonth(selected));
      };
      const collapse = () => {
        setView('week');
        setWindowStart(selected);
      };

      const toggleTodo = (id) => board.toggleTodo(id);
      const removeTodo = (id) => board.removeTodo(id);
      const updateTodo = (id, patch) => board.updateTodo(id, patch);
      const updateNote = (id, patch) => board.updateNote(id, patch);
      const removeNote = (id) => board.removeNote(id);
      const hostScheme = scheme === 'light' ? 'light' : 'dark';
      const mode = appearance.mode === 'light' || appearance.mode === 'dark' ? appearance.mode : 'auto';
      const activeScheme = mode === 'auto' ? hostScheme : mode;
      const accents = TODO_PALETTE[activeScheme];
      const paper = mode === 'auto' ? PAPER[activeScheme] : FORCED_PAPER[activeScheme];
      const forcedTokens = mode !== 'auto' && activeScheme !== hostScheme ? FORCED_TOKENS[activeScheme] : null;

      return h(
        'div',
        {
          className: 'kn-root',
          style: Object.assign({}, forcedTokens || {}, {
            '--kn-dim': String(appearance.dim),
            '--kn-paper': paper.base,
            '--kn-grid': paper.line,
            '--kn-blue': accents.blue,
            '--kn-purple': accents.purple,
            '--kn-teal': accents.teal,
            '--kn-yellow': accents.yellow,
            '--kn-green': accents.green,
            '--kn-red': accents.red,
          }),
        },
        h('style', null, CSS),
        h(
          'header',
          {
            className: cx('kn-head', appearance.header && 'has-bg'),
            style: appearance.header ? { backgroundImage: 'url("' + appearance.header + '")' } : undefined,
          },
          h(
            'div',
            { className: 'kn-head-left' },
            h(
              'div',
              { className: 'kn-head-titles' },
              h('h1', { className: 'kn-title' }, t('title')),
              h(
                'p',
                { className: 'kn-sub' },
                t('subtitle', {
                  date: formatDate(lang, today, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  }),
                  todos: openTodos,
                  notes: notes.length,
                }),
              ),
              h(
                'div',
                { className: 'kn-tools' },
                h(
                  'div',
                  { className: 'kn-seg', role: 'group', 'aria-label': t('view') },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: cx('kn-seg-btn', view === 'week' && 'is-active'),
                      'aria-pressed': view === 'week',
                      onClick: collapse,
                    },
                    t('week'),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: cx('kn-seg-btn', view === 'month' && 'is-active'),
                      'aria-pressed': view === 'month',
                      onClick: expand,
                    },
                    t('month'),
                  ),
                ),
                h(
                  'div',
                  { className: 'kn-tools-end', ref: toolsEndRef },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: cx('kn-btn kn-icon-btn kn-gear', settingsOpen && 'is-active'),
                      title: t('settings'),
                      'aria-label': t('settings'),
                      'aria-expanded': settingsOpen,
                      'aria-haspopup': 'dialog',
                      'aria-controls': 'keep-notes-settings',
                      onClick: () => setSettingsOpen((open) => !open),
                    },
                    h(
                      'svg',
                      {
                        width: 16,
                        height: 16,
                        viewBox: '0 0 24 24',
                        fill: 'currentColor',
                        'aria-hidden': 'true',
                      },
                      h('path', {
                        d: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z',
                      }),
                    ),
                  ),
                  settingsOpen
                    ? h(BackgroundSettings, {
                        t: t,
                        appearance: appearance,
                        onChange: (patch) => board.setAppearance(patch),
                        onSetImage: (slot, dataUrl) => board.setImage(slot, dataUrl),
                        onClearImage: (slot) => board.clearImage(slot),
                        onClearImages: () => board.clearImages(),
                        onClose: () => setSettingsOpen(false),
                        pickDirectory: pickDirectory,
                      })
                    : null,
                ),
              ),
            ),
            h(MiniMonth, {
              lang: lang,
              t: t,
              todos: todos,
              selected: selected,
              today: today,
              onPick: selectDate,
            }),
          ),
          h(
            'div',
            { className: 'kn-head-right' },
            h(ActivityHeatmap, { todos: todos, notes: notes, t: t, lang: lang, scheme: activeScheme }),
          ),
        ),
        storageIssue
          ? h(
              'div',
              { className: 'kn-storage', role: 'status' },
              h('span', { className: 'kn-storage-text' }, t('storageIssue')),
              h(
                'button',
                {
                  type: 'button',
                  className: 'kn-btn kn-storage-dismiss',
                  onClick: () => board.dismissStorageIssue(),
                },
                t('storageDismiss'),
              ),
            )
          : null,
        h(
          'section',
          {
            className: cx('kn-section', appearance.todos && 'has-bg'),
            style: appearance.todos ? { backgroundImage: 'url("' + appearance.todos + '")' } : undefined,
          },
          h(
            'div',
            { className: 'kn-section-head' },
            h('h2', null, t('todos')),
            h('span', { className: 'kn-count' }, t('doneOf', { done: todos.length - openTodos, total: todos.length })),
            h('span', { className: 'kn-hint' }, view === 'month' ? t('monthHint') : t('weekHint')),
          ),
          h(
            'div',
            { className: 'kn-todo-body' },
            h(GlobalTodoColumn, {
              t: t,
              todos: todos.filter((todo) => todo.date === null),
              onAdd: (text) => board.addTodo(null, text),
              onToggle: toggleTodo,
              onRemove: removeTodo,
              onUpdate: updateTodo,
            }),
            view === 'week'
              ? h(
                  'div',
                  { className: 'kn-days' },
                  days.map((iso) =>
                    h(DayColumn, {
                      key: iso,
                      iso: iso,
                      t: t,
                      lang: lang,
                      isToday: iso === today,
                      isSelected: iso === selected,
                      todos: todos.filter((todo) => todo.date === iso),
                      onSelect: setSelected,
                      onAdd: (text) => {
                        board.addTodo(iso, text);
                        setSelected(iso);
                      },
                      onToggle: toggleTodo,
                      onRemove: removeTodo,
                      onUpdate: updateTodo,
                    }),
                  ),
                )
              : h(MonthGrid, {
                  monthIso: monthIso,
                  t: t,
                  lang: lang,
                  todos: todos,
                  selected: selected,
                  today: today,
                  onShiftMonth: (direction) => setMonthIso((current) => addMonths(current, direction)),
                  onSelect: selectDate,
                  onAdd: (date, text) => {
                    board.addTodo(date, text);
                    selectDate(date);
                  },
                  onToggle: toggleTodo,
                }),
          ),
        ),
        h(
          'section',
          {
            className: cx('kn-section kn-notes', appearance.notes && 'has-bg'),
            style: appearance.notes ? { backgroundImage: 'url("' + appearance.notes + '")' } : undefined,
          },
          h(
            'div',
            { className: 'kn-section-head' },
            h('h2', null, t('notes')),
            h('span', { className: 'kn-count' }, String(notes.length)),
            h(
              'div',
              { className: 'kn-note-nav' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'kn-btn kn-icon-btn',
                  title: t('prevDay'),
                  'aria-label': t('prevDay'),
                  onClick: () => selectDate(addDays(selected, -1)),
                },
                h(Chevron, { dir: 'left' }),
              ),
              h(
                'span',
                { className: 'kn-note-nav-label' },
                formatDate(lang, selected, { month: 'long', day: 'numeric', weekday: 'short' }),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'kn-btn kn-icon-btn',
                  title: t('nextDay'),
                  'aria-label': t('nextDay'),
                  onClick: () => selectDate(addDays(selected, 1)),
                },
                h(Chevron, { dir: 'right' }),
              ),
              h('button', { type: 'button', className: 'kn-btn', onClick: () => selectDate(today) }, t('today')),
            ),
          ),
          h(
            'div',
            { className: 'kn-notes-body' },
            h(NotesZone, {
              className: 'kn-zone-cal',
              title: t('calendarNotesOn', {
                date: formatDate(lang, selected, { month: 'long', day: 'numeric' }),
              }),
              notes: calendarNotes,
              t: t,
              lang: lang,
              onAdd: (text, color) => board.addNote(selected, false, color, text),
              onUpdate: updateNote,
              onRemove: removeNote,
            }),
            h(NotesZone, {
              className: 'kn-zone-global',
              title: t('globalNotes'),
              notes: globalNotes,
              t: t,
              lang: lang,
              onAdd: (text, color) => board.addNote(null, false, color, text),
              onUpdate: updateNote,
              onRemove: removeNote,
            }),
            h(FixedNoteRail, {
              t: t,
              lang: lang,
              note: fixedNote,
              onSave: (text, color) => board.saveFixed(text, color),
            }),
          ),
        ),
      );
    }

    function KeepNotesPage(props) {
      return h(SlotBoundary, { t: props.t }, h(KeepNotesBody, props));
    }

    function KeepNotesIcon(props) {
      const size = props.size || 20;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: props.active ? 1.9 : 1.6,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('rect', { x: 3.75, y: 3, width: 16.5, height: 18, rx: 3 }),
        h('path', { d: 'M7.75 8.25h8.5' }),
        h('path', { d: 'M7.75 12h4.5' }),
        h('path', { d: 'M8.25 16.2l2 2 4-4.75' }),
      );
    }
