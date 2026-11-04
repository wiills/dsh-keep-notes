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
            const attempts = [
              [MAX_IMAGE_SIDE, 0.8],
              [1024, 0.7],
              [800, 0.6],
            ];
            for (let index = 0; index < attempts.length; index += 1) {
              const side = attempts[index][0];
              const quality = attempts[index][1];
              const scale = Math.min(1, side / Math.max(width, height));
              const canvas = document.createElement('canvas');
              canvas.width = Math.max(1, Math.round(width * scale));
              canvas.height = Math.max(1, Math.round(height * scale));
              const context = canvas.getContext('2d');
              if (!context) {
                onError('encode');
                return;
              }
              context.drawImage(image, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              if (dataUrl.length <= MAX_IMAGE_DATA_URL) {
                onReady(dataUrl);
                return;
              }
            }
            onError('size');
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
