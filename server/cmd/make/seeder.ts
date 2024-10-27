import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { defineCommand, showUsage } from 'citty'
import consola from 'consola'
import { join } from 'pathe'

const SEEDER_FOLDER = join(process.cwd(), 'server/database/seeders')

async function isSeederNameUnique(name: string): Promise<boolean> {
  const files = await readdir(SEEDER_FOLDER)
  return !files.some((file) => file.split('_').slice(1).join('_') === `${name}.ts`)
}

async function getNextSeederNumber(): Promise<number> {
  const files = await readdir(SEEDER_FOLDER)
  const numbers = files
    .map((file) => Number.parseInt(file.split('_')[0] ?? '', 10))
    .filter((num) => !Number.isNaN(num))

  return Math.max(0, ...numbers) + 1
}

export default defineCommand({
  meta: {
    name: 'seeder',
    description: 'Create a new seeder file',
  },
  args: {
    name: {
      type: 'positional',
      description: 'Seeder name (e.g. user_seed)',
      required: true,
    },
    help: {
      type: 'boolean',
      description: 'Print information about the command',
      default: false,
    },
  },
  async setup() {
    try {
      // Create migration folder first
      await mkdir(SEEDER_FOLDER, { recursive: true })
    } catch (error) {
      consola.error(error instanceof Error ? error.message : 'Unknown error occurred')
      process.exit(1)
    }
  },
  async run({ args, cmd }) {
    // Show help page if --help flag is used or no subcommand provided
    if (args.help || args._.length === 0) {
      showUsage(cmd)
      return
    }

    try {
      const seederName = args.name.replace(/[^a-zA-Z0-9_]/g, '_')
      const template = `import type { Kysely } from 'kysely'
import type { Database } from '~/database/db.schema'

export async function seed(db: Kysely<Database>): Promise<void> {
	// seed code goes here...
	// note: this function is mandatory. you must implement this function.
}`
      // Check seeder name uniqueness after folder exists
      if (!(await isSeederNameUnique(seederName))) {
        consola.error(`Seeeder with name "${seederName}" already exists`)
        return
      }

      const nextNumber = await getNextSeederNumber()
      const paddedNumber = nextNumber.toString().padStart(5, '0')
      const fileName = `${paddedNumber}_${seederName}.ts`
      const seederPath = join(SEEDER_FOLDER, fileName)

      await writeFile(seederPath, template.trim(), { encoding: 'utf-8' })

      consola.success(`Seeder file created successfully: ${fileName}`)
    } catch (error) {
      consola.error(
        `Failed to create seeder: ${error instanceof Error ? error.message : String(error)}`
      )
      process.exit(1)
    }
  },
})
