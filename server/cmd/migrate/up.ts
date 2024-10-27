import { defineCommand, showUsage } from 'citty'
import consola from 'consola'
import { runMigration } from '~/database/migratectl/migrator'

export default defineCommand({
  meta: {
    name: 'migrate up',
    description: 'Migrate the database schema to the latest version',
  },
  args: {
    help: {
      type: 'boolean',
      description: 'Print information about the command',
      default: false,
    },
  },
  async run({ args, cmd }) {
    // Show help page if --help flag is used
    if (args.help) {
      showUsage(cmd)
      return
    }

    try {
      consola.info('Running database migration...')
      await runMigration('migrate')
    } catch (error) {
      consola.error(error instanceof Error ? error.message : 'Unknown error occurred')
      process.exit(1)
    }
  },
})
