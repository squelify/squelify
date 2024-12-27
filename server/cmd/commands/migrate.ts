import { defineCommand, showUsage } from 'citty'

export default defineCommand({
  meta: {
    name: 'db:migrate',
    description: 'Database migration command',
  },
  args: {
    help: {
      type: 'boolean',
      description: 'Print information about the command',
      default: false,
    },
  },
  subCommands: {
    up: () => import('./migrate-up').then((r) => r.default),
    down: () => import('./migrate-down').then((r) => r.default),
  },
  run({ args, cmd }) {
    // Show help page if --help flag is used or no subcommand provided
    if (args.help || args._.length === 0) {
      showUsage(cmd)
      return
    }
  },
})
