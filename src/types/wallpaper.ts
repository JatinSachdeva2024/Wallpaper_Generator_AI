export type CategoryId =
  | 'superhero'
  | 'anime'
  | 'nature'
  | 'minimalist'
  | 'city'
  | 'abstract'

export interface Category {
  id: CategoryId
  label: string
  emoji: string
  gradient: string
}

export interface Wallpaper {
  id: string
  title: string
  category: CategoryId
  imageUrl: string
  thumbnailUrl: string
  createdAt: string
  isNewToday: boolean
  prompt?: string
}
