/**
 * Generate 10 superhero wallpapers:
 *   OpenRouter prompts → Pollinations images → SQLite + local files
 *
 *   npm run generate:superhero
 */
import '../server/env.js'
import { generateCategoryWallpapers } from '../server/generator.js'

const result = await generateCategoryWallpapers('superhero')

console.log('\n--- Summary ---')
console.log(`Batch: ${result.batchDate}`)
console.log(`Saved: ${result.total} wallpapers`)
result.wallpapers.forEach((w, i) => {
  console.log(`${i + 1}. ${w.title}`)
  console.log(`   Prompt: ${w.prompt.slice(0, 80)}…`)
  console.log(`   Image:  ${w.imageUrl}`)
})
