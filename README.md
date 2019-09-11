# Typescript Completarr

Forked from `completarr` and converted to `typescript`.

# Completarr

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![npm](https://img.shields.io/npm/v/completarr.svg)](https://www.npmjs.com/package/completarr)

Completarr is a zero config way to add shell auto completion for your [yargs](https://yargs.js.org)-based CLI applications.

You may want to use this over yargs' [built-in solution](http://yargs.js.org/docs/#api-completioncmd-description-fn) if you need to support a wider range of shells (including zsh and fish).

## Installation
```
yarn add @densebrain/completarr
```

## Usage
To use Completarr, perform the following rather simple steps:

1. Integrate it into your CLI app:

   ```typescript
   import completer from "@densebrain/completarr"
   
   completer()

   // Your yargs-related code
   ```
2. Add install/uninstall hooks to your `package.json` to automatically attach the completion script the user's shell init file:

   ```json
   {
     "scripts": {
       "postinstall": "install-yargs-completion",
       "uninstall": "uninstall-yargs-completion"
     }
   }
   ```

### Caveats
There are some things to consider:

* Completarr is based on [omelette](https://github.com/f/omelette) and therefore does not support Windows. 😕
* Completarr only works with globally installed commands.
* Your yargs app needs to expose its help via [`.help()`](http://yargs.js.org/docs/#api-help) to make Completarr work.

### Configuration
Completarr should work without any config 99% of the time, but there might be some edge cases in your app you want to handle:

#### Command Name (Shell Script)
By default, Completarr adds completion for all commands it finds in your `package.json`'s `bin` field. If you got more commands there than you want completion for, you need to pass them to the install/uninstall hook explicitely:

```json5
// Your CLI app's package.json
{
  // We got three binaries:
  "bin": {
    "a": "./src/a",
    "b": "./src/b",
    "c": "./src/c"
  },
  "scripts": {
    // But we only want to install completions for "b" and "c":
    "postinstall": "install-yargs-completion b c",
    "uninstall": "uninstall-yargs-completion b c"
  }
}
```

#### Command Name (Node)
Completarr needs to know the name of your yargs root command to provide completions. By default it derives that from the binary where Completarr is included:

```typescript
// file: src/hello.ts
import completer from "@densebrain/completarr"
   
completer()


// Completarr assumes the command name is "hello"
```

However if for some reason your command name does not equal your file's name, you may pass Completarr the command name manually:

```typescript
// file: src/foo.ts
import completer from "@densebrain/completarr"
   
completer({
name: 'hello'
})


```

#### Help Option
By default, yargs' option for showing the help output is `--help`. However, should you decide to publish the help under a different option ([which yargs allows you to do](http://yargs.js.org/docs/#api-helpoption-boolean)) you'll have to tell Completarr about it:

```typescript
// We use --info instead of --help
import completer from "@densebrain/completarr"

completer({
  helpOption: 'info'
})

// yargs-related code
import Yargs from "yargs"
Yargs.help('info')
// ...
```
