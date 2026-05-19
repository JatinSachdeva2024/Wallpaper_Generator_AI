export type CategoryId =
  | 'superhero'
  | 'anime'
  | 'nature'
  | 'minimalist'
  | 'city'
  | 'abstract'

export interface WallpaperRow {
  id: string
  title: string
  category: CategoryId
  prompt: string
  image_url: string
  thumbnail_url: string
  image_local_path: string | null
  created_at: string
  batch_date: string
}

export interface Wallpaper {
  id: string
  title: string
  category: CategoryId
  prompt: string
  imageUrl: string
  thumbnailUrl: string
  createdAt: string
  isNewToday: boolean
}

export interface GeneratedPrompt {
  title: string
  prompt: string
}
