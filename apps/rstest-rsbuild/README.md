# rstest rsbuild adapter demo

Demonstrates `@rstest/adapter-rsbuild` with module federation test flows.

## Running demo

- host: [localhost:3025](http://localhost:3025/)
- remote: [localhost:3016](http://localhost:3016/)

## How to start

```bash
# from repo root
pnpm i

# terminal 1
pnpm --filter rstest-remote-demo run serve

# terminal 2
pnpm --filter rstest-rsbuild-demo run serve
```

## Test commands

```bash
pnpm --filter rstest-rsbuild-demo run test:node
pnpm --filter rstest-rsbuild-demo run test:browser
```

## What this covers

- rstest config extension via `withRsbuildConfig`
- federation node tests with node remote output
- browser mode tests with adapter-derived build settings
