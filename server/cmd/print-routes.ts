import { readdir } from 'node:fs/promises'
import chalk from 'chalk'
import { defineCommand } from 'citty'
import Table from 'cli-table3'
import consola from 'consola'
import { resolve } from 'pathe'
import stripAnsi from 'strip-ansi'

interface RouteInfo {
  path: string
  methods: Set<string>
}

const TABLE_WIDTH = 70

const METHOD_COLORS = {
  GET: chalk.green,
  POST: chalk.yellow,
  PUT: chalk.blue,
  DELETE: chalk.red,
  PATCH: chalk.magenta,
} as const

function formatPath(path: string): string {
  const maxWidth = TABLE_WIDTH - 3
  const basePath = path.replace(/^\/api/, chalk.gray('/api'))
  const coloredPath = basePath.replace(/:(\w+)/g, (_, param) => chalk.cyan(`:${param}`))
  const rawLength = stripAnsi(path).length
  const dots = chalk.gray('·'.repeat(maxWidth - rawLength))
  return `${coloredPath} ${dots}`
}

function formatMethods(methods: Set<string>): string {
  return Array.from(methods)
    .sort()
    .map((method) => METHOD_COLORS[method]?.(method) || method)
    .join(chalk.gray(' | '))
}

function sortRoutes(a: RouteInfo, b: RouteInfo): number {
  if (a.path === '/api' && b.path !== '/api') return -1
  if (b.path === '/api' && a.path !== '/api') return 1

  const aSegments = a.path.split('/')
  const bSegments = b.path.split('/')

  for (let i = 0; i < Math.min(aSegments.length, bSegments.length); i++) {
    const aIsParam = aSegments[i].startsWith(':')
    const bIsParam = bSegments[i].startsWith(':')
    if (!aIsParam && bIsParam) return -1
    if (aIsParam && !bIsParam) return 1

    if (aSegments[i] !== bSegments[i]) {
      return aSegments[i].localeCompare(bSegments[i])
    }
  }

  return aSegments.length - bSegments.length
}

async function scanApiRoutes(dir: string, baseRoute = ''): Promise<RouteInfo[]> {
  const routesMap = new Map<string, RouteInfo>()
  const files = await readdir(dir, { withFileTypes: true })

  for (const file of files) {
    if (file.isDirectory()) {
      const dirPath = file.name.replace(/\[(\w+)\]/g, ':$1')
      const subPath = `${baseRoute}/${dirPath}`
      const subRoutes = await scanApiRoutes(resolve(dir, file.name), subPath)

      for (const route of subRoutes) {
        const existing = routesMap.get(route.path)
        if (existing) {
          for (const m of route.methods) {
            existing.methods.add(m)
          }
        } else {
          routesMap.set(route.path, route)
        }
      }
      continue
    }

    if (!file.name.endsWith('.ts')) continue

    const routePath = file.name
      .replace(/\.ts$/, '')
      .replace(/\[(\w+)\]/g, ':$1')
      .replace(/\/index$/, '')
      .replace(/^index$/, '')

    const method = routePath.split('.').slice(-1)[0].toUpperCase()
    const path = `${baseRoute}/${routePath.split('.')[0]}`
      .replace(/\/index/g, '')
      .replace(/\/{2,}/g, '/')
      .replace(/\/$/, '')

    const normalizedMethod = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
      ? method
      : 'GET'

    const existing = routesMap.get(path)
    if (existing) {
      existing.methods.add(normalizedMethod)
    } else {
      routesMap.set(path, {
        path,
        methods: new Set([normalizedMethod]),
      })
    }
  }

  return Array.from(routesMap.values())
}

export default defineCommand({
  meta: {
    name: 'print-routes',
    description: 'Prints all available routes',
  },
  args: {
    help: {
      type: 'boolean',
      description: 'Print information about the command',
      default: false,
    },
  },
  async run() {
    try {
      const apiDir = resolve(process.cwd(), 'server/api')
      const routes = await scanApiRoutes(apiDir)

      const table = new Table({
        head: ['Methods', 'Path'],
        colWidths: [20, TABLE_WIDTH],
        colAligns: ['right', 'left'],
        chars: {
          top: '─',
          'top-mid': '┬',
          'top-left': '┌',
          'top-right': '┐',
          bottom: '─',
          'bottom-mid': '┴',
          'bottom-left': '└',
          'bottom-right': '┘',
          left: '│',
          'left-mid': '├',
          mid: '─',
          'mid-mid': '┼',
          right: '│',
          'right-mid': '┤',
          middle: '│',
        },
        style: {
          head: ['cyan'],
          border: ['gray'],
          compact: true,
        },
      })

      for (const route of routes.sort(sortRoutes)) {
        table.push([formatMethods(route.methods), formatPath(route.path)])
      }

      consola.log(table.toString())
    } catch (error) {
      consola.error(error instanceof Error ? error.message : 'Unknown error occurred')
      process.exit(1)
    }
  },
})
