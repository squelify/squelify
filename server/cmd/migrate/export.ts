import { defineCommand, showUsage } from 'citty'
import consola from 'consola'

export default defineCommand({
  meta: {
    name: 'migrate export',
    description: 'Export current database schema to SQL file',
  },
  args: {
    help: {
      type: 'boolean',
      description: 'Print information about the command',
      default: false,
    },
  },
  run({ args, cmd }) {
    // Show help page if --help flag is used or no subcommand provided
    if (args.help || args._.length === 0) {
      showUsage(cmd)
      return
    }

    try {
      consola.log('🍀 Exporting database schema...')
    } catch (error) {
      consola.error(error instanceof Error ? error.message : 'Unknown error occurred')
      process.exit(1)
    }
  },
})
