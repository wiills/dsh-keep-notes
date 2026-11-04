/**
 * Model-facing tools for the Keep Notes board. Each tool reads or mutates the
 * same Host board the browser panel syncs with, so an agent and the panel see
 * one list.
 */
import { MAX_NOTE_TEXT, MAX_TODO_TEXT, NOTE_COLORS } from './host-store.js';

const DATE_DESCRIPTION = 'Local date in YYYY-MM-DD. Omit it for a global item that is not tied to a day.';
const COLOR_DESCRIPTION = 'Note tint: ' + NOTE_COLORS.join(', ') + '.';
const TODO_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    text: { type: 'string' },
    date: { oneOf: [{ type: 'string' }, { type: 'null' }] },
    done: { type: 'boolean' },
    createdAt: { type: 'integer' },
    completedAt: { oneOf: [{ type: 'integer' }, { type: 'null' }] },
  },
  required: ['id', 'text', 'date', 'done', 'createdAt', 'completedAt'],
};
const NOTE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    text: { type: 'string' },
    date: { oneOf: [{ type: 'string' }, { type: 'null' }] },
    fixed: { type: 'boolean' },
    color: { type: 'string', enum: NOTE_COLORS },
    createdAt: { type: 'integer' },
    updatedAt: { type: 'integer' },
  },
  required: ['id', 'text', 'date', 'fixed', 'color', 'createdAt', 'updatedAt'],
};
const REVISION_SCHEMA = { type: 'integer' };
const LIST_OUTPUT = {
  type: 'object',
  additionalProperties: false,
  properties: {
    revision: REVISION_SCHEMA,
    todos: { type: 'array', items: TODO_SCHEMA },
    notes: { type: 'array', items: NOTE_SCHEMA },
  },
  required: ['revision', 'todos', 'notes'],
};
const TODO_OUTPUT = {
  type: 'object',
  additionalProperties: false,
  properties: { todo: TODO_SCHEMA, revision: REVISION_SCHEMA },
  required: ['todo', 'revision'],
};
const NOTE_OUTPUT = {
  type: 'object',
  additionalProperties: false,
  properties: { note: NOTE_SCHEMA, revision: REVISION_SCHEMA },
  required: ['note', 'revision'],
};
const REMOVE_OUTPUT = {
  type: 'object',
  additionalProperties: false,
  properties: { removed: { type: 'boolean' }, revision: REVISION_SCHEMA },
  required: ['removed', 'revision'],
};

function parameters(properties, required = []) {
  return { type: 'object', additionalProperties: false, properties: properties, required: required };
}

function clip(value, limit) {
  const text = typeof value === 'string' ? value : '';
  return text.length > limit ? text.slice(0, limit) + '…' : text;
}

function text(value, limit) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function dateValue(value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('date must be YYYY-MM-DD or omitted');
  }
  return value;
}

function itemLine(item, kind) {
  if (kind === 'todo') {
    return '- [' + (item.done ? 'x' : ' ') + '] ' + clip(item.text, 500) + ' — id: ' + item.id + ', date: ' + (item.date || 'global');
  }
  return (
    '- ' +
    clip(item.text, 500) +
    ' — id: ' +
    item.id +
    ', date: ' +
    (item.date || 'global') +
    ', color: ' +
    item.color +
    (item.fixed ? ', pinned' : '')
  );
}

function renderList(value) {
  const lines = [];
  lines.push('Todos (' + value.todos.length + '):');
  for (const todo of value.todos) lines.push(itemLine(todo, 'todo'));
  if (value.todos.length === 0) lines.push('- (none)');
  lines.push('');
  lines.push('Notes (' + value.notes.length + '):');
  for (const note of value.notes) lines.push(itemLine(note, 'note'));
  if (value.notes.length === 0) lines.push('- (none)');
  const output = lines.join('\n');
  return [{ type: 'text', text: output.length > 16000 ? output.slice(0, 16000) + '\n… (list truncated)' : output }];
}

function renderTodo(value) {
  return [
    {
      type: 'text',
      text:
        'Todo "' +
        clip(value.todo.text, 500) +
        '" (id: ' +
        value.todo.id +
        ') is ' +
        (value.todo.done ? 'done' : 'open') +
        (value.todo.date ? ' on ' + value.todo.date : ' globally') +
        '.',
    },
  ];
}

function renderNote(value) {
  return [
    {
      type: 'text',
      text:
        'Note "' +
        clip(value.note.text, 500) +
        '" (id: ' +
        value.note.id +
        ') saved' +
        (value.note.date ? ' for ' + value.note.date : ' globally') +
        ' with ' +
        value.note.color +
        ' color.',
    },
  ];
}

function renderRemoved(value) {
  return [{ type: 'text', text: value.removed ? 'Removed from the Keep Notes panel.' : 'Nothing matched that id; nothing was removed.' }];
}

