import { copycat } from '@snaplet/copycat'

export interface MediaItem {
  id: string
  name: string
  type: string
  size: number
  modified: string
  url: string
  description?: string
  author?: string
}

const getRandomDate = (seed: string): string => {
  const now = Math.floor(Date.now() / 1000)
  const oneYearAgo = now - 365 * 24 * 60 * 60
  const hash = copycat.uuid(seed).replace(/-/g, '')
  const timestamp = oneYearAgo + (Number.parseInt(hash.slice(0, 8), 16) % (now - oneYearAgo))
  return new Date(timestamp * 1000).toISOString()
}

const getFileType = (seed: string): string => {
  const types = ['image/jpeg', 'image/png', 'application/pdf']
  const hash = copycat.uuid(seed).replace(/-/g, '')
  return types[Number.parseInt(hash.slice(0, 8), 16) % types.length]
}

const getExtensionFromType = (type: string): string => {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
  }
  return extensions[type] || 'txt'
}

const getImageUrl = (seed: string, type: string): string => {
  const hash = copycat.uuid(seed).replace(/-/g, '')
  const size = 400 + (Number.parseInt(hash.slice(0, 8), 16) % 400)

  if (!type.startsWith('image/')) {
    return `https://dummyimage.com/${size}x${size}/e2e8f0/64748b&text=Document`
  }

  return `https://picsum.photos/seed/${hash.slice(0, 8)}/${size}/${size}`
}

export const generateDummyMedia = (count: number): MediaItem[] => {
  return Array.from({ length: count }, (_, index) => {
    const seed = `media-${index}`
    const type = getFileType(seed)
    const imageUrl = getImageUrl(seed, type)

    return {
      id: copycat.uuid(seed),
      name: `${copycat.words(seed)}.${getExtensionFromType(type)}`,
      type,
      size: Number.parseInt(copycat.uuid(`size-${seed}`).slice(0, 8), 16) % 10000000,
      modified: getRandomDate(seed),
      url: imageUrl,
      description: copycat.words(`desc-${seed}`),
      author: copycat.fullName(`author-${seed}`),
    }
  })
}

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}
