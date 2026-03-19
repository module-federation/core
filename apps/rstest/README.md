# rstest demo (rspack + federation)

## Running demo

- host: [localhost:3015](http://localhost:3015/)
- remote: [localhost:3016](http://localhost:3016/)

## How to start

```bash
# from repo root
pnpm i

# terminal 1
pnpm --filter rstest-remote-demo run serve

# terminal 2
pnpm --filter rstest-demo run serve
```

## Test commands

```bash
pnpm --filter rstest-demo run test:node
pnpm --filter rstest-demo run test:browser
```

## What this covers

- module federation tests in node mode using commonjs remote loading
- browser mode tests with playwright + rstest
- host/remote lifecycle setup for interdependent test runs
