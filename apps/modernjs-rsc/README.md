# modernjs-rsc

Minimal ModernJS + Module Federation RSC example in `apps/`.

## Run

```bash
pnpm nx run modernjs-rsc:serve
```

Open `http://localhost:3060`.

This app enables `experiments.rsc` + `experiments.asyncStartup` and exposes:

- `modernjs_rsc/ServerMessage`
- `modernjs_rsc/ClientCounter`
