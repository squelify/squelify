import { defineCommand, showUsage } from 'citty'
import consola from 'consola'
import { validateCommandOptions } from '~/cmd/utlis'
import { runMigration, runSeeds } from '~/database/migratectl/migrator'

export default defineCommand({
  meta: {
    name: 'migrate reset',
    description: 'Rollback all migrations, optionaly can re-run the migration',
  },
  args: {
    migrate: {
      type: 'boolean',
      description: 'Run migrations after reset',
      default: false,
    },
    seed: {
      type: 'boolean',
      description: 'Run seeders after reset',
      default: false,
    },
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
      // Validate command arguments
      validateCommandOptions(args, cmd)

      if (args.seed && !args.migrate) {
        consola.error('Cannot run seeder without migration')
        return
      }

      consola.info('Reset database migration...')
      await runMigration('reset')

      if (args.migrate) {
        consola.info('Running database migration...')
        await runMigration('migrate')
      }

      if (args.seed) {
        consola.info('Populating database with seeders...')
        await runSeeds()
      }
    } catch (error) {
      consola.error(error instanceof Error ? error.message : 'Unknown error occurred')
      process.exit(1)
    }
  },
})
