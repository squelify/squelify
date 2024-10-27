import { defineCommand, showUsage } from 'citty'
import consola from 'consola'
import { runMigration } from '~/database/migrator'

export default defineCommand({
  meta: {
    name: 'migrate down',
    description: 'Undo the last/specified migration that was run',
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
      consola.log('🍀 Rolling back migration...')
      await runMigration('rollback')
    } catch (error) {
      consola.error(error instanceof Error ? error.message : 'Unknown error occurred')
      process.exit(1)
    }
  },
})