/**
 * Build the Keep Notes tool definitions for one store.
 * @param {import('./host-store.js').BoardStore} store - Host board store.
 * @returns {Array<object>} tool definitions accepted by ctx.tools.register().
 */
export function createKeepNotesTools(store) {
  return [
    {
      name: 'keep_notes_list',
      description:
        'List the todos and notes shown in the Keep Notes panel, including the ids needed by the update and remove tools. Use it before changing an existing item.',
      parameters: parameters({}),
      output: {
        schema: LIST_OUTPUT,
        render: (_args, value) => renderList(value),
      },
      isConcurrencySafe: () => true,
      execute: () => store.list(),
    },
    {
      name: 'keep_notes_add_todo',
      description:
        'Add a todo to the Keep Notes panel. The todo is visible in the panel and to later tool calls. Omit date for a global todo.',
      parameters: parameters(
        {
          text: { type: 'string', description: 'Todo text, up to ' + MAX_TODO_TEXT + ' characters.' },
          date: {
            oneOf: [{ type: 'string' }, { type: 'null' }],
            description: DATE_DESCRIPTION,
          },
        },
        ['text'],
      ),
      output: { schema: TODO_OUTPUT, render: (_args, value) => renderTodo(value) },
      isConcurrencySafe: () => false,
      async execute(args) {
        const value = text(args && args.text, MAX_TODO_TEXT);
        if (!value) throw new Error('text must not be empty');
        return store.addTodo({ text: value, date: dateValue(args && args.date) });
      },
    },
    {
      name: 'keep_notes_update_todo',
      description:
        'Change a todo in the Keep Notes panel: rename it, mark it done or open, or both. Use keep_notes_list to find its id.',
      parameters: parameters(
        {
          id: { type: 'string', description: 'Todo id from keep_notes_list.' },
          text: { type: 'string', description: 'New todo text, up to ' + MAX_TODO_TEXT + ' characters.' },
          done: { type: 'boolean', description: 'true marks it done; false reopens it.' },
        },
        ['id'],
      ),
      output: { schema: TODO_OUTPUT, render: (_args, value) => renderTodo(value) },
      isConcurrencySafe: () => false,
      async execute(args) {
        const value = await store.updateTodo(String(args && args.id), {
          text: args && args.text,
          done: args && args.done,
        });
        if (!value) throw new Error('todo not found or nothing changed');
        return value;
      },
    },
    {
      name: 'keep_notes_add_note',
      description:
        'Add a note to the Keep Notes panel. The note is visible in the panel and to later tool calls. Omit date for a global note.',
      parameters: parameters(
        {
          text: { type: 'string', description: 'Note text, up to ' + MAX_NOTE_TEXT + ' characters.' },
          date: {
            oneOf: [{ type: 'string' }, { type: 'null' }],
            description: DATE_DESCRIPTION,
          },
          color: { type: 'string', enum: NOTE_COLORS, description: COLOR_DESCRIPTION },
        },
        ['text'],
      ),
      output: { schema: NOTE_OUTPUT, render: (_args, value) => renderNote(value) },
      isConcurrencySafe: () => false,
      async execute(args) {
        const value = text(args && args.text, MAX_NOTE_TEXT);
        if (!value) throw new Error('text must not be empty');
        return store.addNote({ text: value, date: dateValue(args && args.date), color: args && args.color });
      },
    },
    {
      name: 'keep_notes_update_note',
      description:
        'Change a note in the Keep Notes panel: edit its text, change its color, or both. Use keep_notes_list to find its id.',
      parameters: parameters(
        {
          id: { type: 'string', description: 'Note id from keep_notes_list.' },
          text: { type: 'string', description: 'New note text, up to ' + MAX_NOTE_TEXT + ' characters.' },
          color: { type: 'string', enum: NOTE_COLORS, description: COLOR_DESCRIPTION },
        },
        ['id'],
      ),
      output: { schema: NOTE_OUTPUT, render: (_args, value) => renderNote(value) },
      isConcurrencySafe: () => false,
      async execute(args) {
        const value = await store.updateNote(String(args && args.id), {
          text: args && args.text,
          color: args && args.color,
        });
        if (!value) throw new Error('note not found or nothing changed');
        return value;
      },
    },
    {
      name: 'keep_notes_remove',
      description: 'Remove one todo or note from the Keep Notes panel. Use keep_notes_list to find its id.',
      parameters: parameters(
        {
          kind: { type: 'string', enum: ['todo', 'note'], description: 'Which list the id belongs to.' },
          id: { type: 'string', description: 'Todo or note id from keep_notes_list.' },
        },
        ['kind', 'id'],
      ),
      output: { schema: REMOVE_OUTPUT, render: (_args, value) => renderRemoved(value) },
      isConcurrencySafe: () => false,
      async execute(args) {
        return store.remove(String(args && args.kind), String(args && args.id));
      },
    },
  ];
}
