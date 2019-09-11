import * as omelette from "omelette"
import commands from "./binaries"

if (process.platform !== 'win32') {
  for (const command of commands) {
    omelette(command).setupShellInitFile()
  }
}
