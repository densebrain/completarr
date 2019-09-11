// NPM SCRIPT

// Take binaries from argv or from package.json
export default process.argv.length > 2
  ? process.argv.slice(2)
  : Object.keys(require(process.cwd() + '/package.json').bin || {})
