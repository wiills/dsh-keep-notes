    /* ------------------------------------------------------------------ */
    /* Notes                                                               */
    /* ------------------------------------------------------------------ */

    function NoteCard(props) {
      const { note, t, lang } = props;
      const [editing, setEditing] = React.useState(false);
      const [draft, setDraft] = React.useState(note.text);
      const [color, setColor] = React.useState(note.color);

      const begin = () => {
        setDraft(note.text);
        setColor(note.color);
        setEditing(true);
      };
      const save = () => {
        const value = draft.trim();
        if (!value) {
          setEditing(false);
          return;
        }
        if (value !== note.text || color !== note.color) props.onUpdate(note.id, { text: value, color: color });
        setEditing(false);
      };

      if (editing) {
        return h(
          'article',
          { className: 'kn-note is-editing', style: { background: ITEM_TINTS[color] } },
          h('textarea', {
            className: 'kn-note-input',
            value: draft,
            maxLength: MAX_NOTE_TEXT,
            autoFocus: true,
            placeholder: t('notePlaceholder'),
            'aria-label': t('notePlaceholder'),
            onChange: (event) => setDraft(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                setEditing(false);
              } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                save();
              }
            },
          }),
          h(ColorSwatches, { t: t, value: color, onChange: (id) => setColor(id) }),
          h(
            'div',
            { className: 'kn-note-actions' },
            h('button', { type: 'button', className: 'kn-btn kn-primary', onClick: save }, t('save')),
            h('button', { type: 'button', className: 'kn-btn', onClick: () => setEditing(false) }, t('cancel')),
            h(
              'button',
              { type: 'button', className: 'kn-btn kn-danger', onClick: () => props.onRemove(note.id) },
              t('delete'),
            ),
          ),
        );
      }

      return h(
        'article',
        { className: 'kn-note', style: { background: ITEM_TINTS[note.color] || ITEM_TINTS.default } },
        h(
          'button',
          { type: 'button', className: 'kn-note-text', title: t('editNote'), onClick: begin },
          note.text,
        ),
        h(
          'div',
          { className: 'kn-note-foot' },
          h(
            'span',
            { className: 'kn-note-time' },
            formatDate(lang, isoOf(new Date(note.updatedAt)), { month: 'short', day: 'numeric' }),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'kn-x',
              title: t('deleteNote'),
              'aria-label': t('deleteNote'),
              onClick: () => props.onRemove(note.id),
            },
            '×',
          ),
        ),
      );
    }

    function NoteComposer(props) {
      const { t } = props;
      const [text, setText] = React.useState('');
      const [color, setColor] = React.useState('yellow');

      const submit = () => {
        const value = text.trim();
        if (!value) {
          props.onCancel();
          return;
        }
        props.onSubmit(value, color);
      };

      return h(
        'article',
        { className: 'kn-note is-editing', style: { background: ITEM_TINTS[color] } },
        h('textarea', {
          className: 'kn-note-input',
          value: text,
          maxLength: MAX_NOTE_TEXT,
          autoFocus: true,
          placeholder: t('notePlaceholder'),
          'aria-label': t('notePlaceholder'),
          onChange: (event) => setText(event.target.value),
          onKeyDown: (event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              props.onCancel();
            } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              submit();
            }
          },
        }),
        h(ColorSwatches, { t: t, value: color, onChange: (id) => setColor(id) }),
        h(
          'div',
          { className: 'kn-note-actions' },
          h('button', { type: 'button', className: 'kn-btn kn-primary', onClick: submit }, t('save')),
          h('button', { type: 'button', className: 'kn-btn', onClick: props.onCancel }, t('cancel')),
        ),
      );
    }

    function NotesZone(props) {
      const { t, notes } = props;
      const [composing, setComposing] = React.useState(false);

      return h(
        'div',
        { className: cx('kn-zone', props.className) },
        h(
          'div',
          { className: 'kn-zone-head' },
          h('span', { className: 'kn-zone-title' }, props.title),
          h('span', { className: 'kn-zone-count' }, String(notes.length)),
        ),
        h(
          'div',
          { className: 'kn-tiles' },
          notes.map((note) =>
            h(NoteCard, {
              key: note.id,
              note: note,
              t: t,
              lang: props.lang,
              onUpdate: props.onUpdate,
              onRemove: props.onRemove,
            }),
          ),
          composing
            ? h(NoteComposer, {
                key: 'composer',
                t: t,
                onCancel: () => setComposing(false),
                onSubmit: (value, color) => {
                  props.onAdd(value, color);
                  setComposing(false);
                },
              })
            : h(
                'button',
                { key: 'new', type: 'button', className: 'kn-new-tile', onClick: () => setComposing(true) },
                h('span', { 'aria-hidden': true }, '+'),
                h('span', null, t('newNote')),
              ),
        ),
      );
    }

    function FixedNoteRail(props) {
      const { t, lang, note } = props;
      const [text, setText] = React.useState(note ? note.text : '');
      const [color, setColor] = React.useState(note ? note.color : 'blue');
      const dirty = React.useRef(false);

      React.useEffect(
        function syncFromStore() {
          if (dirty.current) return;
          setText(note ? note.text : '');
          setColor(note ? note.color : 'blue');
        },
        [note ? note.text : '', note ? note.color : ''],
      );

      const save = () => {
        const stored = props.onSave(text, color);
        dirty.current = stored === false;
      };
      const saveRef = React.useRef(save);
      saveRef.current = save;

      React.useEffect(
        function autosave() {
          if (!dirty.current) return undefined;
          const timer = setTimeout(() => {
            if (dirty.current) saveRef.current();
          }, 500);
          return () => clearTimeout(timer);
        },
        [text, color],
      );

      React.useEffect(
        function flushOnHide() {
          const flush = () => {
            if (dirty.current) saveRef.current();
          };
          const onVisibility = () => {
            if (document.visibilityState === 'hidden') flush();
          };
          window.addEventListener('pagehide', flush);
          document.addEventListener('visibilitychange', onVisibility);
          return () => {
            window.removeEventListener('pagehide', flush);
            document.removeEventListener('visibilitychange', onVisibility);
            flush();
          };
        },
        [],
      );

      return h(
        'aside',
        { className: 'kn-fixed' },
        h(
          'div',
          { className: 'kn-fixed-head' },
          h('span', { className: 'kn-fixed-title' }, t('fixedNote')),
          h('span', { className: 'kn-fixed-hint' }, t('fixedHint')),
        ),
        h(
          'div',
          { className: 'kn-fixed-body', style: { background: ITEM_TINTS[color] } },
          h('textarea', {
            className: 'kn-fixed-input',
            value: text,
            maxLength: MAX_NOTE_TEXT,
            placeholder: t('fixedPlaceholder'),
            'aria-label': t('fixedNote'),
            onChange: (event) => {
              dirty.current = true;
              setText(event.target.value);
            },
            onBlur: save,
            onKeyDown: (event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                save();
              }
            },
          }),
        ),
        h(ColorSwatches, {
          t: t,
          value: color,
          onChange: (id) => {
            const stored = props.onSave(text, id);
            setColor(id);
            dirty.current = stored === false;
          },
        }),
        note
          ? h(
              'div',
              { className: 'kn-fixed-foot' },
              t('fixedSaved', {
                date: formatDate(lang, isoOf(new Date(note.updatedAt)), { month: 'short', day: 'numeric' }),
              }),
            )
          : null,
      );
    }
