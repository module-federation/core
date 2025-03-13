<p align="center">
  <a href="https://module-federation.io/" target="blank"><img src="https://module-federation.io/module-federation.svg" alt="Module Federation 2.0" /></a>
</p>

# @module-federation/cli

Module Federation CLI

<p>
  <a href="https://npmjs.com/package/@module-federation/cli">
   <img src="https://img.shields.io/npm/v/@module-federation/cli?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/@module-federation/cli?minimal=true"><img src="https://img.shields.io/npm/dm/@module-federation/cli.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## All commands

To view all available CLI commands, run the following command in the project directory:

```bash
npx @module-federation/cli -h
```

The output is shown below:

```bash
Usage: mf <command> [options]

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  dts [options]   generate or fetch the mf types
  help [command]  display help for command
```

### mf dts

The mf dts command is used to generate or fetch remote types.

```bash
Usage: mf dts [options]

generate or fetch the mf types

Options:
  --root <root>         specify the project root directory
  --output <output>     specify the generated dts output directory
  --fetch <boolean>     fetch types from remote, default is true (default: true)
  --generate <boolean>  generate types, default is true (default: true)
  -c --config <config>  specify the configuration file, can be a relative or absolute path
  -h, --help            display help for command
```

## Documentation

See [Documentation](https://module-federation.io/guide/start/quick-start).

## License

[MIT](https://github.com/module-federation/core/blob/main/LICENSE).
