    function SyncSettings(props) {
      const { t } = props;
      const [info, setInfo] = React.useState(null);
      const [folder, setFolder] = React.useState('');
      const [busy, setBusy] = React.useState(false);
      const [message, setMessage] = React.useState('');

      const request = async (method, body) => {
        if (typeof window === 'undefined' || typeof window.fetch !== 'function') {
          throw new Error(t('syncUnavailable'));
        }
        const response = await window.fetch('/dsh-keep-notes/sync', {
          method: method,
          cache: 'no-store',
          credentials: 'same-origin',
          headers: body
            ? { accept: 'application/json', 'content-type': 'application/json' }
            : { accept: 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
          let detail = '';
          try {
            const parsed = await response.json();
            detail = parsed && parsed.error ? String(parsed.error) : '';
          } catch (error) {
            detail = '';
          }
          throw new Error(detail || 'HTTP ' + response.status);
        }
        return response.json();
      };

      const load = async (fillInput) => {
        try {
          const next = await request('GET');
          setInfo(next);
          if (fillInput) setFolder(next.folder || '');
        } catch (error) {
          setInfo({
            enabled: false,
            folder: '',
            state: 'error',
            lastError: error && error.message ? error.message : String(error),
            lastSyncAt: 0,
          });
        }
      };

      React.useEffect(() => {
        let active = true;
        const refresh = (fillInput) => {
          if (!active) return;
          load(fillInput);
        };
        refresh(true);
        const timer = window.setInterval(() => refresh(false), 6000);
        return () => {
          active = false;
          window.clearInterval(timer);
        };
      }, []);

      const save = async (nextFolder) => {
        setBusy(true);
        setMessage('');
        try {
          const next = await request('POST', { folder: nextFolder });
          setInfo(next);
          setFolder(next.folder || '');
          setMessage(t('syncSaved'));
        } catch (error) {
          setMessage(t('syncInvalid', { detail: error && error.message ? error.message : String(error) }));
        } finally {
          setBusy(false);
        }
      };

      const state = info ? info.state || (info.enabled ? 'idle' : 'disabled') : 'loading';
      const statusLabel =
        state === 'syncing'
          ? t('syncSyncing')
          : state === 'error'
            ? t('syncError')
            : info && info.enabled
              ? t('syncIdle')
              : t('syncDisabled');
      const lastSync =
        info && info.lastSyncAt
          ? t('syncLast', { time: new Date(info.lastSyncAt).toLocaleString() })
          : t('syncNever');

      return h(
        'div',
        { className: 'kn-sync' },
        h(
          'div',
          { className: 'kn-sync-head' },
          h('span', { className: 'kn-sync-title' }, t('syncTitle')),
          h('span', { className: cx('kn-sync-badge', info && info.enabled && 'is-on') }, statusLabel),
        ),
        h('p', { className: 'kn-set-hint' }, t('syncHint')),
        h(
          'div',
          { className: 'kn-sync-row' },
          h('input', {
            className: 'kn-sync-input',
            type: 'text',
            value: folder,
            placeholder: t('syncFolderPlaceholder'),
            'aria-label': t('syncFolder'),
            spellCheck: false,
            autoComplete: 'off',
            onChange: (event) => setFolder(event.target.value),
            onKeyDown: (event) => {
              if (event.key === 'Enter' && !busy && folder.trim()) save(folder.trim());
            },
          }),
          h(
            'button',
            {
              type: 'button',
              className: 'kn-btn',
              disabled: busy || !folder.trim(),
              onClick: () => save(folder.trim()),
            },
            busy ? t('processing') : t('syncEnable'),
          ),
        ),
        info && info.enabled
          ? h(
              'button',
              {
                type: 'button',
                className: 'kn-btn',
                disabled: busy,
                onClick: () => save(''),
              },
              t('syncDisable'),
            )
          : null,
        h(
          'p',
          { className: cx('kn-sync-status', state === 'error' && 'is-error'), role: 'status', 'aria-live': 'polite' },
          lastSync,
          info && info.lastError ? ' · ' + info.lastError : '',
          message ? ' · ' + message : '',
        ),
      );
    }

    /* ------------------------------------------------------------------ */
    /* Background settings                                                 */
    /* ------------------------------------------------------------------ */

    function BackgroundSettings(props) {
      const { t, appearance, onChange, onSetImage, onClearImage, onClearImages, onClose } = props;
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
            const saved = onSetImage(slot, dataUrl);
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
        {
          className: 'kn-settings',
          id: 'keep-notes-settings',
          role: 'dialog',
          'aria-labelledby': 'keep-notes-settings-title',
        },
        h(
          'div',
          { className: 'kn-set-head' },
          h('span', { className: 'kn-set-title', id: 'keep-notes-settings-title' }, t('settings')),
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
        h(
          'div',
          { className: 'kn-set-row kn-set-mode' },
          h('span', { className: 'kn-set-label' }, t('background')),
          h(
            'div',
            { className: 'kn-seg', role: 'group', 'aria-label': t('background') },
            ['auto', 'dark', 'light'].map((value) =>
              h(
                'button',
                {
                  key: value,
                  type: 'button',
                  className: cx('kn-seg-btn', (appearance.mode || 'auto') === value && 'is-active'),
                  'aria-pressed': (appearance.mode || 'auto') === value,
                  onClick: () => onChange({ mode: value }),
                },
                t(value === 'auto' ? 'modeAuto' : value === 'dark' ? 'modeBlack' : 'modeWhite'),
              ),
            ),
          ),
        ),
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
                    { type: 'button', className: 'kn-btn', onClick: () => onClearImage(row.slot) },
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
        status ? h('p', { className: 'kn-set-status', role: 'status', 'aria-live': 'polite' }, status) : null,
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
                onClearImages();
              },
            },
            t('clearAll'),
          ),
        ),
        h(SyncSettings, { t: t }),
      );
    }
