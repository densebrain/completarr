module.exports = function completeYargs ({ name, helpOption = 'help' } = {}) {
  // Auto-detect command name from binary file name
  if (!name) {
    const filePath = (new Error()).stack.split('\n')[2].match(/\((.+):[0-9]+:[0-9]+\)$/)[1]
    name = require('path').basename(filePath)
  }

  // Print the default completion script
  if (process.argv.includes('--completion')) {
    require('omelette')(name).init()
    process.exit()
  }

  // Only create completions when the --compgen flag has been set
  // (by the completion script omelette registered in the shell)
  if (!process.argv.includes('--compgen')) return

  const { spawnSync } = require('child_process')

  /**
   * Creates an object from an array of key-value pairs
   *
   * @param {Array} entries The entries array
   * @return {Object} The generated object
   */
  const fromEntries = entries => {
    return entries.reduce((carry, [ key, value ]) => ({
      ...carry,
      [key]: value
    }), {})
  }

  // Get the currently typed command as a string & parse it
  const typedCommandString = process.argv[process.argv.indexOf('--compgen') + 3]
  const typedCommandParts = require('string-argv')(typedCommandString)

  // If the command doesn't end with a space, we most likely have
  // an unfinished typed command which is unknown by yargs.
  // Therefore we'll pop it from the command array.
  if (!typedCommandString.endsWith(' ')) {
    typedCommandParts.pop()
  }

  const typedCommandArgv = require('yargs-parser')(typedCommandParts)

  // Use the arguments (without any --options) and attach the
  // --help flag to get completions from the help output.
  const helpOutput = String(spawnSync(
    `LC_ALL=C`, // Force yargs to do output in English
    [ ...typedCommandArgv._, `--${helpOption}` ],
    { shell: true }
  ).stdout || '')

  // Get the string blocks containing available commands/options...
  const [ , commandLines ] = helpOutput.match(/\nCommands:\n([\s\S]+?)\n(\n|$)/) || [ null, '' ]
  const [ , optionLines ] = helpOutput.match(/\nOptions:\n([\s\S]+?)\n(\n|$)/) || [ null, '' ]

  // ...and parse them
  const commands = commandLines
    .split('\n')
    .map(line => line.match(/^ {2}.*?(\S+?)( {2}|$)/))
    .filter(match => match !== null)
    .map(match => match[1])

  const options = optionLines
    .split('\n')
    .map(line => line.match(/^ {2}(--?\S+?)[\s,$]/))
    .filter(match => match !== null)
    .map(match => match[1])
    .filter(option => !typedCommandParts.includes(option))

  // If the typed command already includes any --options,
  // don't offer any further commands.
  const completionArray = typedCommandParts.some(arg => arg.startsWith('-'))
    ? [ ...options ]
    : [ ...commands, ...options ]

  // Generate an omelette-consumable configuration tree
  const completionObject = fromEntries(completionArray.map(item => [ item, [] ]))

  // To make omelette accept the completions, we need to nest them in
  // an object which represents the already-typed arguments
  const completions = typedCommandParts
    .slice(1)
    .reverse()
    .reduce((carry, arg) => ({ [arg]: carry }), completionObject)

  // Start omelette
  const completion = require('omelette')(name).tree(completions)
  completion.init()

  // Terminate the process to avoid running any yargs logic
  // (which may interfere with autocompletion output)
  process.exit()
}
