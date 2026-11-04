    /* ------------------------------------------------------------------ */
    /* Dates                                                               */
    /* ------------------------------------------------------------------ */

    function pad2(value) {
      return String(value).padStart(2, '0');
    }

    function isoOf(date) {
      return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
    }

    function parseIso(iso) {
      const parts = String(iso).split('-');
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }

    function todayIso() {
      return isoOf(new Date());
    }

    function addDays(iso, amount) {
      const date = parseIso(iso);
      date.setDate(date.getDate() + amount);
      return isoOf(date);
    }

    function startOfMonth(iso) {
      return iso.slice(0, 8) + '01';
    }

    function addMonths(iso, amount) {
      const date = parseIso(startOfMonth(iso));
      date.setMonth(date.getMonth() + amount);
      return isoOf(date);
    }

    function mondayOffset(iso) {
      return (parseIso(iso).getDay() + 6) % 7;
    }

    function weekStart(iso) {
      return addDays(iso, -mondayOffset(iso));
    }

    function monthCells(monthIso) {
      const first = startOfMonth(monthIso);
      const firstDate = parseIso(first);
      const days = new Date(firstDate.getFullYear(), firstDate.getMonth() + 1, 0).getDate();
      const rows = Math.ceil((mondayOffset(first) + days) / 7);
      const gridStart = addDays(first, -mondayOffset(first));
      const cells = [];
      for (let index = 0; index < rows * 7; index += 1) cells.push(addDays(gridStart, index));
      return cells;
    }

    const dateFormatters = new Map();

    function formatDate(lang, iso, options) {
      const locale = lang === 'zh' ? 'zh-CN' : 'en-US';
      const key = locale + '|' + JSON.stringify(options);
      let formatter = dateFormatters.get(key);
      if (!formatter) {
        try {
          formatter = new Intl.DateTimeFormat(locale, options);
        } catch (error) {
          formatter = new Intl.DateTimeFormat('en-US', options);
        }
        dateFormatters.set(key, formatter);
      }
      return formatter.format(parseIso(iso));
    }

    function weekdayHeaders(lang, style) {
      const monday = weekStart(todayIso());
      const labels = [];
      for (let index = 0; index < 7; index += 1) {
        labels.push(formatDate(lang, addDays(monday, index), { weekday: style || 'short' }));
      }
      return labels;
    }
