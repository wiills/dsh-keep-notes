    const NS = 'keep-notes';
    const PANEL_ID = 'keep-notes';
    const STORAGE_KEY = 'dsh.keep-notes.board.v1';
    const APPEARANCE_KEY = 'dsh.keep-notes.appearance.v1';
    const IMAGES_KEY = 'dsh.keep-notes.images.v1';
    const SYNC_KEY = 'dsh.keep-notes.sync.v1';

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
    /* Forced black / white mode: pure paper plus a matching local palette, so the
       page stays readable even when it does not follow the app theme. */
    const FORCED_PAPER = {
      light: { base: '#FFFFFF', line: 'rgba(15, 23, 42, 0.06)' },
      dark: { base: '#000000', line: 'rgba(148, 163, 184, 0.13)' },
    };
    const FORCED_TOKENS = {
      light: {
        '--dsw-alias-bg-base': '#FFFFFF',
        '--dsw-alias-bg-layer-1': '#FFFFFF',
        '--dsw-alias-bg-layer-2': '#F3F2F1',
        '--dsw-alias-bg-overlay': '#FFFFFF',
        '--dsw-alias-border-l1': '#E1DFDD',
        '--dsw-alias-border-l2': '#C8C6C4',
        '--dsw-alias-brand-primary': '#2564CF',
        '--dsw-alias-label-primary': '#1B1A19',
        '--dsw-alias-label-secondary': '#605E5C',
        '--dsw-alias-state-success-primary': '#107C10',
        '--dsw-alias-state-warn-primary': '#B7791F',
        '--dsw-alias-state-error-primary': '#A4262C',
      },
      dark: {
        '--dsw-alias-bg-base': '#000000',
        '--dsw-alias-bg-layer-1': '#10151C',
        '--dsw-alias-bg-layer-2': '#1A212B',
        '--dsw-alias-bg-overlay': '#141A22',
        '--dsw-alias-border-l1': '#262D36',
        '--dsw-alias-border-l2': '#333B46',
        '--dsw-alias-brand-primary': '#4DA3FF',
        '--dsw-alias-label-primary': '#E8EDF3',
        '--dsw-alias-label-secondary': '#98A3B0',
        '--dsw-alias-state-success-primary': '#3FB950',
        '--dsw-alias-state-warn-primary': '#D29922',
        '--dsw-alias-state-error-primary': '#F85149',
      },
    };
    const NOTE_TINTS = {
      default: '',
      yellow: 'color-mix(in srgb, var(--kn-yellow, #FFB900) 18%, transparent)',
      green: 'color-mix(in srgb, var(--kn-green, #498205) 18%, transparent)',
      blue: 'color-mix(in srgb, var(--kn-blue, #2564CF) 18%, transparent)',
      purple: 'color-mix(in srgb, var(--kn-purple, #8764B8) 18%, transparent)',
      red: 'color-mix(in srgb, var(--kn-red, #E74856) 18%, transparent)',
    };
    const DEFAULT_APPEARANCE = { header: '', todos: '', notes: '', dim: 0.82, mode: 'auto' };
    const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
    const MAX_IMAGE_SIDE = 1280;
    /* Keep each background data URL and the whole image set small enough to
       leave room for the board in the shared localStorage quota. */
    const MAX_IMAGE_DATA_URL = 1200000;
    const MAX_IMAGES_TOTAL = 3200000;
    const MAX_LEGACY_IMAGE_DATA_URL = 3600000;
    const MAX_NOTE_TEXT = 20000;
    const MAX_TODO_TEXT = 1000;
    const IMAGE_SLOTS = ['header', 'todos', 'notes'];
    const NOTE_SWATCH = {
      default: 'var(--dsw-alias-bg-layer-2)',
      yellow: 'var(--kn-yellow, #FFB900)',
      green: 'var(--kn-green, #498205)',
      blue: 'var(--kn-blue, #2564CF)',
      purple: 'var(--kn-purple, #8764B8)',
      red: 'var(--kn-red, #E74856)',
    };
