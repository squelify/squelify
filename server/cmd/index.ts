import 'dotenv/config'
import { defineCommand, runMain, showUsage } from 'citty'
import pkg from '~~/package.json' assert { type: 'json' }

const main = defineCommand({
  meta: {
    name: 'app',
    version: pkg.version,
    description: `${pkg.name} Command Line Interface`,
  },
  args: {
    help: {
      type: 'boolean',
      description: 'Print information about the application',
      default: false,
    },
  },
  subCommands: {
    make: () => import('./make').then((r) => r.default),
    migrate: () => import('./migrate').then((r) => r.default),
  },
  async run({ args, cmd }) {
    // Show help page if --help flag is used or no subcommand provided
    if (args.help || args._.length === 0) {
      showUsage(cmd)
      return
    }
  },
})

runMain(main)
