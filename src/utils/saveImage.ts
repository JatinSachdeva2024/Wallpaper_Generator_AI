import { API_BASE } from '../config'

function resolveUrl(url: string): string {
  if (url.startsWith('http') || url.startsWith('blob:')) return url
  if (url.startsWith('/api/')) {
    const apiOrigin = API_BASE.startsWith('http')
      ? new URL(API_BASE).origin
      : window.location.origin
    return `${apiOrigin}${url}`
  }
  return `${window.location.origin}${url}`
}

function filename(title: string): string {
  return `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`
}

async function fetchImageBlob(imageUrl: string): Promise<Blob> {
  const res = await fetch(resolveUrl(imageUrl))
  if (!res.ok) throw new Error('Could not load image')
  const blob = await res.blob()
  if (blob.size < 500) throw new Error('Image not ready yet')
  return blob
}

/** iOS/Android: native share sheet → Save Image, Files, Drive, etc. */
export async function saveToPhotos(title: string, imageUrl: string): Promise<void> {
  const blob = await fetchImageBlob(imageUrl)
  const file = new File([blob], filename(title), { type: 'image/jpeg' })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title,
    })
    return
  }

  throw new Error('Sharing not supported — try Save to Files')
}

/** Download to device storage (Files app on mobile) */
export async function saveToFiles(title: string, imageUrl: string): Promise<void> {
  const blob = await fetchImageBlob(imageUrl)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename(title)
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function canUseNativeShare(): boolean {
  return typeof navigator.share === 'function'
}
