import { randomUUID } from 'uncrypto'

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

const AUTHORS = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Maria Garcia', 'David Chen']

const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emma']
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
const DOMAINS = ['example.com', 'company.net', 'tech.co', 'mail.org', 'biz.com']

const WORDS = [
  'document',
  'report',
  'presentation',
  'image',
  'photo',
  'screenshot',
  'diagram',
  'chart',
]

export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

export const generateName = (): string => {
  return `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`
}

export const generateEmail = (name: string): string => {
  const cleanName = name.toLowerCase().replace(' ', '.')
  return `${cleanName}@${getRandomElement(DOMAINS)}`
}

export const generatePhone = (): string => {
  return `+1${Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, '0')}`
}

const getRandomDate = (): string => {
  const now = Date.now()
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000
  const randomTime = oneYearAgo + Math.random() * (now - oneYearAgo)
  return new Date(randomTime).toISOString()
}

const getFileType = (): string => {
  const types = ['image/jpeg', 'image/png', 'application/pdf']
  return getRandomElement(types)
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
  const size = 400 + Math.floor(Math.random() * 400)

  if (!type.startsWith('image/')) {
    return `https://dummyimage.com/${size}x${size}/e2e8f0/64748b&text=Document`
  }

  return `https://picsum.photos/seed/${seed}/${size}/${size}`
}

const generateRandomWords = (): string => {
  const count = 2 + Math.floor(Math.random() * 3)
  return Array.from({ length: count }, () => getRandomElement(WORDS)).join(' ')
}

export const generateDummyMedia = (count: number): MediaItem[] => {
  return Array.from({ length: count }, () => {
    const seed = randomUUID().slice(0, 8)
    const type = getFileType()
    const imageUrl = getImageUrl(seed, type)

    return {
      id: randomUUID(),
      name: `${generateRandomWords()}.${getExtensionFromType(type)}`,
      type,
      size: Math.floor(Math.random() * 10000000),
      modified: getRandomDate(),
      url: imageUrl,
      description: generateRandomWords(),
      author: getRandomElement(AUTHORS),
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
