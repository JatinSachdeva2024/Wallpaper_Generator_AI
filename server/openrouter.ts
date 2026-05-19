import type { CategoryId } from './types.js'
import type { GeneratedPrompt } from './types.js'
import { PROMPTS_PER_CATEGORY } from './categories.js'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

const CATEGORY_HINTS: Record<CategoryId, string> = {
  superhero:
    'cinematic superhero mobile wallpaper, epic pose, dramatic lighting, comic book style, 4k, no text, no watermark',
  anime: 'anime style, vibrant, detailed illustration, no text',
  nature: 'breathtaking nature, photorealistic, golden hour, no text',
  minimalist: 'minimalist, clean, soft gradients, elegant, no text',
  city: 'urban cityscape at night, neon, cinematic, no text',
  abstract: 'abstract digital art, fluid shapes, bold colors, no text',
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function generatePromptsForCategory(
  category: CategoryId,
): Promise<GeneratedPrompt[]> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model =
    process.env.OPENROUTER_MODEL ?? 'deepseek/deepseek-chat'

  if (!apiKey) {
    return fallbackPrompts(category)
  }

  const system = `You create mobile wallpaper image prompts. Return ONLY valid JSON — no markdown, no explanation.`

  const user = `Generate exactly ${PROMPTS_PER_CATEGORY} unique wallpaper prompts for the "${category}" category.
Style guide: ${CATEGORY_HINTS[category]}
Each item needs:
- title: short creative name (2-4 words)
- prompt: detailed image generation prompt for Pollinations AI (80-150 chars), portrait orientation 9:16 mobile wallpaper
Return ONLY a JSON array: [{"title":"...","prompt":"..."}, ...]`

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL ?? 'http://localhost:5173',
      'X-Title': 'Aura Wallpapers',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.9,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`OpenRouter error (${category}):`, err)
    return fallbackPrompts(category)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content ?? ''
  const parsed = parsePromptsJson(content)

  if (parsed.length >= PROMPTS_PER_CATEGORY) {
    return parsed.slice(0, PROMPTS_PER_CATEGORY)
  }

  console.warn(`OpenRouter returned ${parsed.length} prompts for ${category}, using fallback`)
  return fallbackPrompts(category)
}

function parsePromptsJson(content: string): GeneratedPrompt[] {
  const trimmed = content.trim()
  const jsonMatch = trimmed.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []

  try {
    const arr = JSON.parse(jsonMatch[0]) as unknown[]
    return arr
      .filter(
        (item): item is GeneratedPrompt =>
          typeof item === 'object' &&
          item !== null &&
          'title' in item &&
          'prompt' in item &&
          typeof (item as GeneratedPrompt).title === 'string' &&
          typeof (item as GeneratedPrompt).prompt === 'string',
      )
      .map((item) => ({
        title: item.title.trim(),
        prompt: item.prompt.trim(),
      }))
  } catch {
    return []
  }
}

/** Static prompts when OpenRouter is unavailable */
function fallbackPrompts(category: CategoryId): GeneratedPrompt[] {
  const hint = CATEGORY_HINTS[category]
  const names: Record<CategoryId, string[]> = {
    superhero: [
      'Crimson Guardian',
      'Neon Vigil',
      'Skybreaker',
      'Shadow Pulse',
      'Iron Horizon',
      'Quantum Shield',
      'Storm Ascendant',
      'Void Knight',
      'Solar Warden',
      'Thunder Veil',
    ],
    anime: [
      'Sakura Drift',
      'Midnight Ronin',
      'Celestial Dream',
      'Neon Shrine',
      'Spirit Bloom',
      'Starlit Voyage',
      'Echo Blade',
      'Moonlit Harbor',
      'Radiant Fox',
      'Crystal Rain',
    ],
    nature: [
      'Mist Valley',
      'Aurora Pines',
      'Golden Meadow',
      'Silent Falls',
      'Horizon Bloom',
      'Emerald Ridge',
      'Dawn Lagoon',
      'Wildflower Dusk',
      'Cedar Light',
      'Ocean Mist',
    ],
    minimalist: [
      'Soft Geometry',
      'Quiet Lines',
      'Pale Horizon',
      'Mono Flow',
      'Calm Arc',
      'Subtle Grid',
      'Ivory Wave',
      'Zen Curve',
      'Muted Sphere',
      'Light Frame',
    ],
    city: [
      'Neon Crossing',
      'Rain Metro',
      'Skyline Glow',
      'Midnight Avenue',
      'Glass District',
      'Urban Pulse',
      'Tower Lights',
      'Harbor Nights',
      'Electric Alley',
      'Rooftop Haze',
    ],
    abstract: [
      'Liquid Prism',
      'Chroma Fold',
      'Velvet Flux',
      'Iridescent Mesh',
      'Orbital Ink',
      'Dream Topology',
      'Plasma Bloom',
      'Fractal Tide',
      'Neon Mist',
      'Cosmic Weave',
    ],
  }

  return names[category].map((title) => ({
    title,
    prompt: `${hint}, ${title}, mobile wallpaper 4k`,
  }))
}

export { todayString }
