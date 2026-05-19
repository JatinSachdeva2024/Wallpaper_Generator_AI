/**
 * Pollinations image URLs
 * Docs: https://gen.pollinations.ai/docs
 * API keys: https://enter.pollinations.ai
 *
 * With key (recommended): https://gen.pollinations.ai/image/{prompt}?width=1080&height=1920&model=flux&key=sk_...
 * Legacy (no key):        https://image.pollinations.ai/prompt/{prompt}
 */

const GEN_BASE = 'https://gen.pollinations.ai/image'
const LEGACY_BASE = 'https://image.pollinations.ai/prompt'

const API_KEY = process.env.POLLINATIONS_API_KEY ?? ''
const MODEL = process.env.POLLINATIONS_MODEL ?? 'flux'

export function buildImageUrl(prompt: string): string {
  const encoded = encodeURIComponent(prompt.trim())

  if (API_KEY) {
    const params = new URLSearchParams({
      width: '1080',
      height: '1920',
      model: MODEL,
      key: API_KEY,
    })
    return `${GEN_BASE}/${encoded}?${params}`
  }

  return `${LEGACY_BASE}/${encoded}`
}

export function buildWallpaperUrls(prompt: string) {
  const imageUrl = buildImageUrl(prompt)
  return {
    imageUrl,
    thumbnailUrl: imageUrl,
  }
}

export const HAS_POLLINATIONS_KEY = Boolean(API_KEY)
