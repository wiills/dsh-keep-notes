    /* ------------------------------------------------------------------ */
    /* Mini month calendar (header corner)                                 */
    /* ------------------------------------------------------------------ */

    function MiniMonth(props) {
      const { lang, t, todos, selected, today, onPick } = props;
      const monthIso = React.useMemo(() => startOfMonth(today), [today]);
      const cells = React.useMemo(() => monthCells(monthIso), [monthIso]);
      const headers = React.useMemo(() => weekdayHeaders(lang, 'narrow'), [lang]);
      const marks = React.useMemo(() => {
        const map = new Map();
        todos.forEach((todo) => {
          if (!todo.date) return;
          const current = map.get(todo.date);
          if (current === undefined) map.set(todo.date, todo.done ? 'done' : 'open');
          else if (current === 'done' && !todo.done) map.set(todo.date, 'open');
        });
        return map;
      }, [todos]);
      const prefix = monthIso.slice(0, 7);

      return h(
        'div',
        { className: 'kn-mini-cal', role: 'group', 'aria-label': t('monthCalendar') },
        h(
          'div',
          { className: 'kn-mini-cal-head' },
          formatDate(lang, today, { year: 'numeric', month: 'short' }),
        ),
        h(
          'div',
          { className: 'kn-mini-cal-week' },
          headers.map((label, index) => h('span', { key: String(index) }, label)),
        ),
        h(
          'div',
          { className: 'kn-mini-cal-grid' },
          cells.map((iso) => {
            const mark = marks.get(iso);
            return h(
              'button',
              {
                key: iso,
                type: 'button',
                className: cx(
                  'kn-mini-cal-day',
                  iso.slice(0, 7) !== prefix && 'is-out',
                  iso === today && 'is-today',
                  iso === selected && 'is-selected',
                  mark !== undefined && 'has-todo',
                  mark === 'done' && 'is-all-done',
                ),
                title: formatDate(lang, iso, { month: 'long', day: 'numeric' }),
                'aria-label': formatDate(lang, iso, { month: 'long', day: 'numeric' }),
                onClick: () => onPick(iso),
              },
              String(parseIso(iso).getDate()),
            );
          }),
        ),
      );
    }
