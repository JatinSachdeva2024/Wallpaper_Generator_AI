import fs from 'node:fs'
import path from 'node:path'
import type { Request, Response } from 'express'
import { getWallpaperRowById } from './db.js'
import { getImagesDir } from './dataPaths.js'

export async function serveWallpaperImage(
  req: Request,
  res: Response,
): Promise<void> {
  const row = getWallpaperRowById(req.params.id)
  if (!row) {
    res.status(404).end()
    return
  }

  if (row.image_local_path) {
    const filePath = path.join(getImagesDir(), row.image_local_path)
    if (fs.existsSync(filePath)) {
      res.set('Cache-Control', 'public, max-age=86400')
      res.sendFile(filePath)
      return
    }
    console.warn(
      `[image] Missing local file ${row.image_local_path}, using remote URL`,
    )
  }

  try {
    const upstream = await fetch(row.image_url, {
      signal: AbortSignal.timeout(120_000),
    })
    if (!upstream.ok) {
      console.error(
        `[image] Upstream ${upstream.status} for ${row.id}: ${row.image_url.slice(0, 80)}…`,
      )
      res.status(502).json({ error: 'Image unavailable' })
      return
    }
    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'
    const buffer = Buffer.from(await upstream.arrayBuffer())
    if (buffer.length < 500) {
      res.status(502).json({ error: 'Image empty or invalid' })
      return
    }
    res.set('Content-Type', contentType)
    res.set('Cache-Control', 'public, max-age=3600')
    res.send(buffer)
  } catch (err) {
    console.error(`[image] Proxy failed for ${row.id}:`, err)
    res.status(502).json({ error: 'Image fetch failed' })
  }
}
