import { loadRemote, getInstance } from '@module-federation/runtime';
import type { BridgeRemoteModule } from './remote';
import { bridgeStylesheets } from './styles.server';

/** Resolve the Bridge wrapper without executing a Node remote on the HTTP path. */
export async function loadBridgeRemote(
  moduleName: string,
): Promise<BridgeRemoteModule> {
  return {
    [Symbol.for('mf_module_id')]: moduleName,
    default: () => ({
      async renderStream(info) {
        const remote = await loadRemote<BridgeRemoteModule>(moduleName);
        if (info.signal.aborted) throw info.signal.reason;
        const provider = remote?.default();
        if (!provider?.renderStream)
          throw Error(`Bridge application ${moduleName} does not support SSR`);
        const result = await provider.renderStream(info);
        return {
          ...result,
          stylesheets: [
            ...new Set([
              ...(result.stylesheets || []),
              ...bridgeStylesheets(moduleName, getInstance()),
            ]),
          ],
        };
      },
      render() {
        throw Error('A Node Bridge application cannot mount into a DOM.');
      },
      destroy() {},
    }),
  };
}
