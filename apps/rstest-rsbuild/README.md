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
nx run rstest-remote-demo:serve

# terminal 2
nx run rstest-rsbuild-demo:serve
```

## Test commands

```bash
nx run rstest-rsbuild-demo:test-node
nx run rstest-rsbuild-demo:test-browser
```

## What this covers

- rstest config extension via `withRsbuildConfig`
- federation node tests with node remote output
- browser mode tests with adapter-derived build settings
