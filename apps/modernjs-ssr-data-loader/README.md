# modernjs-ssr

## Running Demo

**Apps**

- host: [localhost:3062](http://localhost:3062/)
- sub: [localhost:3061](http://localhost:3061/)

**Components**

- host-provider: [localhost:3063](http://localhost:3063/)
- sub-provider: [localhost:3064](http://localhost:3064/)

## How to start the demos ?

```bash
# Root directory
pnpm i

nx build modern-js-plugin

pnpm app:modern:data-loader:dev

# SSR 
open http://localhost:3062/entry-one/nested-routes/pathname
# CSR
open http://localhost:3062/entry-two
```
