import { AsyncLocalStorage } from 'node:async_hooks';
import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

export const ownershipKey = Symbol.for('modern-js.mf.ssr.consumption');
export default function ssrOwnership(): ModuleFederationRuntimePlugin {
  return {
    name: 'modern-ssr-consumption-owner',
    apply(instance) {
      const host = instance as any;
      if (host[ownershipKey]) return;
      const state = {
        context: new AsyncLocalStorage<object>(),
        dynamic: false,
        selective: false,
        owner: undefined as object | undefined,
      };
      Object.defineProperty(host, ownershipKey, { value: state });
      const load = instance.loadRemote;
      host.loadRemote = function (id: string, options?: { from?: string }) {
        if (options?.from !== 'build') {
          state.dynamic = true;
          if (state.selective)
            return Promise.reject(
              new Error(
                'Dynamic MF consumption violates an active static SSR update; use application rebuild mode',
              ),
            );
        }
        return load.call(this, id, options as any);
      };
      const register = instance.registerRemotes;
      host.registerRemotes = function (...args: Parameters<typeof register>) {
        if (!state.owner || state.context.getStore() !== state.owner) {
          state.dynamic = true;
          if (state.owner)
            throw new Error(
              'Remote registration outside the active SSR update owner',
            );
        }
        return register.apply(this, args);
      };
      const remove = instance.removeRemote;
      host.removeRemote = function (...args: Parameters<typeof remove>) {
        if (!state.owner || state.context.getStore() !== state.owner) {
          state.dynamic = true;
          if (state.owner)
            return Promise.reject(
              new Error('Remote removal outside the active SSR update owner'),
            );
        }
        return remove.apply(this, args);
      };
    },
  };
}
