import { defineCommand, showUsage } from 'citty'

export default defineCommand({
  meta: {
    name: 'make',
    description: 'Generate migration, seeder, etc',
  },
  args: {
    help: {
      type: 'boolean',
      description: 'Print information about the command',
      default: false,
    },
  },
  subCommands: {
    'app-key': () => import('./app-key').then((r) => r.default),
    migration: () => import('./migration').then((r) => r.default),
    seeder: () => import('./seeder').then((r) => r.default),
  },
  run({ args, cmd }) {
    // Show help page if --help flag is used or no subcommand provided
    if (args.help || args._.length === 0) {
      showUsage(cmd)
      return
    }
  },
})
