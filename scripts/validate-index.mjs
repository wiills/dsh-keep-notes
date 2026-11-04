#!/usr/bin/env node
/**
 * Validate docs/index.json with the same parser DSH uses to read market indexes.
 *
 * The index URL matters: relative icon references resolve against it, and the
 * validator rejects icons that would leave https or the index origin.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseMarketIndex } from '@deepseek-ai/dsh-plugin-market-index'

const indexUrl = process.argv[2] ?? 'https://wiills.github.io/dsh-keep-notes/index.json'
const indexPath = fileURLToPath(new URL('../docs/index.json', import.meta.url))
const index = parseMarketIndex(JSON.parse(readFileSync(indexPath, 'utf8')), indexUrl)

for (const plugin of index.plugins) {
  console.log(`${plugin.name}: ${plugin.versions.map((version) => version.version).join(', ')}`)
}

console.log(`market "${index.title.en}" is valid (${index.plugins.length} plugin(s), index ${indexUrl})`)
