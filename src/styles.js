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
  container-type: inline-size;
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
.kn-head-left { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 14px; min-width: 0; flex: 1 1 auto; }
.kn-head-titles { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.kn-head-right {
  position: relative;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex: 0 0 auto;
  max-width: 100%;
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
.kn-heat { flex: 1 1 auto; min-width: 0; max-width: 100%; display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 6px; }
.kn-heat-head { display: flex; align-items: center; flex-wrap: wrap; justify-content: flex-end; gap: 6px; font-size: 11px; }
.kn-heat-title { font-weight: 600; }
.kn-heat-total { color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums; }
.kn-heat-grid { display: flex; max-width: 100%; overflow-x: auto; gap: 3px; }
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
  width: min(348px, calc(100cqw - 8px));
  max-width: calc(100vw - 48px);
  max-height: min(70vh, 560px);
  overflow-y: auto;
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
.kn-file-btn:focus-within {
  outline: 2px solid var(--kn-blue, var(--dsw-alias-brand-primary));
  outline-offset: 1px;
}
.kn-hidden-file {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
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
.kn-sync {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 9px;
  border-top: 1px solid var(--dsw-alias-border-l1);
}
.kn-sync-head { display: flex; align-items: center; gap: 8px; }
.kn-sync-title { flex: 1 1 auto; font-size: 11.5px; font-weight: 650; }
.kn-sync-badge {
  flex: 0 0 auto;
  padding: 2px 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 999px;
  color: var(--dsw-alias-label-secondary);
  font-size: 9.5px;
  line-height: 1.35;
}
.kn-sync-badge.is-on { color: var(--dsw-alias-state-success-primary); border-color: currentColor; }
.kn-sync-row { display: flex; gap: 6px; align-items: center; }
.kn-sync-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 28px;
  padding: 3px 7px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 10.5px;
}
.kn-sync-input:focus-visible {
  outline: 2px solid var(--kn-blue, var(--dsw-alias-brand-primary));
  outline-offset: 1px;
}
.kn-sync-status {
  margin: 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 9.5px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
.kn-sync-status.is-error { color: var(--dsw-alias-state-error-primary); }
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
button.kn-col-head {
  width: 100%;
  padding: 0 0 5px;
  border: 0;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  border-radius: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  appearance: none;
}
button.kn-col-head:focus-visible {
  outline: 2px solid var(--kn-blue, var(--dsw-alias-brand-primary));
  outline-offset: 2px;
}
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
.kn-todo.has-color { padding-left: 6px; }
.kn-todo.is-editing { padding: 2px; flex-wrap: wrap; row-gap: 4px; }
.kn-todo-colors { flex: 0 0 100%; display: flex; justify-content: flex-end; padding-left: 18px; }
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
button.kn-todo-text {
  display: block;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12.5px;
  text-align: left;
  cursor: text;
  appearance: none;
}
button.kn-todo-text:focus-visible {
  outline: 2px solid var(--kn-blue, var(--dsw-alias-brand-primary));
  outline-offset: 1px;
}
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
.kn-add-input:focus-visible,
.kn-note-input:focus-visible,
.kn-fixed-input:focus-visible {
  outline: 2px solid var(--kn-blue, var(--dsw-alias-brand-primary));
  outline-offset: 1px;
  border-radius: 4px;
}
.kn-month {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
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
.kn-month-week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); min-width: 560px; gap: 5px; }
.kn-month-week span { text-align: center; font-size: 10.5px; color: var(--dsw-alias-label-secondary); }
.kn-month-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); min-width: 560px; gap: 5px; }
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
button.kn-cell-day {
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 11.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  appearance: none;
}
button.kn-cell-day:focus-visible {
  outline: 2px solid var(--kn-blue, var(--dsw-alias-brand-primary));
  outline-offset: 1px;
}
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
.kn-cell-add:focus-visible {
  opacity: 1;
  outline: 2px solid var(--kn-blue, var(--dsw-alias-brand-primary));
  outline-offset: 1px;
}
.kn-notes-body { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 12px; min-width: 0; }
.kn-zone { display: flex; flex-direction: column; gap: 7px; min-width: 0; flex: 1 1 260px; }
.kn-zone-cal { flex: 1.35 1 300px; }
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
  flex: 0 1 252px;
  min-width: 220px;
  max-width: 100%;
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
.kn-storage {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--dsw-alias-state-warn-primary);
  border-radius: 9px;
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 10%, var(--dsw-alias-bg-layer-1));
  color: var(--dsw-alias-label-primary);
  font-size: 11.5px;
}
.kn-storage-text { flex: 1 1 auto; min-width: 0; }
.kn-storage-dismiss { flex: 0 0 auto; }
.kn-root :where(button, input, textarea, [tabindex]):focus-visible {
  outline: 2px solid var(--kn-blue, var(--dsw-alias-brand-primary));
  outline-offset: 2px;
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
@container (max-width: 900px) {
  .kn-fixed {
    flex: 1 1 100%;
    position: static;
    border-right: 1px solid var(--dsw-alias-border-l1);
    border-left: 3px solid var(--kn-teal, #00B294);
  }
}
@container (max-width: 560px) {
  .kn-zone,
  .kn-zone-cal { flex: 1 1 100%; }
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
