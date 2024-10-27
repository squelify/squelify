import 'dotenv/config'
import { runMigration, runSeeds } from './migrator'

const isRunningFromCLI = (): boolean => process.argv.length > 2

async function handleCommand(command: string): Promise<void> {
  switch (command) {
    case 'migrate':
      console.info('\n🍀 Running database migration...')
      await runMigration('migrate')
      break
    case 'rollback':
      console.info('\n🍀 Rolling back migration...')
      await runMigration('rollback')
      break
    case 'reset':
      console.info('\n🍀 Refresh database migration...')
      await runMigration('reset')
      break
    case 'seed':
      if (!isRunningFromCLI()) {
        console.error('🔥 This command must be executed via CLI')
        process.exit(0)
      }
      console.info('\n🍀 Populating database with seeders...')
      await runSeeds()
      break
    case 'generate':
      console.warn('🔥 Not yet implemented...\n')
      break
    default:
      console.warn('🔥 Invalid argument provided!')
      process.exit(0)
  }
}

// If migration fails and called from cli, exit with error code 1.
if (isRunningFromCLI() && process.argv[2]) {
  handleCommand(process.argv[2])
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
