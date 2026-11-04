    function MonthGrid(props) {
      const { t, lang, monthIso, todos, selected, today } = props;
      const [addingFor, setAddingFor] = React.useState(null);
      const cells = React.useMemo(() => monthCells(monthIso), [monthIso]);
      const headers = React.useMemo(() => weekdayHeaders(lang), [lang]);
      const byDate = React.useMemo(() => {
        const map = new Map();
        todos.forEach((todo) => {
          if (!todo.date) return;
          const list = map.get(todo.date);
          if (list) list.push(todo);
          else map.set(todo.date, [todo]);
        });
        return map;
      }, [todos]);
      const monthPrefix = monthIso.slice(0, 7);

      return h(
        'div',
        { className: 'kn-month' },
        h(
          'div',
          { className: 'kn-month-head' },
          h(
            'div',
            { className: 'kn-month-nav' },
            h(
              'button',
              {
                type: 'button',
                className: 'kn-btn kn-icon-btn',
                title: t('prevMonth'),
                'aria-label': t('prevMonth'),
                onClick: () => props.onShiftMonth(-1),
              },
              h(Chevron, { dir: 'left' }),
            ),
            h('span', { className: 'kn-month-title' }, formatDate(lang, monthIso, { year: 'numeric', month: 'long' })),
            h(
              'button',
              {
                type: 'button',
                className: 'kn-btn kn-icon-btn',
                title: t('nextMonth'),
                'aria-label': t('nextMonth'),
                onClick: () => props.onShiftMonth(1),
              },
              h(Chevron, { dir: 'right' }),
            ),
          ),
          h('span', { className: 'kn-count' }, t('monthHint')),
        ),
        h(
          'div',
          { className: 'kn-month-week' },
          headers.map((label, index) => h('span', { key: String(index) }, label)),
        ),
        h(
          'div',
          { className: 'kn-month-grid' },
          cells.map((iso) => {
            const list = byDate.get(iso) || [];
            const visible = list.slice(0, 3);
            const rest = list.length - visible.length;
            return h(
              'div',
              {
                key: iso,
                className: cx(
                  'kn-cell',
                  iso.slice(0, 7) !== monthPrefix && 'is-out',
                  iso === today && 'is-today',
                  iso === selected && 'is-selected',
                ),
                onClick: () => props.onSelect(iso),
              },
              h(
                'div',
                { className: 'kn-cell-head' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'kn-cell-day',
                    onClick: (event) => {
                      event.stopPropagation();
                      props.onSelect(iso);
                    },
                    'aria-pressed': iso === selected,
                    'aria-label':
                      formatDate(lang, iso, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long',
                      }) + (iso === today ? ' · ' + t('today') : ''),
                  },
                  String(parseIso(iso).getDate()),
                ),
                list.length > 0 ? h('span', { className: 'kn-cell-count' }, String(list.length)) : null,
              ),
              h(
                'div',
                { className: 'kn-cell-items' },
                visible.map((todo) =>
                  h(
                    'button',
                    {
                      key: todo.id,
                      type: 'button',
                      className: cx('kn-mini', todo.done && 'is-done'),
                      title: todo.text,
                      onClick: (event) => {
                        event.stopPropagation();
                        props.onToggle(todo.id);
                      },
                    },
                    h('span', { className: 'kn-mini-dot', 'aria-hidden': true }),
                    h('span', { className: 'kn-mini-text' }, todo.text),
                  ),
                ),
                rest > 0 ? h('span', { className: 'kn-more' }, t('moreCount', { count: rest })) : null,
              ),
              addingFor === iso
                ? h(TodoInput, {
                    placeholder: t('todoPlaceholder'),
                    label: t('addTodo'),
                    onAdd: (text) => {
                      props.onAdd(iso, text);
                      setAddingFor(null);
                    },
                  })
                : h(
                    'button',
                    {
                      type: 'button',
                      className: 'kn-cell-add',
                      title: t('addTodo'),
                      'aria-label': t('addTodo'),
                      onClick: (event) => {
                        event.stopPropagation();
                        setAddingFor(iso);
                      },
                    },
                    '+',
                  ),
            );
          }),
        ),
      );
    }
