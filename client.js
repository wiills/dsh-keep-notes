/**
 * Browser half of the Keep-style notes & todos bundle.
 *
 * Renders one root-scoped main panel (key `keep-notes`) and its sidebar entry in
 * `sidebar.panellist`. The panel keeps its own board in browser storage, so the
 * Host contributes nothing but the Loader row.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-keep-notes',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'keep-notes';
    const PANEL_ID = 'keep-notes';
    const STORAGE_KEY = 'dsh.keep-notes.board.v1';
    const APPEARANCE_KEY = 'dsh.keep-notes.appearance.v1';

    const NOTE_COLORS = ['default', 'yellow', 'green', 'blue', 'purple', 'red'];
    /* Microsoft To Do palette: list colours for light and dark themes. */
    const TODO_PALETTE = {
      light: {
        blue: '#2564CF',
        purple: '#8764B8',
        teal: '#00B294',
        yellow: '#FFB900',
        green: '#498205',
        red: '#E74856',
      },
      dark: {
        blue: '#4F9CF9',
        purple: '#B69BE0',
        teal: '#35D0BE',
        yellow: '#FFC83D',
        green: '#7ECB6E',
        red: '#F2777F',
      },
    };
    /* Dark grid-paper page surfaces; the light theme gets warm paper. */
    const PAPER = {
      light: { base: '#FAF9F5', line: 'rgba(17, 24, 39, 0.05)' },
      dark: { base: '#0F141A', line: 'rgba(148, 163, 184, 0.09)' },
    };
    const NOTE_TINTS = {
      default: '',
      yellow: 'color-mix(in srgb, var(--kn-yellow, #FFB900) 18%, transparent)',
      green: 'color-mix(in srgb, var(--kn-green, #498205) 18%, transparent)',
      blue: 'color-mix(in srgb, var(--kn-blue, #2564CF) 18%, transparent)',
      purple: 'color-mix(in srgb, var(--kn-purple, #8764B8) 18%, transparent)',
      red: 'color-mix(in srgb, var(--kn-red, #E74856) 18%, transparent)',
    };
    const DEFAULT_APPEARANCE = { header: '', todos: '', notes: '', dim: 0.82 };
    const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
    const MAX_IMAGE_SIDE = 1440;
    const NOTE_SWATCH = {
      default: 'var(--dsw-alias-bg-layer-2)',
      yellow: 'var(--kn-yellow, #FFB900)',
      green: 'var(--kn-green, #498205)',
      blue: 'var(--kn-blue, #2564CF)',
      purple: 'var(--kn-purple, #8764B8)',
      red: 'var(--kn-red, #E74856)',
    };

    /* ------------------------------------------------------------------ */
    /* Dictionaries                                                        */
    /* ------------------------------------------------------------------ */

    const zh = {
      lang: 'zh',
      panel: '便签与待办',
      title: '便签 · 待办',
      subtitle: '{date} · {todos} 项待办 · {notes} 张便签',
      today: '今天',
      prevMonth: '上个月',
      nextMonth: '下个月',
      monthCalendar: '月历',
      prevDay: '前一天',
      nextDay: '后一天',
      week: '7 天',
      month: '月视图',
      collapse: '缩回',
      view: '视图',
      todos: '待办',
      notes: '便签',
      globalTodos: '全局待办',
      globalNotes: '全局便签',
      fixedNote: '固定便签',
      fixedHint: '自动保存',
      fixedPlaceholder: '随时记一笔…',
      fixedSaved: '已保存 · {date}',
      calendarNotesOn: '日历便签 · {date}',
      todoPlaceholder: '+ 待办',
      addTodo: '添加待办',
      newNote: '新建便签',
      notePlaceholder: '写点什么…',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      deleteNote: '删除便签',
      editNote: '编辑便签',
      complete: '标记完成',
      reopen: '标记未完成',
      editTodo: '编辑待办',
      editTodoHint: '双击编辑',
      doneOf: '{done}/{total} 已完成',
      moreCount: '还有 {count} 项',
      emptyTodos: '暂无待办',
      emptyNotes: '暂无便签',
      activity: '活动',
      activityTotal: '{count} 次',
      activityCell: '{date} · {count} 次活动',
      less: '少',
      more: '多',
      monthHint: '点击日期查看当天便签',
      weekHint: '点击某一天切换日历便签',
      colors: '颜色',
      colorDefault: '默认',
      colorYellow: '黄色',
      colorGreen: '绿色',
      colorBlue: '蓝色',
      colorPurple: '紫色',
      colorRed: '红色',
      settings: '背景设置',
      close: '关闭',
      settingsHint: '图片只保存在本机浏览器，建议使用横向图片。',
      headerImage: '标题栏',
      todoImage: '待办区',
      notesImage: '便签区',
      chooseImage: '选择图片',
      clearImage: '清除',
      noImage: '未设置',
      overlay: '遮罩',
      clearAll: '清除全部',
      processing: '处理中…',
      imageSaved: '已保存',
      imageNotSaved: '本地存储空间不足，图片仅本次有效',
      imageError: '无法读取这张图片，请换一张',
      imageTooLarge: '图片太大，请选择 10MB 以内的图片',
      crash: '便签面板渲染失败，切换页面后可重试。',
    };

    const en = {
      lang: 'en',
      panel: 'Notes & Todos',
      title: 'Notes · Todos',
      subtitle: '{date} · {todos} open todos · {notes} notes',
      today: 'Today',
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      monthCalendar: 'Month calendar',
      prevDay: 'Previous day',
      nextDay: 'Next day',
      week: '7 days',
      month: 'Month',
      collapse: 'Collapse',
      view: 'View',
      todos: 'Todos',
      notes: 'Notes',
      globalTodos: 'Global todos',
      globalNotes: 'Global notes',
      fixedNote: 'Pinned note',
      fixedHint: 'Auto-saved',
      fixedPlaceholder: 'Jot something down…',
      fixedSaved: 'Saved · {date}',
      calendarNotesOn: 'Calendar notes · {date}',
      todoPlaceholder: '+ Todo',
      addTodo: 'Add todo',
      newNote: 'New note',
      notePlaceholder: 'Write something…',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      deleteNote: 'Delete note',
      editNote: 'Edit note',
      complete: 'Mark done',
      reopen: 'Mark not done',
      editTodo: 'Edit todo',
      editTodoHint: 'Double-click to edit',
      doneOf: '{done}/{total} done',
      moreCount: '+{count} more',
      emptyTodos: 'No todos',
      emptyNotes: 'No notes',
      activity: 'Activity',
      activityTotal: '{count}',
      activityCell: '{date} · {count} activities',
      less: 'Less',
      more: 'More',
      monthHint: 'Pick a date to see its notes',
      weekHint: 'Click a day to switch calendar notes',
      colors: 'Color',
      colorDefault: 'Default',
      colorYellow: 'Yellow',
      colorGreen: 'Green',
      colorBlue: 'Blue',
      colorPurple: 'Purple',
      colorRed: 'Red',
      settings: 'Appearance',
      close: 'Close',
      settingsHint: 'Images stay in this browser. Wide pictures work best.',
      headerImage: 'Title bar',
      todoImage: 'Todo area',
      notesImage: 'Notes area',
      chooseImage: 'Choose image',
      clearImage: 'Clear',
      noImage: 'None',
      overlay: 'Overlay',
      clearAll: 'Clear all',
      processing: 'Working…',
      imageSaved: 'Saved',
      imageNotSaved: 'Browser storage is full; the image applies to this session only',
      imageError: 'That image could not be read',
      imageTooLarge: 'Choose an image under 10MB',
      crash: 'The notes panel failed to render. Switch pages to retry.',
    };

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

    /* ------------------------------------------------------------------ */
    /* Board store                                                         */
    /* ------------------------------------------------------------------ */

    let idSequence = 0;

    function newId(prefix) {
      idSequence += 1;
      return prefix + '-' + Date.now().toString(36) + '-' + idSequence.toString(36);
    }

    const SEED = {
      zh: {
        todo1: '双击待办文字可以改名',
        todo2: '点击圆圈即可标记完成',
        todo3: '切到「月视图」查看整月安排',
        todoGlobal: '全局待办固定在左侧，不随日期变化',
        note1: '日历便签跟着日历走：点选某一天，就能看到那天的便签。',
        note2: '全局便签一直都在，不绑日期。',
        note3: '这是最右侧的固定便签，随时记一笔。',
      },
      en: {
        todo1: 'Double-click a todo to rename it',
        todo2: 'Click the circle to mark it done',
        todo3: 'Switch to Month to see the whole month',
        todoGlobal: 'Global todos stay pinned on the left',
        note1: 'Calendar notes follow the calendar: pick a day to see its notes.',
        note2: 'Global notes are always here, not bound to a date.',
        note3: 'The pinned note on the right is always available.',
      },
    };

    function seedBoard(lang) {
      const text = SEED[lang] || SEED.en;
      const today = todayIso();
      const now = Date.now();
      const day = 86400000;
      return {
        todos: [
          { id: newId('t'), text: text.todo1, date: today, done: false, createdAt: now, completedAt: null },
          { id: newId('t'), text: text.todo2, date: today, done: true, createdAt: now - day, completedAt: now - 1200000 },
          { id: newId('t'), text: text.todo3, date: addDays(today, 2), done: false, createdAt: now, completedAt: null },
          { id: newId('t'), text: text.todoGlobal, date: null, done: false, createdAt: now, completedAt: null },
        ],
        notes: [
          { id: newId('n'), text: text.note1, date: today, fixed: false, color: 'yellow', createdAt: now - 7200000, updatedAt: now - 3600000 },
          { id: newId('n'), text: text.note2, date: null, fixed: false, color: 'green', createdAt: now - day * 2, updatedAt: now - day * 2 },
          { id: newId('n'), text: text.note3, date: null, fixed: true, color: 'blue', createdAt: now - day * 4, updatedAt: now - day * 4 },
        ],
      };
    }

    function sanitizeTodo(value) {
      if (!value || typeof value !== 'object') return null;
      if (typeof value.id !== 'string' || typeof value.text !== 'string') return null;
      const date = typeof value.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.date) ? value.date : null;
      return {
        id: value.id,
        text: value.text,
        date: date,
        done: value.done === true,
        createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
        completedAt: typeof value.completedAt === 'number' ? value.completedAt : null,
      };
    }

    function sanitizeNote(value) {
      if (!value || typeof value !== 'object') return null;
      if (typeof value.id !== 'string' || typeof value.text !== 'string') return null;
      const date = typeof value.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.date) ? value.date : null;
      return {
        id: value.id,
        text: value.text,
        date: date,
        fixed: value.fixed === true,
        color: NOTE_COLORS.indexOf(value.color) >= 0 ? value.color : 'default',
        createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
        updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : Date.now(),
      };
    }

    function sanitizeAppearance(value) {
      const source = value && typeof value === 'object' ? value : {};
      const image = (input) => (typeof input === 'string' ? input.slice(0, 3600000) : '');
      const dim =
        typeof source.dim === 'number' && source.dim >= 0.3 && source.dim <= 0.98
          ? source.dim
          : DEFAULT_APPEARANCE.dim;
      return { header: image(source.header), todos: image(source.todos), notes: image(source.notes), dim: dim };
    }

    function readBoard(lang) {
      let stored = null;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) stored = JSON.parse(raw);
      } catch (error) {
        stored = null;
      }

      let appearance = null;
      try {
        const rawAppearance = window.localStorage.getItem(APPEARANCE_KEY);
        if (rawAppearance) appearance = JSON.parse(rawAppearance);
      } catch (error) {
        appearance = null;
      }
      if (!appearance && stored && stored.appearance) {
        appearance = stored.appearance;
        try {
          window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance));
        } catch (error) {
          /* A legacy appearance stays in memory when the migration write fails. */
        }
      }

      if (stored) {
        return {
          todos: Array.isArray(stored.todos) ? stored.todos.map(sanitizeTodo).filter(Boolean) : [],
          notes: Array.isArray(stored.notes) ? stored.notes.map(sanitizeNote).filter(Boolean) : [],
          appearance: sanitizeAppearance(appearance),
        };
      }

      const seeded = seedBoard(lang);
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: 2, todos: seeded.todos, notes: seeded.notes }),
        );
      } catch (error) {
        /* The first-run board still renders when storage rejects the write. */
      }
      return { todos: seeded.todos, notes: seeded.notes, appearance: sanitizeAppearance(appearance) };
    }

    function createBoard(lang) {
      let state = readBoard(lang);
      let writtenAppearance = state.appearance;
      const listeners = new Set();

      const commit = (next) => {
        const appearanceChanged = next.appearance !== writtenAppearance;
        state = next;
        let persisted = true;
        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ version: 2, todos: state.todos, notes: state.notes }),
          );
        } catch (error) {
          persisted = false;
        }
        if (appearanceChanged) {
          writtenAppearance = state.appearance;
          try {
            window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(state.appearance));
          } catch (error) {
            persisted = false;
          }
        }
        listeners.forEach((listener) => listener());
        return persisted;
      };

      const updateTodos = (change) => commit({ ...state, todos: change(state.todos) });
      const updateNotes = (change) => commit({ ...state, notes: change(state.notes) });

      return {
        getSnapshot() {
          return state;
        },
        subscribe(listener) {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
        addTodo(date, text) {
          const value = String(text || '').trim();
          if (!value) return;
          updateTodos((todos) =>
            todos.concat([
              { id: newId('t'), text: value, date: date, done: false, createdAt: Date.now(), completedAt: null },
            ]),
          );
        },
        toggleTodo(id) {
          updateTodos((todos) =>
            todos.map((todo) =>
              todo.id === id ? { ...todo, done: !todo.done, completedAt: todo.done ? null : Date.now() } : todo,
            ),
          );
        },
        renameTodo(id, text) {
          const value = String(text || '').trim();
          if (!value) return;
          updateTodos((todos) => todos.map((todo) => (todo.id === id ? { ...todo, text: value } : todo)));
        },
        removeTodo(id) {
          updateTodos((todos) => todos.filter((todo) => todo.id !== id));
        },
        addNote(date, fixed, color, text) {
          const value = String(text || '').trim();
          if (!value) return;
          const now = Date.now();
          updateNotes((notes) =>
            notes.concat([
              {
                id: newId('n'),
                text: value,
                date: fixed ? null : date,
                fixed: fixed === true,
                color: NOTE_COLORS.indexOf(color) >= 0 ? color : 'default',
                createdAt: now,
                updatedAt: now,
              },
            ]),
          );
        },
        updateNote(id, patch) {
          updateNotes((notes) =>
            notes.map((note) => (note.id === id ? { ...note, ...patch, updatedAt: Date.now() } : note)),
          );
        },
        removeNote(id) {
          updateNotes((notes) => notes.filter((note) => note.id !== id));
        },
        saveFixed(text, color) {
          const value = String(text || '').trim();
          const tint = NOTE_COLORS.indexOf(color) >= 0 ? color : 'default';
          const existing = state.notes.find((note) => note.fixed === true);
          if (existing) {
            if (existing.text === value && existing.color === tint) return;
            updateNotes((notes) =>
              notes.map((note) =>
                note.id === existing.id ? { ...note, text: value, color: tint, updatedAt: Date.now() } : note,
              ),
            );
            return;
          }
          if (!value) return;
          const now = Date.now();
          updateNotes((notes) =>
            notes.concat([
              { id: newId('n'), text: value, date: null, fixed: true, color: tint, createdAt: now, updatedAt: now },
            ]),
          );
        },
        setAppearance(patch) {
          const next = { ...state.appearance };
          Object.keys(patch || {}).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(DEFAULT_APPEARANCE, key)) next[key] = patch[key];
          });
          return commit({ ...state, appearance: sanitizeAppearance(next) });
        },
      };
    }

    /* ------------------------------------------------------------------ */
    /* Small helpers                                                       */
    /* ------------------------------------------------------------------ */

    function cx() {
      const names = [];
      for (let index = 0; index < arguments.length; index += 1) {
        if (arguments[index]) names.push(arguments[index]);
      }
      return names.join(' ');
    }

    function cap(value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    function useBoardSlice(board, selector) {
      return React.useSyncExternalStore(board.subscribe, function read() {
        return selector(board.getSnapshot());
      });
    }

    function readImageFile(file, onReady, onError) {
      if (!file || typeof file.type !== 'string' || file.type.indexOf('image/') !== 0) {
        onError('type');
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        onError('size');
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => onError('read');
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => onError('decode');
        image.onload = () => {
          try {
            const width = image.naturalWidth || image.width;
            const height = image.naturalHeight || image.height;
            const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(width, height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(width * scale));
            canvas.height = Math.max(1, Math.round(height * scale));
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            onReady(canvas.toDataURL('image/jpeg', 0.82));
          } catch (error) {
            onError('encode');
          }
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    }

    function heatLevel(count, max) {
      if (count <= 0) return 0;
      const ceiling = Math.max(1, max || 1);
      const step = Math.ceil((count / ceiling) * 4);
      return Math.min(4, Math.max(1, step));
    }

    /* GitHub contribution palette: dark and light green ramps. */
    const HEAT_RAMP = {
      dark: ['#0e4429', '#006d32', '#26a641', '#39d353'],
      light: ['#9be9a8', '#40c463', '#30a14e', '#216e39'],
    };

    function heatStyle(level, scheme) {
      if (level <= 0) return { background: 'var(--dsw-alias-bg-layer-2)' };
      const ramp = HEAT_RAMP[scheme === 'light' ? 'light' : 'dark'];
      return { background: ramp[Math.min(level, 4) - 1] };
    }

    const FALLBACK_SCHEME = {
      get() {
        return 'dark';
      },
      subscribe() {
        return () => {};
      },
    };

    function collectActivity(todos, notes) {
      const counts = new Map();
      const bump = (iso) => {
        if (!iso) return;
        counts.set(iso, (counts.get(iso) || 0) + 1);
      };
      todos.forEach((todo) => {
        if (todo.done && typeof todo.completedAt === 'number') bump(isoOf(new Date(todo.completedAt)));
      });
      notes.forEach((note) => {
        const created = typeof note.createdAt === 'number' ? isoOf(new Date(note.createdAt)) : null;
        const updated = typeof note.updatedAt === 'number' ? isoOf(new Date(note.updatedAt)) : null;
        if (created) bump(created);
        if (updated && updated !== created) bump(updated);
      });
      return counts;
    }

    /* ------------------------------------------------------------------ */
    /* Icons                                                               */
    /* ------------------------------------------------------------------ */

    function Chevron(props) {
      const paths = {
        left: 'M10.5 3.5 5.5 9l5 5.5',
        right: 'M6 3.5 11 9l-5 5.5',
        up: 'M4 11 9 6l5 5',
        down: 'M4 7 9 12l5-5',
      };
      return h(
        'svg',
        {
          width: props.size || 13,
          height: props.size || 13,
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('path', { d: paths[props.dir] || paths.right }),
      );
    }

    function CheckMark() {
      return h(
        'svg',
        {
          width: 9,
          height: 9,
          viewBox: '0 0 12 12',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2.4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
        },
        h('path', { d: 'M2.6 6.3 4.9 8.6 9.5 3.4' }),
      );
    }

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
          'span',
          { className: 'kn-todo-text', title: t('editTodoHint'), onDoubleClick: begin },
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
          'div',
          { className: 'kn-col-head' },
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
                h('span', { className: 'kn-cell-day' }, String(parseIso(iso).getDate())),
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
          cells.push(
            h('span', {
              key: iso,
              className: future ? 'kn-heat-cell is-future' : 'kn-heat-cell',
              style: future ? undefined : heatStyle(heatLevel(count, maxCount), scheme),
              title: future
                ? undefined
                : t('activityCell', {
                    date: formatDate(lang, iso, { month: 'short', day: 'numeric' }),
                    count: count,
                  }),
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
            { className: 'kn-heat-legend' },
            h('span', null, t('less')),
            [0, 1, 2, 3, 4].map((level) =>
              h('span', { key: String(level), className: 'kn-heat-cell', style: heatStyle(level, scheme) }),
            ),
            h('span', null, t('more')),
          ),
        ),
        h('div', { className: 'kn-heat-grid' }, columns),
      );
    }

    /* ------------------------------------------------------------------ */
    /* Notes                                                               */
    /* ------------------------------------------------------------------ */

    function ColorSwatches(props) {
      const { t, value } = props;
      return h(
        'div',
        { className: 'kn-swatches', role: 'group', 'aria-label': t('colors') },
        NOTE_COLORS.map((id) =>
          h('button', {
            key: id,
            type: 'button',
            className: cx('kn-swatch', value === id && 'is-active'),
            style: { background: NOTE_SWATCH[id] },
            title: t('color' + cap(id)),
            'aria-label': t('color' + cap(id)),
            'aria-pressed': value === id,
            onClick: () => props.onChange(id),
          }),
        ),
      );
    }

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
          { className: 'kn-note is-editing', style: { background: NOTE_TINTS[color] } },
          h('textarea', {
            className: 'kn-note-input',
            value: draft,
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
        { className: 'kn-note', style: { background: NOTE_TINTS[note.color] || NOTE_TINTS.default } },
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
        { className: 'kn-note is-editing', style: { background: NOTE_TINTS[color] } },
        h('textarea', {
          className: 'kn-note-input',
          value: text,
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
        props.onSave(text, color);
        dirty.current = false;
      };

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
          { className: 'kn-fixed-body', style: { background: NOTE_TINTS[color] } },
          h('textarea', {
            className: 'kn-fixed-input',
            value: text,
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
            setColor(id);
            props.onSave(text, id);
            dirty.current = false;
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

    /* ------------------------------------------------------------------ */
    /* Background settings                                                 */
    /* ------------------------------------------------------------------ */

    function BackgroundSettings(props) {
      const { t, appearance, onChange, onClose } = props;
      const [status, setStatus] = React.useState('');
      const [pending, setPending] = React.useState('');
      const [dim, setDim] = React.useState(appearance.dim);

      React.useEffect(
        function syncDim() {
          setDim(appearance.dim);
        },
        [appearance.dim],
      );

      const commitDim = () => {
        if (Math.abs(dim - appearance.dim) > 0.001) onChange({ dim: dim });
      };

      const pick = (slot, file) => {
        if (!file) return;
        setPending(slot);
        setStatus('');
        readImageFile(
          file,
          (dataUrl) => {
            const saved = onChange({ [slot]: dataUrl });
            setPending('');
            setStatus(saved ? t('imageSaved') : t('imageNotSaved'));
          },
          (reason) => {
            setPending('');
            setStatus(reason === 'size' ? t('imageTooLarge') : t('imageError'));
          },
        );
      };

      const rows = [
        { slot: 'header', label: t('headerImage') },
        { slot: 'todos', label: t('todoImage') },
        { slot: 'notes', label: t('notesImage') },
      ];

      return h(
        'div',
        { className: 'kn-settings', role: 'dialog', 'aria-label': t('settings') },
        h(
          'div',
          { className: 'kn-set-head' },
          h('span', { className: 'kn-set-title' }, t('settings')),
          h(
            'button',
            {
              type: 'button',
              className: 'kn-set-close',
              'aria-label': t('close'),
              title: t('close'),
              onClick: onClose,
            },
            '×',
          ),
        ),
        h('p', { className: 'kn-set-hint' }, t('settingsHint')),
        rows.map((row) =>
          h(
            'div',
            { key: row.slot, className: 'kn-set-row' },
            h('div', {
              className: 'kn-set-thumb',
              style: appearance[row.slot] ? { backgroundImage: 'url("' + appearance[row.slot] + '")' } : undefined,
            }),
            h('span', { className: 'kn-set-label' }, row.label),
            h(
              'div',
              { className: 'kn-set-actions' },
              h(
                'label',
                { className: 'kn-btn kn-file-btn' },
                pending === row.slot ? t('processing') : t('chooseImage'),
                h('input', {
                  type: 'file',
                  accept: 'image/*',
                  className: 'kn-hidden-file',
                  onChange: (event) => {
                    const files = event.target.files;
                    const file = files && files[0] ? files[0] : null;
                    event.target.value = '';
                    pick(row.slot, file);
                  },
                }),
              ),
              appearance[row.slot]
                ? h(
                    'button',
                    { type: 'button', className: 'kn-btn', onClick: () => onChange({ [row.slot]: '' }) },
                    t('clearImage'),
                  )
                : null,
            ),
          ),
        ),
        h(
          'div',
          { className: 'kn-set-dim' },
          h('span', null, t('overlay')),
          h('input', {
            type: 'range',
            min: '0.3',
            max: '0.98',
            step: '0.02',
            value: String(dim),
            'aria-label': t('overlay'),
            onChange: (event) => setDim(Number(event.target.value)),
            onPointerUp: commitDim,
            onKeyUp: commitDim,
            onBlur: commitDim,
          }),
          h('span', { className: 'kn-set-value' }, Math.round(dim * 100) + '%'),
        ),
        status ? h('p', { className: 'kn-set-status' }, status) : null,
        h(
          'div',
          { className: 'kn-set-foot' },
          h(
            'button',
            {
              type: 'button',
              className: 'kn-btn',
              disabled: !appearance.header && !appearance.todos && !appearance.notes,
              onClick: () => {
                setStatus('');
                onChange({ header: '', todos: '', notes: '' });
              },
            },
            t('clearAll'),
          ),
        ),
      );
    }

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
      const { board, t } = props;
      const schemeStore = props.scheme || FALLBACK_SCHEME;
      const scheme = React.useSyncExternalStore(schemeStore.subscribe, schemeStore.get);
      const todos = useBoardSlice(board, (snapshot) => snapshot.todos);
      const notes = useBoardSlice(board, (snapshot) => snapshot.notes);
      const appearance = useBoardSlice(board, (snapshot) => snapshot.appearance);
      const lang = t('lang');
      const today = todayIso();
      const [view, setView] = React.useState('week');
      const [windowStart, setWindowStart] = React.useState(today);
      const [selected, setSelected] = React.useState(today);
      const [monthIso, setMonthIso] = React.useState(() => startOfMonth(today));
      const [settingsOpen, setSettingsOpen] = React.useState(false);

      React.useEffect(() => {
        if (!settingsOpen) return undefined;
        const onKeyDown = (event) => {
          if (event.key === 'Escape') setSettingsOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
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

      const pickDate = (iso) => {
        setSelected(iso);
        if (view === 'week') setWindowStart(iso);
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
      const renameTodo = (id, text) => board.renameTodo(id, text);
      const updateNote = (id, patch) => board.updateNote(id, patch);
      const removeNote = (id) => board.removeNote(id);
      const accents = TODO_PALETTE[scheme === 'light' ? 'light' : 'dark'];
      const paper = PAPER[scheme === 'light' ? 'light' : 'dark'];

      return h(
        'div',
        {
          className: 'kn-root',
          style: {
            '--kn-dim': String(appearance.dim),
            '--kn-paper': paper.base,
            '--kn-grid': paper.line,
            '--kn-blue': accents.blue,
            '--kn-purple': accents.purple,
            '--kn-teal': accents.teal,
            '--kn-yellow': accents.yellow,
            '--kn-green': accents.green,
            '--kn-red': accents.red,
          },
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
                  { className: 'kn-tools-end' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: cx('kn-btn kn-icon-btn kn-gear', settingsOpen && 'is-active'),
                      title: t('settings'),
                      'aria-label': t('settings'),
                      'aria-expanded': settingsOpen,
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
                        onClose: () => setSettingsOpen(false),
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
              onPick: pickDate,
            }),
          ),
          h(
            'div',
            { className: 'kn-head-right' },
            h(ActivityHeatmap, { todos: todos, notes: notes, t: t, lang: lang, scheme: scheme }),
          ),
        ),
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
              onRename: renameTodo,
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
                      onRename: renameTodo,
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
                  onSelect: setSelected,
                  onAdd: (date, text) => {
                    board.addTodo(date, text);
                    setSelected(date);
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
                  onClick: () => setSelected(addDays(selected, -1)),
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
                  onClick: () => setSelected(addDays(selected, 1)),
                },
                h(Chevron, { dir: 'right' }),
              ),
              h('button', { type: 'button', className: 'kn-btn', onClick: () => setSelected(today) }, t('today')),
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

    /* ------------------------------------------------------------------ */
    /* Styles                                                              */
    /* ------------------------------------------------------------------ */

    const CSS = `
.kn-root {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  min-height: 100%;
  overflow: auto;
  padding: 0 22px 30px;
  background-color: var(--kn-paper, var(--dsw-alias-bg-base));
  background-image:
    linear-gradient(to right, var(--kn-grid, rgba(148, 163, 184, .09)) 1px, transparent 1px),
    linear-gradient(to bottom, var(--kn-grid, rgba(148, 163, 184, .09)) 1px, transparent 1px);
  background-size: 24px 24px;
  background-attachment: local;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 1.45;
}
.kn-root *,
.kn-root *::before,
.kn-root *::after { box-sizing: border-box; }
.kn-head {
  position: relative;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin: 0 -22px;
  padding: 14px 22px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.kn-head.has-bg {
  background-color: var(--dsw-alias-bg-layer-1);
  background-size: cover;
  background-position: center;
}
.kn-head.has-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--dsw-alias-bg-base);
  opacity: var(--kn-dim, .82);
  pointer-events: none;
}
.kn-head.has-bg .kn-head-left,
.kn-head.has-bg .kn-head-right { position: relative; z-index: 1; }
.kn-head-left { display: flex; align-items: flex-start; gap: 14px; min-width: 0; flex: 1 1 auto; }
.kn-head-titles { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.kn-head-right {
  position: relative;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex: 0 0 auto;
}
.kn-title { margin: 0; font-size: 18px; font-weight: 650; letter-spacing: .01em; }
.kn-sub { margin: 0; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
.kn-mini-cal {
  flex: 0 0 auto;
  padding: 7px 8px 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1);
}
.kn-mini-cal-head {
  margin-bottom: 4px;
  text-align: center;
  font-size: 10.5px;
  font-weight: 650;
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
}
.kn-mini-cal-week { display: grid; grid-template-columns: repeat(7, 24px); gap: 2px; margin-bottom: 2px; }
.kn-mini-cal-week span {
  text-align: center;
  font-size: 9px;
  line-height: 1.2;
  color: var(--dsw-alias-label-secondary);
}
.kn-mini-cal-grid { display: grid; grid-template-columns: repeat(7, 24px); gap: 2px; }
.kn-mini-cal-day {
  position: relative;
  width: 24px;
  height: 14px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 9.5px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}
.kn-mini-cal-day.is-out { color: var(--dsw-alias-label-secondary); opacity: .45; }
.kn-mini-cal-day.is-selected { outline: 1px solid var(--kn-blue, var(--dsw-alias-brand-primary)); outline-offset: -1px; }
.kn-mini-cal-day.is-today {
  background: var(--kn-blue, var(--dsw-alias-brand-primary));
  color: var(--dsw-alias-bg-base);
  font-weight: 700;
}
.kn-mini-cal-day.has-todo::after {
  content: '';
  position: absolute;
  right: 2px;
  top: 2px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--kn-blue, var(--dsw-alias-brand-primary));
}
.kn-mini-cal-day.has-todo.is-all-done::after { background: var(--dsw-alias-state-success-primary); }
.kn-mini-cal-day.is-today.has-todo::after { background: var(--dsw-alias-bg-base); }
.kn-tools { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-start; padding-top: 6px; }
.kn-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  line-height: 1.3;
  padding: 5px 10px;
  cursor: pointer;
  white-space: nowrap;
}
.kn-btn:hover { background: var(--dsw-alias-bg-layer-2); }
.kn-btn:focus-visible { outline: 2px solid var(--kn-blue, var(--dsw-alias-brand-primary)); outline-offset: 1px; }
.kn-btn:disabled { opacity: .45; cursor: default; }
.kn-icon-btn { padding: 5px 7px; }
.kn-tools-end { position: relative; display: inline-flex; align-items: center; }
.kn-gear.is-active { background: var(--dsw-alias-bg-layer-2); border-color: var(--dsw-alias-border-l2); }
.kn-primary {
  background: var(--kn-blue, var(--dsw-alias-brand-primary));
  border-color: var(--kn-blue, var(--dsw-alias-brand-primary));
  color: var(--dsw-alias-bg-base);
}
.kn-primary:hover { background: var(--kn-blue, var(--dsw-alias-brand-primary)); opacity: .9; }
.kn-danger { color: var(--dsw-alias-state-error-primary); }
.kn-seg { display: inline-flex; gap: 2px; padding: 2px; border-radius: 9px; background: var(--dsw-alias-bg-layer-2); }
.kn-seg-btn {
  appearance: none;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 7px;
  cursor: pointer;
  white-space: nowrap;
}
.kn-seg-btn.is-active { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font-weight: 600; }
.kn-seg-btn:focus-visible { outline: 2px solid var(--kn-blue, var(--dsw-alias-brand-primary)); outline-offset: 1px; }
.kn-heat { flex: 1 1 auto; display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 6px; }
.kn-heat-head { display: flex; align-items: center; flex-wrap: wrap; justify-content: flex-end; gap: 6px; font-size: 11px; }
.kn-heat-title { font-weight: 600; }
.kn-heat-total { color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
.kn-heat-grid { display: flex; gap: 3px; }
.kn-heat-col { display: flex; flex-direction: column; gap: 3px; }
.kn-heat-cell { display: block; width: 14px; height: 14px; border-radius: 3px; background: var(--dsw-alias-bg-layer-2); }
.kn-heat-cell.is-future { background: transparent; opacity: 0 !important; }
.kn-heat-legend {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: 2px;
  font-size: 10px;
  color: var(--dsw-alias-label-secondary);
}
.kn-settings {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 40;
  width: 348px;
  max-width: calc(100vw - 120px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-layer-1));
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 14px 36px rgba(0, 0, 0, .28);
}
.kn-set-head { display: flex; align-items: center; gap: 8px; }
.kn-set-title { flex: 1 1 auto; font-size: 12.5px; font-weight: 650; }
.kn-set-close {
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}
.kn-set-close:hover { background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }
.kn-set-hint { margin: 0; font-size: 10.5px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.kn-set-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 7px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 9px;
}
.kn-set-thumb {
  flex: 0 0 auto;
  width: 54px;
  height: 32px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 6px;
  background-color: var(--dsw-alias-bg-layer-2);
  background-size: cover;
  background-position: center;
}
.kn-set-label { flex: 1 1 auto; min-width: 0; font-size: 11.5px; }
.kn-set-actions { display: flex; gap: 6px; flex: 0 0 auto; }
.kn-file-btn { position: relative; cursor: pointer; }
.kn-hidden-file { display: none; }
.kn-set-dim {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary);
}
.kn-set-dim input[type='range'] { flex: 1 1 auto; min-width: 0; accent-color: var(--kn-blue, var(--dsw-alias-brand-primary)); }
.kn-set-value { flex: 0 0 auto; font-variant-numeric: tabular-nums; }
.kn-set-status { margin: 0; font-size: 10.5px; color: var(--dsw-alias-state-warn-primary); }
.kn-set-foot { display: flex; justify-content: flex-end; }
.kn-section { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.kn-section.has-bg {
  position: relative;
  padding: 14px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 14px;
  background-size: cover;
  background-position: center;
}
.kn-section.has-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: var(--dsw-alias-bg-base);
  opacity: var(--kn-dim, .82);
  pointer-events: none;
}
.kn-section.has-bg > * { position: relative; z-index: 1; }
.kn-section-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.kn-section-head h2 { margin: 0; font-size: 13px; font-weight: 650; }
.kn-count { font-size: 11px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
.kn-hint { margin-left: auto; font-size: 11px; color: var(--dsw-alias-label-secondary); }
.kn-todo-body { display: flex; gap: 10px; align-items: stretch; min-width: 0; }
.kn-day.kn-global-col {
  flex: 0 0 190px;
  border-left: 3px solid var(--kn-purple, #8764B8);
  background: var(--dsw-alias-bg-layer-2);
  background: color-mix(in srgb, var(--kn-purple, #8764B8) 14%, var(--dsw-alias-bg-layer-1));
}
.kn-day.kn-global-col .kn-col-weekday { color: var(--kn-purple, #8764B8); }
.kn-days { flex: 1 1 auto; display: flex; gap: 10px; min-width: 0; overflow-x: auto; padding-bottom: 2px; }
.kn-day {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 168px;
  padding: 9px 10px 8px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 11px;
  background: var(--dsw-alias-bg-layer-1);
}
.kn-days .kn-day { flex: 1 1 0; min-width: 116px; }
.kn-day.is-selected { background: var(--dsw-alias-bg-layer-2); border-color: var(--kn-blue, var(--dsw-alias-brand-primary)); }
.kn-days .kn-day.is-today {
  flex: 1.4 1 0;
  min-width: 170px;
  border-color: var(--kn-blue, var(--dsw-alias-brand-primary));
  background: var(--dsw-alias-bg-layer-2);
  background: color-mix(in srgb, var(--kn-blue, var(--dsw-alias-brand-primary)) 12%, var(--dsw-alias-bg-layer-1));
}
.kn-day.is-today .kn-col-weekday { font-size: 13.5px; }
.kn-day.is-today .kn-today-badge {
  padding: 1px 6px;
  background: color-mix(in srgb, var(--kn-blue, #2564CF) 22%, transparent);
  border-color: color-mix(in srgb, var(--kn-blue, #2564CF) 45%, transparent);
  color: var(--kn-blue, #2564CF);
}
.kn-col-head { display: flex; align-items: center; gap: 6px; padding-bottom: 5px; border-bottom: 1px solid var(--dsw-alias-border-l1); }
.kn-col-weekday { font-size: 12px; font-weight: 650; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kn-col-date { margin-left: auto; font-size: 11px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; white-space: nowrap; }
.kn-today-badge {
  font-size: 10px;
  line-height: 1.2;
  padding: 1px 5px;
  border-radius: 999px;
  border: 1px solid var(--kn-blue, var(--dsw-alias-brand-primary));
  color: var(--kn-blue, var(--dsw-alias-brand-primary));
  white-space: nowrap;
}
.kn-col-meta { font-size: 10.5px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
.kn-todo-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; max-height: 240px; overflow: auto; flex: 1 1 auto; }
.kn-empty { font-size: 11px; color: var(--dsw-alias-label-secondary); padding: 4px 2px; }
.kn-todo { display: flex; align-items: flex-start; gap: 6px; padding: 3px; border-radius: 6px; }
.kn-todo:hover { background: var(--dsw-alias-bg-layer-2); }
.kn-todo.is-editing { padding: 2px; }
.kn-check {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  margin-top: 2px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--dsw-alias-border-l2);
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-bg-base);
  cursor: pointer;
}
.kn-check:hover { border-color: var(--kn-blue, #2564CF); }
.kn-todo.is-done .kn-check { border-color: var(--kn-blue, #2564CF); background: var(--kn-blue, #2564CF); }
.kn-todo-text { flex: 1 1 auto; min-width: 0; font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kn-todo.is-done .kn-todo-text { color: var(--dsw-alias-label-secondary); text-decoration: line-through; }
.kn-todo-edit {
  flex: 1 1 auto;
  min-width: 0;
  font: inherit;
  font-size: 12.5px;
  padding: 2px 4px;
  border: 1px solid var(--kn-blue, var(--dsw-alias-brand-primary));
  border-radius: 5px;
  background: var(--dsw-alias-bg-base);
  color: inherit;
  outline: none;
}
.kn-x {
  flex: 0 0 auto;
  opacity: 0;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
  border-radius: 4px;
  cursor: pointer;
}
.kn-todo:hover .kn-x,
.kn-note:hover .kn-x,
.kn-x:focus-visible { opacity: 1; }
.kn-x:hover { color: var(--dsw-alias-state-error-primary); }
.kn-add { display: flex; align-items: center; gap: 4px; margin-top: auto; padding-top: 5px; border-top: 1px dashed var(--dsw-alias-border-l1); }
.kn-add-plus { font-size: 13px; line-height: 1; color: var(--dsw-alias-label-secondary); }
.kn-add-input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  padding: 3px 1px;
  outline: none;
}
.kn-add-input::placeholder { color: var(--dsw-alias-label-secondary); }
.kn-month {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 11px;
  background: var(--dsw-alias-bg-layer-1);
}
.kn-month-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.kn-month-nav { display: flex; align-items: center; gap: 6px; }
.kn-month-title { font-size: 12.5px; font-weight: 650; }
.kn-month-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
.kn-month-week span { text-align: center; font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
.kn-month-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
.kn-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 76px;
  padding: 5px 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-base);
  cursor: pointer;
}
.kn-cell.is-out { opacity: .45; }
.kn-cell.is-today { border-color: var(--kn-blue, var(--dsw-alias-brand-primary)); }
.kn-cell.is-selected { background: var(--dsw-alias-bg-layer-2); border-color: var(--kn-blue, var(--dsw-alias-brand-primary)); }
.kn-cell-head { display: flex; align-items: center; justify-content: space-between; gap: 4px; }
.kn-cell-day { font-size: 11.5px; font-weight: 650; font-variant-numeric: tabular-nums; }
.kn-cell.is-today .kn-cell-day { color: var(--kn-blue, var(--dsw-alias-brand-primary)); }
.kn-cell-count { font-size: 10px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
.kn-cell-items { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.kn-mini {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 10.5px;
  padding: 1px 0;
  text-align: left;
  cursor: pointer;
}
.kn-mini-dot { flex: 0 0 auto; width: 6px; height: 6px; border-radius: 50%; border: 1px solid var(--dsw-alias-border-l2); }
.kn-mini.is-done .kn-mini-dot { background: var(--dsw-alias-state-success-primary); border-color: var(--dsw-alias-state-success-primary); }
.kn-mini.is-done .kn-mini-text { color: var(--dsw-alias-label-secondary); text-decoration: line-through; }
.kn-mini-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kn-more { font-size: 10px; color: var(--dsw-alias-label-secondary); }
.kn-cell-add {
  align-self: flex-start;
  margin-top: auto;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  line-height: 1;
  padding: 0 2px;
  cursor: pointer;
  opacity: 0;
}
.kn-cell:hover .kn-cell-add { opacity: 1; }
.kn-notes-body { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
.kn-zone { display: flex; flex-direction: column; gap: 7px; min-width: 0; flex: 1 1 0; }
.kn-zone-cal { flex: 1.35 1 0; }
.kn-zone-head { display: flex; align-items: baseline; gap: 7px; }
.kn-zone-title { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.kn-zone-count { font-size: 10.5px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
.kn-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; align-content: start; }
.kn-note {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 124px;
  padding: 11px 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
}
.kn-note:hover { border-color: var(--dsw-alias-border-l2); }
.kn-note-text {
  flex: 1 1 auto;
  min-width: 0;
  max-height: 190px;
  overflow: auto;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  text-align: left;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  cursor: text;
}
.kn-note-foot { display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 10px; color: var(--dsw-alias-label-secondary); }
.kn-note-time { font-variant-numeric: tabular-nums; }
.kn-note.is-editing { gap: 7px; }
.kn-note-input {
  width: 100%;
  min-height: 110px;
  resize: vertical;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  outline: none;
}
.kn-note-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.kn-new-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 124px;
  border: 1px dashed var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12.5px;
  cursor: pointer;
}
.kn-new-tile:hover { color: var(--dsw-alias-label-primary); border-color: var(--kn-blue, var(--dsw-alias-brand-primary)); }
.kn-swatches { display: flex; align-items: center; gap: 5px; }
.kn-swatch { width: 15px; height: 15px; padding: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 50%; cursor: pointer; }
.kn-swatch.is-active { outline: 2px solid var(--kn-blue, var(--dsw-alias-brand-primary)); outline-offset: 1px; }
.kn-fixed {
  flex: 0 0 252px;
  position: sticky;
  top: 14px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 9px 10px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-right: 3px solid var(--kn-teal, #00B294);
  border-radius: 11px;
  background: var(--dsw-alias-bg-layer-1);
}
.kn-fixed-head { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; }
.kn-fixed-title { font-size: 12px; font-weight: 650; }
.kn-fixed-hint { font-size: 10px; color: var(--dsw-alias-label-secondary); }
.kn-fixed-body { border: 1px solid var(--dsw-alias-border-l1); border-radius: 8px; padding: 7px 8px; }
.kn-fixed-input {
  width: 100%;
  min-height: 118px;
  resize: vertical;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12.5px;
  outline: none;
}
.kn-fixed-foot { font-size: 10px; color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
.kn-note-nav { display: flex; align-items: center; gap: 5px; margin-left: auto; }
.kn-note-nav-label {
  min-width: 92px;
  text-align: center;
  font-size: 11.5px;
  color: var(--dsw-alias-label-secondary);
  font-variant-numeric: tabular-nums;
}
.kn-fallback { padding: 24px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
@media (max-width: 980px) {
  .kn-notes-body { flex-wrap: wrap; }
  .kn-fixed {
    flex: 1 1 100%;
    position: static;
    border-right: 1px solid var(--dsw-alias-border-l1);
    border-left: 3px solid var(--kn-teal, #00B294);
  }
}
.kn-section.has-bg :where(.kn-day:not(.is-today):not(.is-selected):not(.kn-global-col)) {
  background: var(--dsw-alias-bg-layer-1);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 82%, transparent);
}
.kn-section.has-bg :where(.kn-note:not(.is-editing)) {
  background: var(--dsw-alias-bg-layer-1);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 82%, transparent);
}
.kn-section.has-bg :where(.kn-fixed) {
  background: var(--dsw-alias-bg-layer-1);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 86%, transparent);
}
.kn-section.has-bg :where(.kn-month) {
  background: var(--dsw-alias-bg-layer-1);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 82%, transparent);
}
.kn-section.has-bg :where(.kn-cell:not(.is-selected)) {
  background: var(--dsw-alias-bg-base);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 72%, transparent);
}
`;

    /* ------------------------------------------------------------------ */
    /* Plugin                                                              */
    /* ------------------------------------------------------------------ */

    const inject = ['slots', 'locale'];

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, 'zh', zh), 'keep-notes: zh dictionary');
      ctx.effect(() => ctx.locale.register(NS, 'en', en), 'keep-notes: en dictionary');
      const t = ctx.locale.bind(NS);
      const board = createBoard(ctx.locale.getLocale().active);

      const themeService = typeof ctx.get === 'function' ? ctx.get('theme') : null;
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
            inject: () => ({ board: board, scheme: schemeStore }),
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

    return { inject: inject, apply: apply };
  },
});
