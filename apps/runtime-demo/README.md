# runtime-demo

This example demos automatic-vendor-sharing, each host/remote will share all vendors possible, with react listed as a singleton

- `host` consumes remote.
- `remote1` exposes a blue button component.
- `remote2` exposes a red button component.

host declare remote2 in webpack.config.js, and use `@module-federation/runtime` to load remote1 dynamic

# Running Demo

Run `npm run app:runtime:dev` to start host, remote1, remote2

- host: [localhost:3005](http://localhost:3005/)
- remote1: [localhost:3006](http://localhost:3006/)
- remote2: [localhost:3007](http://localhost:3007/)
