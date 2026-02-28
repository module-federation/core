# rstest demo (rspack + federation)

## Running demo

- host: [localhost:3015](http://localhost:3015/)
- remote: [localhost:3016](http://localhost:3016/)

## How to start

```bash
# from repo root
pnpm i

# terminal 1
nx run rstest-remote-demo:serve

# terminal 2
nx run rstest-demo:serve
```

## Test commands

```bash
nx run rstest-demo:test-node
nx run rstest-demo:test-browser
```

## What this covers

- module federation tests in node mode using commonjs remote loading
- browser mode tests with playwright + rstest
- host/remote lifecycle setup for interdependent test runs
