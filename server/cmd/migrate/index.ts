import { defineCommand, showUsage } from 'citty'

export default defineCommand({
  meta: {
    name: 'migrate',
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
    up: () => import('./up').then((r) => r.default),
    down: () => import('./down').then((r) => r.default),
    reset: () => import('./reset').then((r) => r.default),
    seed: () => import('./seed').then((r) => r.default),
    status: () => import('./status').then((r) => r.default),
    export: () => import('./export').then((r) => r.default),
  },
  run({ args, cmd }) {
    // Show help page if --help flag is used or no subcommand provided
    if (args.help || args._.length === 0) {
      showUsage(cmd)
      return
    }
  },
})
