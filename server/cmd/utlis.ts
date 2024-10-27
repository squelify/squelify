import type { CommandDef, ParsedArgs } from 'citty'

/**
 * Validates the options provided in the command line arguments against
 * the valid options defined in the command definition.
 *
 * @param args - The parsed command line arguments.
 * @param cmd - The command definition.
 * @returns `true` if the provided options are valid, otherwise throws an error.
 */
export function validateCommandOptions(args: ParsedArgs, cmd: CommandDef): boolean {
  // Get all provided options except special keys and help flag
  const providedOptions = Object.keys(args).filter((key) => key !== '_' && key !== 'help')

  // Get valid options from command definition, exclude help
  const validOptionsList = Object.keys(cmd.args).filter((opt) => opt !== 'help')

  // Find invalid options by comparing with valid list
  const invalidOptions = providedOptions.filter((opt) => !validOptionsList.includes(opt))

  if (invalidOptions.length > 0) {
    throw new Error(`Invalid options: ${invalidOptions.map((opt) => `--${opt}`).join(', ')}`)
  }

  return true
}
