import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const read = (name) => readFileSync(path.join(root, name), 'utf8');

/* The dictionaries and the seed copy live inside the client bundle's source
   sections, so evaluate those fragments to inspect them here. */
const dictionaries = new Function(read('src/dictionaries.js') + '\nreturn { zh, en, ja, es, fr, de, ru, pt };')();
const languages = ['zh', 'en', 'ja', 'es', 'fr', 'de', 'ru', 'pt'];
const reference = dictionaries.zh;

test('every shipped language defines the same keys as Chinese', () => {
  const keys = Object.keys(reference).sort();
  for (const id of languages) {
    const dictionary = dictionaries[id];
    assert.ok(dictionary, 'missing dictionary: ' + id);
    assert.equal(dictionary.lang, id);
    assert.deepEqual(Object.keys(dictionary).sort(), keys, id + ' has a different key set');
    for (const key of keys) {
      assert.equal(typeof dictionary[key], 'string', id + '.' + key + ' is not a string');
      assert.ok(dictionary[key].trim().length > 0, id + '.' + key + ' is empty');
    }
  }
});

test('placeholders survive translation', () => {
  const placeholders = (text) => (text.match(/\{\w+\}/g) || []).sort().join('');
  for (const [key, value] of Object.entries(reference)) {
    for (const id of languages) {
      assert.equal(placeholders(dictionaries[id][key]), placeholders(value), id + '.' + key + ' placeholders differ');
    }
  }
});

test('every language ships panel metadata and sample copy', () => {
  const seed = new Function(read('src/store-seed.js') + '\nreturn SEED;')();
  const seedKeys = ['todo1', 'todo2', 'todo3', 'todoGlobal', 'note1', 'note2', 'note3'];
  for (const id of languages) {
    const meta = JSON.parse(read('locale/' + id + '.json')).meta;
    assert.ok(meta.title && meta.description, 'locale/' + id + '.json is incomplete');
    assert.ok(seed[id], 'missing seed copy: ' + id);
    for (const key of seedKeys) {
      assert.ok(seed[id][key] && seed[id][key].trim(), 'seed ' + id + '.' + key + ' is missing');
    }
  }
});

test('dates follow the dictionary language and fall back to English', () => {
  const dates = new Function(read('src/dates.js') + '\nreturn { formatDate };')();
  const iso = '2026-11-05';
  const en = dates.formatDate('en', iso, { month: 'long' });
  assert.equal(dates.formatDate('xx', iso, { month: 'long' }), en);
  assert.notEqual(dates.formatDate('zh', iso, { month: 'long' }), en);
  assert.notEqual(dates.formatDate('fr', iso, { month: 'long' }), en);
});
