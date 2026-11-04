    /* ------------------------------------------------------------------ */
    /* Todo pieces                                                         */
    /* ------------------------------------------------------------------ */

    function TodoInput(props) {
      const [text, setText] = React.useState('');
      const submit = () => {
        const value = text.trim();
        if (!value) return;
        props.onAdd(value);
        setText('');
      };
      return h(
        'div',
        { className: 'kn-add' },
        h('span', { className: 'kn-add-plus', 'aria-hidden': true }, '+'),
        h('input', {
          className: 'kn-add-input',
          type: 'text',
          value: text,
          maxLength: MAX_TODO_TEXT,
          placeholder: props.placeholder,
          'aria-label': props.label,
          onChange: (event) => setText(event.target.value),
          onKeyDown: (event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            } else if (event.key === 'Escape') {
              setText('');
            }
          },
        }),
      );
    }

    function TodoRow(props) {
      const { todo, t } = props;
      const [editing, setEditing] = React.useState(false);
      const [draft, setDraft] = React.useState(todo.text);
      const [color, setColor] = React.useState(todo.color);

      const begin = () => {
        setDraft(todo.text);
        setColor(todo.color);
        setEditing(true);
      };
      const commit = () => {
        const value = draft.trim();
        const changed = value !== todo.text || color !== todo.color;
        if (value && changed) props.onUpdate(todo.id, { text: value, color: color });
        setEditing(false);
      };
      /* Colours save on pick, so the row's tint follows the click at once. The
         editor stays open while focus moves inside it — picking a colour — and
         commits when focus leaves the row. */
      const paint = (id) => {
        setColor(id);
        props.onUpdate(todo.id, { color: id });
      };
      const leave = (event) => {
        const next = event.relatedTarget;
        if (next && event.currentTarget.contains(next)) return;
        commit();
      };

      if (editing) {
        return h(
          'li',
          {
            className: cx('kn-todo is-editing', todo.color !== 'default' && 'has-color'),
            style: itemTint(todo.color),
            onBlur: leave,
            onKeyDown: (event) => {
              if (event.key === 'Escape') setEditing(false);
            },
          },
          h('input', {
            className: 'kn-todo-edit',
            type: 'text',
            value: draft,
            maxLength: MAX_TODO_TEXT,
            autoFocus: true,
            'aria-label': t('editTodo'),
            onChange: (event) => setDraft(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commit();
              } else if (event.key === 'Escape') {
                event.preventDefault();
                setEditing(false);
              }
            },
          }),
          h(
            'div',
            { className: 'kn-todo-colors', onMouseDown: (event) => event.preventDefault() },
            h(ColorSwatches, { t: t, value: color, onChange: paint }),
          ),
        );
      }

      return h(
        'li',
        {
          className: cx('kn-todo', todo.done && 'is-done', todo.color !== 'default' && 'has-color'),
          style: itemTint(todo.color),
        },
        h(
          'button',
          {
            type: 'button',
            className: 'kn-check',
            'aria-pressed': todo.done,
            'aria-label': todo.done ? t('reopen') : t('complete'),
            title: todo.done ? t('reopen') : t('complete'),
            onClick: () => props.onToggle(todo.id),
          },
          todo.done ? h(CheckMark, null) : null,
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'kn-todo-text',
            title: t('editTodoHint'),
            'aria-label': t('editTodo') + ': ' + todo.text,
            onClick: begin,
          },
          todo.text,
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'kn-x',
            title: t('delete'),
            'aria-label': t('delete'),
            onClick: (event) => {
              event.stopPropagation();
              props.onRemove(todo.id);
            },
          },
          '×',
        ),
      );
    }

    function TodoList(props) {
      return h(
        'ul',
        { className: 'kn-todo-list' },
        props.todos.length === 0 ? h('li', { className: 'kn-empty' }, props.t('emptyTodos')) : null,
        props.todos.map((todo) =>
          h(TodoRow, {
            key: todo.id,
            todo: todo,
            t: props.t,
            onToggle: props.onToggle,
            onRemove: props.onRemove,
            onUpdate: props.onUpdate,
          }),
        ),
      );
    }

    function DayColumn(props) {
      const { iso, t, lang, todos } = props;
      const done = todos.filter((todo) => todo.done).length;
      return h(
        'div',
        {
          className: cx('kn-day', props.isToday && 'is-today', props.isSelected && 'is-selected'),
          onClick: () => props.onSelect(iso),
        },
        h(
          'button',
          {
            type: 'button',
            className: 'kn-col-head',
            onClick: (event) => {
              event.stopPropagation();
              props.onSelect(iso);
            },
            'aria-pressed': props.isSelected,
            'aria-label':
              formatDate(lang, iso, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) +
              (props.isToday ? ' · ' + t('today') : ''),
          },
          h('span', { className: 'kn-col-weekday' }, formatDate(lang, iso, { weekday: 'short' })),
          props.isToday ? h('span', { className: 'kn-today-badge' }, t('today')) : null,
          h('span', { className: 'kn-col-date' }, formatDate(lang, iso, { month: 'short', day: 'numeric' })),
        ),
        h('div', { className: 'kn-col-meta' }, t('doneOf', { done: done, total: todos.length })),
        h(TodoList, {
          t: t,
          todos: todos,
          onToggle: props.onToggle,
          onRemove: props.onRemove,
          onUpdate: props.onUpdate,
        }),
        h(TodoInput, {
          placeholder: t('todoPlaceholder'),
          label: t('addTodo'),
          onAdd: (text) => props.onAdd(text),
        }),
      );
    }

    function GlobalTodoColumn(props) {
      const { t, todos } = props;
      const done = todos.filter((todo) => todo.done).length;
      return h(
        'div',
        { className: 'kn-day kn-global-col', 'aria-label': t('globalTodos') },
        h(
          'div',
          { className: 'kn-col-head' },
          h('span', { className: 'kn-col-weekday' }, t('globalTodos')),
          h('span', { className: 'kn-col-date' }, t('doneOf', { done: done, total: todos.length })),
        ),
        h(TodoList, {
          t: t,
          todos: todos,
          onToggle: props.onToggle,
          onRemove: props.onRemove,
          onUpdate: props.onUpdate,
        }),
        h(TodoInput, {
          placeholder: t('todoPlaceholder'),
          label: t('addTodo'),
          onAdd: (text) => props.onAdd(text),
        }),
      );
    }
