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
      );
    }
