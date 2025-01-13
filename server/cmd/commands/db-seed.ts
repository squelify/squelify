import { defineCommand, showUsage } from 'citty'
import consola from 'consola'
import { runSeeds } from '~/database/migrator'

export default defineCommand({
  meta: {
    name: 'db:seed',
    description: 'Populate your database with test or seed data',
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
      consola.log('🍀 Populating database with seeders...')
      await runSeeds()
    } catch (error) {
      consola.error(error instanceof Error ? error.message : 'Unknown error occurred')
      process.exit(1)
    }
  },
})
