import { defineCommand } from 'citty'
import consola from 'consola'
import { generateRandomStr } from '~/utils/string'

export default defineCommand({
  meta: {
    name: 'app-key',
    description: 'Create application secret key',
  },
  args: {
    plain: {
      type: 'boolean',
      description: 'Print only the key',
      default: false,
    },
    help: {
      type: 'boolean',
      description: 'Print information about the command',
      default: false,
    },
  },
  run({ args }) {
    const secureKey = generateRandomStr(40)

    if (args.plain) {
      consola.log(secureKey)
      return
    }

    consola.log(`APP_SECRET_KEY=${secureKey}`)
  },
})
