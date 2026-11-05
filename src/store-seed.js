    /* ------------------------------------------------------------------ */
    /* Board store                                                         */
    /* ------------------------------------------------------------------ */

    let idSequence = 0;

    function newId(prefix) {
      idSequence += 1;
      return (
        prefix +
        '-' +
        Date.now().toString(36) +
        '-' +
        idSequence.toString(36) +
        '-' +
        Math.random().toString(36).slice(2, 6)
      );
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
      ja: {
        todo1: 'ToDo の文字をクリックすると名前を変更できます',
        todo2: '丸をクリックすると完了にできます',
        todo3: '「月表示」に切り替えると 1 か月分を確認できます',
        todoGlobal: 'グローバル ToDo は左側に固定され、日付に連動しません',
        note1: 'カレンダーノートはカレンダーに連動します。日を選ぶとその日のノートが表示されます。',
        note2: 'グローバルノートは常に表示され、日付に縛られません。',
        note3: '右端の固定ノートにはいつでも書き留められます。',
      },
      es: {
        todo1: 'Haz clic en una tarea para cambiarle el nombre',
        todo2: 'Haz clic en el círculo para marcarla como hecha',
        todo3: 'Cambia a «Mes» para ver el mes completo',
        todoGlobal: 'Las tareas globales quedan fijas a la izquierda',
        note1: 'Las notas del día siguen al calendario: elige un día para ver sus notas.',
        note2: 'Las notas globales están siempre aquí, sin fecha.',
        note3: 'La nota fijada de la derecha está siempre disponible.',
      },
      fr: {
        todo1: 'Cliquez sur une tâche pour la renommer',
        todo2: 'Cliquez sur le cercle pour la marquer comme terminée',
        todo3: 'Passez en « Mois » pour voir tout le mois',
        todoGlobal: 'Les tâches globales restent épinglées à gauche',
        note1: 'Les notes du jour suivent le calendrier : choisissez un jour pour voir ses notes.',
        note2: 'Les notes globales sont toujours là, sans date.',
        note3: 'La note épinglée à droite est toujours disponible.',
      },
      de: {
        todo1: 'Klicke auf ein To-do, um es umzubenennen',
        todo2: 'Klicke auf den Kreis, um es als erledigt zu markieren',
        todo3: 'Wechsle zu „Monat“, um den ganzen Monat zu sehen',
        todoGlobal: 'Globale To-dos bleiben links angeheftet',
        note1: 'Tagesnotizen folgen dem Kalender: Wähle einen Tag, um seine Notizen zu sehen.',
        note2: 'Globale Notizen sind immer da, ohne Datum.',
        note3: 'Die angeheftete Notiz rechts ist immer verfügbar.',
      },
      ru: {
        todo1: 'Нажмите на задачу, чтобы переименовать её',
        todo2: 'Нажмите на круг, чтобы отметить её выполненной',
        todo3: 'Переключитесь на «Месяц», чтобы увидеть весь месяц',
        todoGlobal: 'Общие задачи закреплены слева',
        note1: 'Заметки дня следуют календарю: выберите день, чтобы увидеть его заметки.',
        note2: 'Общие заметки всегда на месте, без даты.',
        note3: 'Закреплённая заметка справа всегда под рукой.',
      },
      pt: {
        todo1: 'Clique em uma tarefa para renomeá-la',
        todo2: 'Clique no círculo para marcá-la como concluída',
        todo3: 'Mude para «Mês» para ver o mês inteiro',
        todoGlobal: 'As tarefas globais ficam fixas à esquerda',
        note1: 'As notas do dia seguem o calendário: escolha um dia para ver as notas.',
        note2: 'As notas globais estão sempre aqui, sem data.',
        note3: 'A nota fixada à direita está sempre disponível.',
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
