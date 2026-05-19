import fs from 'node:fs'
import path from 'node:path'

const IMAGES_DIR = path.resolve(process.cwd(), 'data', 'images')

export function ensureImagesDir() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true })
}

/** Download Pollinations image and save locally. Returns filename. */
export async function downloadAndSaveImage(
  pollinationsUrl: string,
  id: string,
): Promise<string> {
  ensureImagesDir()
  const filename = `${id}.jpg`
  const filePath = path.join(IMAGES_DIR, filename)

  const maxRetries = Number(process.env.POLLINATIONS_RETRIES ?? 2)
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.log(`[image] Retry ${attempt}/${maxRetries} for ${id}…`)
      await new Promise((r) => setTimeout(r, 5000 * attempt))
    } else {
      console.log(`[image] Downloading ${id}…`)
    }

    try {
      const res = await fetch(pollinationsUrl, {
        signal: AbortSignal.timeout(120_000),
      })

      if (!res.ok) {
        throw new Error(`Pollinations failed for ${id}: ${res.status}`)
      }

      const buffer = Buffer.from(await res.arrayBuffer())
      if (buffer.length < 1000) {
        throw new Error(`Image too small for ${id} (${buffer.length} bytes)`)
      }

      fs.writeFileSync(filePath, buffer)
      console.log(
        `[image] ✓ Saved ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`,
      )
      return filename
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError ?? new Error(`Download failed for ${id}`)
}

export function getImagesDir() {
  return IMAGES_DIR
}
