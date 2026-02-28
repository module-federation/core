# rstest remote demo

Federated remote used by rstest demo apps.

## Running demo

- remote: [localhost:3016](http://localhost:3016/)

## How to start

```bash
# from repo root
pnpm i
nx run rstest-remote-demo:serve
```

## Build targets

```bash
nx run rstest-remote-demo:build
nx run rstest-remote-demo:build:node
```

- `build` emits browser remote output
- `build:node` emits node/commonjs remote output for federation node tests
