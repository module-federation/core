# rstest remote demo

Federated remote used by rstest demo apps.

## Running demo

- remote: [localhost:3016](http://localhost:3016/)

## How to start

```bash
# from repo root
pnpm i
pnpm --filter rstest-remote-demo run serve
```

## Build targets

```bash
pnpm --filter rstest-remote-demo run build
pnpm --filter rstest-remote-demo run build:node
```

- `build` emits browser remote output
- `build:node` emits node/commonjs remote output for federation node tests
