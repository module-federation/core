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
nx run rstest-remote-demo:serve

# terminal 2
nx run rstest-rslib-demo:dev
```

## Test commands

```bash
nx run rstest-rslib-demo:test-node
nx run rstest-rslib-demo:test-browser
```

## What this covers

- rstest config extension via `withRslibConfig` (`libId: node/web`)
- federation node tests using commonjs node remote output
- browser mode test execution with adapter-derived config
