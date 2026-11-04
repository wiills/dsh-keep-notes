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
