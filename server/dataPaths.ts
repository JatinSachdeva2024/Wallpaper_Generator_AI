import path from 'node:path'

/** Directory for SQLite + images (use Railway volume at /app/data). */
export function getDataDir(): string {
  if (process.env.DATA_DIR) {
    return path.resolve(process.env.DATA_DIR)
  }
  if (process.env.SQLITE_PATH) {
    return path.dirname(path.resolve(process.env.SQLITE_PATH))
  }
  return path.resolve(process.cwd(), 'data')
}

export function getImagesDir(): string {
  return path.join(getDataDir(), 'images')
}
