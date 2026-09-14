import { startProviderAssetServer } from './provider-assets.ts';

const port = Number(process.env.PORT ?? 43110);
const assets = await startProviderAssetServer({ port });

console.error(`Federated skill providers listening at ${assets.origin}`);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void assets.close().then(() => process.exit(0));
  });
}
