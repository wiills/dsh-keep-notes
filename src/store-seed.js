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
        todo1: '点击待办文字可以改名',
        todo2: '点击圆圈即可标记完成',
        todo3: '切到「月视图」查看整月安排',
        todoGlobal: '全局待办固定在左侧，不随日期变化',
        note1: '日历便签跟着日历走：点选某一天，就能看到那天的便签。',
        note2: '全局便签一直都在，不绑日期。',
        note3: '这是最右侧的固定便签，随时记一笔。',
      },
      en: {
        todo1: 'Click a todo to rename it',
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
