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

      const begin = () => {
        setDraft(todo.text);
        setEditing(true);
      };
      const commit = () => {
        const value = draft.trim();
        if (value && value !== todo.text) props.onRename(todo.id, value);
        setEditing(false);
      };

      if (editing) {
        return h(
          'li',
          { className: 'kn-todo is-editing' },
          h('input', {
            className: 'kn-todo-edit',
            type: 'text',
            value: draft,
            maxLength: MAX_TODO_TEXT,
            autoFocus: true,
            'aria-label': t('editTodo'),
            onChange: (event) => setDraft(event.target.value),
            onBlur: commit,
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
        );
      }

      return h(
        'li',
        { className: cx('kn-todo', todo.done && 'is-done') },
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
            onRename: props.onRename,
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
          onRename: props.onRename,
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
          onRename: props.onRename,
        }),
        h(TodoInput, {
          placeholder: t('todoPlaceholder'),
          label: t('addTodo'),
          onAdd: (text) => props.onAdd(text),
        }),
      );
    }
