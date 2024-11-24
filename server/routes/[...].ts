import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { defineEventHandler } from 'h3'
import { parse, relative, resolve } from 'pathe'

const ALLOWED_EXTENSIONS = ['.html', '.css', '.json']

async function scanFunctionsDir(dir: string, baseDir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name)
    const relativePath = relative(baseDir, fullPath)

    if (entry.isDirectory()) {
      const subFiles = await scanFunctionsDir(fullPath, baseDir)
      files.push(...subFiles)
    } else {
      const { ext } = parse(entry.name)
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        files.push(relativePath)
        logger.debug('[static:scan]', `Found static file: ${relativePath}`)
      }
    }
  }

  return files
}

export default defineEventHandler(async (event) => {
  const url = event.path
  const matchedUrl = url.split('?')[0]

  try {
    const staticDir = resolve(process.cwd(), '_data/public_html')
    if (!existsSync(staticDir)) {
      logger.info('[static]', 'No public_html folder found')
      return 'No public_html folder found'
    }

    const files = await scanFunctionsDir(staticDir, staticDir)
    if (files.length === 0 && matchedUrl === '/') {
      logger.info('[static]', 'No static web files found')
      return 'Nothing to see here'
    }

    return 'This route is intended to handle embedded static pages'
  } catch (error) {
    logger.error('[static]', error)
    throw error
  }
})
