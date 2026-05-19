/**
 * Test one Pollinations wallpaper generation:
 *   npm run test:pollinations
 * Requires POLLINATIONS_API_KEY in .env.local for gen.pollinations.ai (recommended)
 */
import '../server/env.js'
import { buildImageUrl, HAS_POLLINATIONS_KEY } from '../server/pollinations.js'
import fs from 'node:fs'
import path from 'node:path'

const prompt =
  process.argv[2] ??
  'cinematic superhero wallpaper Crimson Guardian mobile 4k no text'

const url = buildImageUrl(prompt)
const out = path.resolve('test-wallpaper-output.jpg')

console.log('Prompt:', prompt)
console.log('API key:', HAS_POLLINATIONS_KEY ? 'yes (gen.pollinations.ai)' : 'no (legacy image.pollinations.ai)')
console.log('URL:', url)
console.log('Fetching (may take 10–60s)…')

const res = await fetch(url, { signal: AbortSignal.timeout(120_000) })

if (!res.ok) {
  console.error('Failed:', res.status, res.statusText)
  process.exit(1)
}

const buffer = Buffer.from(await res.arrayBuffer())
fs.writeFileSync(out, buffer)

console.log(`✓ Saved ${buffer.length} bytes → ${out}`)
console.log(`Open: file://${out}`)
