import { defineCommand, showUsage } from 'citty'

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
  run({ args, cmd }) {
    // Show help page if --help flag is used or no subcommand provided
    if (args.help || args._.length === 0) {
      showUsage(cmd)
      return
    }
  },
})
