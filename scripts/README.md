# local npm registry

Provided by Verdaccio.

Configuration location: `<root>/.verdaccio`

## Usage:

- any platform

```bash
# npm
npm run local-registry OPTIONS
# yarn
yarn local-registry OPTIONS
```

- linux/macOS

```bash
./scripts/local-registry.sh OPTIONS
# or
git bash + ./scripts/local-registry.sh OPTIONS
```

- windows:

```bash
./scripts/local-registry.bat OPTIONS
# or
git bash + ./scripts/local-registry.sh OPTIONS
```

- nix:

```bash
npm run local-registry — OPTIONS
```

## Starting

To start, run with `enable` and `start` options

## Publishing

To publish package use:

`nx run publish package_name: publish --ver=0.0.0 latest`

> Note: 0.0.0 is desired version and latest is desired npm tag

## Finishing

To finish: kill verdaccio process and run with disable option

## Options

Available options:

`start` - starts local registry

`enable`/`disable` - updates global npm path to registry

`clear` - cleans local copy of npm registry

Scripts:

- `<root>/scripts/local-registry.sh`

- `<root>/package.json: "local-registry": "./scripts/local-registry.sh"`
