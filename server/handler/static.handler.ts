import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { H3Error, sendError, sendStream } from 'h3'
import { type H3Event } from 'h3'
import { extname, join, resolve } from 'pathe'
import { process } from 'std-env'

const ALLOWED_EXTENSIONS = ['html', 'css', 'json', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg']
const DEFAULT_INDEX_FILE = 'index.html'

export async function handleStaticWeb(event: H3Event) {
  const matchedUrl = event.path.split('?')[0]

  const staticDir = resolve(process.cwd(), '_data/public_html')
  logger.debug('Static directory:', staticDir)

  if (!existsSync(staticDir)) {
    logger.error('No public_html folder found')
    return sendError(event, new H3Error('No public_html folder found'))
  }

  let filePath = join(staticDir, matchedUrl)
  logger.debug('File path:', filePath)

  // Check if the path is a directory and try to serve the default index file
  const fileStat = await stat(filePath)
  if (fileStat.isDirectory()) {
    filePath = join(filePath, DEFAULT_INDEX_FILE)
    logger.debug('Directory detected, trying index file:', filePath)
  }

  if (!existsSync(filePath)) {
    logger.error('File not found:', matchedUrl)
    return sendError(event, new H3Error('File not found'))
  }

  const fileExt = extname(filePath).slice(1)
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    logger.error('File type not allowed:', fileExt)
    return sendError(event, new H3Error('File type not allowed'))
  }

  const fileStream = createReadStream(filePath)
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return sendStream(event, fileStream)
}
