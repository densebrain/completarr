
import { join } from "path"
import commands from "./binaries"
import { existsSync, readFileSync, writeFileSync } from "fs"

if (process.platform !== 'win32') {
  
  const
    { HOME, SHELL } = process.env,
    shellFile = SHELL.match(/bash/) ? join(HOME, '.bash_profile')
      : SHELL.match(/zsh/) ? join(HOME, '.zshrc')
      : SHELL.match(/fish/) ? join(HOME, '.config/fish/config.fish')
      : null


  if (shellFile && existsSync(shellFile)) {
    let shellFileContents = readFileSync(shellFile, 'utf8')

    // From: https://stackoverflow.com/a/6969486/2048874
    const escape = str => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

    for (const command of commands) {
      const block = `
# begin ${command} completion
. <(${command} --completion)
# end ${command} completion
`

      shellFileContents = shellFileContents.replace(new RegExp(escape(block), 'g'), '')
    }

    writeFileSync(shellFile, shellFileContents)
  }
}
