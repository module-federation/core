# rstest rslib adapter demo

Demonstrates `@rstest/adapter-rslib` with node and browser rstest projects.

## Running demo

- host (rslib mf-dev): [localhost:3035](http://localhost:3035/)
- remote: [localhost:3016](http://localhost:3016/)

## How to start

```bash
# from repo root
pnpm i

# terminal 1
pnpm --filter rstest-remote-demo run serve

# terminal 2
pnpm --filter rstest-rslib-demo run dev
```

## Test commands

```bash
pnpm --filter rstest-rslib-demo run test:node
pnpm --filter rstest-rslib-demo run test:browser
```

## What this covers

- rstest config extension via `withRslibConfig` (`libId: node/web`)
- federation node tests using commonjs node remote output
- browser mode test execution with adapter-derived config
