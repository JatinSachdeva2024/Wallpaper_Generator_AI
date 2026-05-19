import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { getDataDir } from './dataPaths.js'
import type { CategoryId, Wallpaper, WallpaperRow } from './types.js'

function resolveSqlitePath(): string {
  if (process.env.SQLITE_PATH) {
    return path.resolve(process.env.SQLITE_PATH)
  }
  const raw = process.env.DATABASE_PATH ?? ''
  if (raw.endsWith('.db')) {
    return path.resolve(raw)
  }
  return path.join(getDataDir(), 'wallpapers.db')
}

const DB_PATH = resolveSqlitePath()

export const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ??
  (process.env.DATABASE_PATH && !process.env.DATABASE_PATH.endsWith('.db')
    ? process.env.DATABASE_PATH
    : '')

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initSchema()
    console.log(`[db] SQLite: ${DB_PATH}`)
  }
  return db
}

function migrate() {
  const cols = getDb().pragma('table_info(wallpapers)') as { name: string }[]
  if (!cols.some((c) => c.name === 'image_local_path')) {
    getDb().exec(
      'ALTER TABLE wallpapers ADD COLUMN image_local_path TEXT',
    )
  }
}

function initSchema() {
  getDb().exec(`
    CREATE TABLE IF NOT EXISTS wallpapers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      prompt TEXT NOT NULL,
      image_url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      image_local_path TEXT,
      created_at TEXT NOT NULL,
      batch_date TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_wallpapers_category_date
      ON wallpapers(category, batch_date);
    CREATE INDEX IF NOT EXISTS idx_wallpapers_batch_date
      ON wallpapers(batch_date);
  `)
  migrate()
}

function resolveImageUrl(row: WallpaperRow): string {
  return `/api/wallpapers/${row.id}/image`
}

function rowToWallpaper(row: WallpaperRow): Wallpaper {
  const today = new Date().toISOString().slice(0, 10)
  const imageUrl = resolveImageUrl(row)
  return {
    id: row.id,
    title: row.title,
    category: row.category as CategoryId,
    prompt: row.prompt,
    imageUrl,
    thumbnailUrl: imageUrl,
    createdAt: row.created_at,
    isNewToday: row.batch_date.startsWith(today),
  }
}

export function clearCategoryBatch(category: CategoryId, batchDate: string) {
  getDb()
    .prepare(
      'DELETE FROM wallpapers WHERE category = ? AND batch_date = ?',
    )
    .run(category, batchDate)
}

export function clearBatch(batchDate: string) {
  getDb().prepare('DELETE FROM wallpapers WHERE batch_date = ?').run(batchDate)
}

export function insertWallpaper(row: WallpaperRow) {
  getDb()
    .prepare(
      `INSERT OR REPLACE INTO wallpapers
       (id, title, category, prompt, image_url, thumbnail_url, image_local_path, created_at, batch_date)
       VALUES (@id, @title, @category, @prompt, @image_url, @thumbnail_url, @image_local_path, @created_at, @batch_date)`,
    )
    .run(row)
}

export function getLatestBatchDate(): string | null {
  const row = getDb()
    .prepare('SELECT batch_date FROM wallpapers ORDER BY batch_date DESC LIMIT 1')
    .get() as { batch_date: string } | undefined
  return row?.batch_date ?? null
}

export function getWallpapersByCategory(
  category: CategoryId,
  batchDate?: string,
): Wallpaper[] {
  const date = batchDate ?? getLatestBatchDate()
  if (!date) return []

  const rows = getDb()
    .prepare(
      `SELECT * FROM wallpapers WHERE category = ? AND batch_date = ? ORDER BY id ASC`,
    )
    .all(category, date) as WallpaperRow[]

  return rows.map(rowToWallpaper)
}

export function getWallpaperRowById(id: string): WallpaperRow | null {
  const row = getDb()
    .prepare('SELECT * FROM wallpapers WHERE id = ?')
    .get(id) as WallpaperRow | undefined
  return row ?? null
}

export function getWallpaperById(id: string): Wallpaper | null {
  const row = getWallpaperRowById(id)
  return row ? rowToWallpaper(row) : null
}

export function getRandomWallpapers(limit: number): Wallpaper[] {
  const batchDate = getLatestBatchDate()
  if (!batchDate) return []

  const rows = getDb()
    .prepare(
      `SELECT * FROM wallpapers WHERE batch_date = ? ORDER BY RANDOM() LIMIT ?`,
    )
    .all(batchDate, limit) as WallpaperRow[]

  return rows.map(rowToWallpaper)
}

export function getAllTodaysWallpapers(): Wallpaper[] {
  const today = new Date().toISOString().slice(0, 10)
  const batchDate = getLatestBatchDate()
  const date = batchDate === today ? today : batchDate
  if (!date) return []

  const rows = getDb()
    .prepare('SELECT * FROM wallpapers WHERE batch_date = ? ORDER BY category, id')
    .all(date) as WallpaperRow[]

  return rows.map(rowToWallpaper)
}

export function countWallpapers(batchDate: string): number {
  const row = getDb()
    .prepare('SELECT COUNT(*) as c FROM wallpapers WHERE batch_date = ?')
    .get(batchDate) as { c: number }
  return row.c
}

export function countCategoryWallpapers(
  category: CategoryId,
  batchDate: string,
): number {
  const row = getDb()
    .prepare(
      'SELECT COUNT(*) as c FROM wallpapers WHERE category = ? AND batch_date = ?',
    )
    .get(category, batchDate) as { c: number }
  return row.c
}
