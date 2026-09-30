import { createInstance } from '@module-federation/runtime';
import type { BridgeRemoteModule } from './remote';
import { createBridgeServiceHandler } from './service-http';
import { bridgeStylesheets } from './styles.server';

export interface BridgeServiceMiddlewareOptions {
  path: string;
  manifest: string;
  module: string;
  revision: string;
}

/** Expose the producer's real MF Node application through Modern's HTTP server. */
export function createBridgeServiceMiddleware(
  options: BridgeServiceMiddlewareOptions,
) {
  let runtime: ReturnType<typeof createInstance> | undefined;
  const handler = createBridgeServiceHandler({
    revision: options.revision,
    async render(info) {
      runtime ||= createInstance({
        name: `bridge_service_${options.module.replace(/\W/g, '_')}_${options.revision}`,
        remotes: [
          { name: options.module.split('/')[0], entry: options.manifest },
        ],
        shared: {},
      });
      const remote = await runtime.loadRemote<BridgeRemoteModule>(
        options.module,
      );
      if (info.signal.aborted) throw info.signal.reason;
      const provider = remote?.default();
      if (!provider?.renderStream)
        throw Error('Bridge service requires a Node application expose');
      const result = await provider.renderStream(info);
      result.snapshot.catch(() => {});
      result.hydration?.snapshot.catch(() => {});
      if (result.revision !== options.revision) {
        result.abort(Error('Bridge service build revision mismatch'));
        throw Error('Bridge service build revision mismatch');
      }
      return {
        ...result,
        stylesheets: [
          ...new Set([
            ...(result.stylesheets || []),
            ...bridgeStylesheets(options.module, runtime),
          ]),
        ],
      };
    },
  });
  return (
    context: { req: { raw: Request } },
    next: () => Promise<void>,
  ): Promise<Response | void> =>
    new URL(context.req.raw.url).pathname === options.path
      ? handler(context.req.raw)
      : next();
}

export { createBridgeServiceHandler, fetchBridgeService } from './service-http';
