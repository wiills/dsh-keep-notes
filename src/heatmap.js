    /* ------------------------------------------------------------------ */
    /* Activity heatmap                                                    */
    /* ------------------------------------------------------------------ */

    function ActivityHeatmap(props) {
      const { todos, notes, t, lang, scheme } = props;
      const weekCount = 16;
      const counts = React.useMemo(() => collectActivity(todos, notes), [todos, notes]);
      const today = todayIso();
      const firstColumn = addDays(weekStart(today), -(weekCount - 1) * 7);
      let total = 0;
      let maxCount = 0;

      for (let week = 0; week < weekCount; week += 1) {
        const columnStart = addDays(firstColumn, week * 7);
        for (let day = 0; day < 7; day += 1) {
          const iso = addDays(columnStart, day);
          if (iso > today) continue;
          const count = counts.get(iso) || 0;
          total += count;
          if (count > maxCount) maxCount = count;
        }
      }

      const columns = [];
      for (let week = 0; week < weekCount; week += 1) {
        const columnStart = addDays(firstColumn, week * 7);
        const cells = [];
        for (let day = 0; day < 7; day += 1) {
          const iso = addDays(columnStart, day);
          const future = iso > today;
          const count = counts.get(iso) || 0;
          const label = future
            ? ''
            : t('activityCell', {
                date: formatDate(lang, iso, { month: 'short', day: 'numeric' }),
                count: count,
              });
          cells.push(
            h('span', {
              key: iso,
              className: future ? 'kn-heat-cell is-future' : 'kn-heat-cell',
              style: future ? undefined : heatStyle(heatLevel(count, maxCount), scheme),
              role: future ? undefined : 'img',
              'aria-label': future ? undefined : label,
              'aria-hidden': future ? true : undefined,
              title: future ? undefined : label,
            }),
          );
        }
        columns.push(h('span', { key: columnStart, className: 'kn-heat-col' }, cells));
      }

      return h(
        'section',
        { className: 'kn-heat', 'aria-label': t('activity') },
        h(
          'div',
          { className: 'kn-heat-head' },
          h('span', { className: 'kn-heat-title' }, t('activity')),
          h('span', { className: 'kn-heat-total' }, t('activityTotal', { count: total })),
          h(
            'div',
            { className: 'kn-heat-legend', 'aria-hidden': true },
            h('span', null, t('less')),
            [0, 1, 2, 3, 4].map((level) =>
              h('span', {
                key: String(level),
                className: 'kn-heat-cell',
                style: heatStyle(level, scheme),
                'aria-hidden': true,
              }),
            ),
            h('span', null, t('more')),
          ),
        ),
        h('div', { className: 'kn-heat-grid' }, columns),
      );
    }
