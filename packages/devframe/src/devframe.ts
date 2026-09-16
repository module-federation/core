import { CAPABILITIES, LIMITS } from './constants';
import { z } from 'zod';
import { defineDevframe, defineRpcFunction } from 'devframe';
import type {
  DevframeDefinition,
  DevframeNodeRpcSession,
  RpcBroadcastOptions,
} from 'devframe';
import {
  querySchema,
  snapshotSchema,
  type Capability,
  type PageResult,
  type Query,
} from './types';

declare const __VERSION__: string;

export const descriptions: Record<Capability, string> = {
  status:
    'Read current Module Federation presence, instances, runtime versions and available state. No lifecycle history.',
  remotes:
    'List configured remotes and currently cached producer metadata. Loaded means container initialized; missing evidence is unknown.',
  shared:
    'List current Shared scopes, every retained version, provider and configuration. Does not infer resolution history or a selected winner.',
  'module-info':
    'Read bounded, sanitized Module Federation module snapshot metadata. Excludes factories, application metadata and performance history.',
};

async function readPage(session: DevframeNodeRpcSession): Promise<PageResult> {
  const pageId = `page-${session.meta.id}`;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const value = await Promise.race([
      session.rpc.$callRaw({
        method: 'module-federation:read-snapshot',
        args: [],
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), 3000);
      }),
    ]);
    // Never forward arbitrary fields or error messages from a page to agents.
    const snapshot = snapshotSchema.parse(value);
    return { pageId, state: 'available', snapshot };
  } catch {
    return { pageId, state: 'unavailable' };
  } finally {
    clearTimeout(timer);
  }
}

/** Mount on a Devframe host; attach the /client entry in each inspected page. */
export function createModuleFederationDevframe(): DevframeDefinition {
  return defineDevframe({
    id: 'module-federation',
    name: 'Module Federation',
    version: __VERSION__,
    packageName: '@module-federation/devframe',
    homepage: 'https://module-federation.io/',
    description: 'Read-only current Module Federation runtime state.',
    capabilities: { dev: true, build: false },
    setup(ctx) {
      const sessions = new Map<number, DevframeNodeRpcSession>();
      const prune = async () => {
        // Devframe 1.0 removes disconnected channels without closing their
        // birpc handles. The public broadcast filter supplies only live peers;
        // return false for every peer so this liveness check sends no messages.
        const live = new Set<DevframeNodeRpcSession['rpc']>();
        const options: RpcBroadcastOptions<string, []> = {
          method: 'read-snapshot',
          args: [],
          filter(client) {
            live.add(client);
            return false;
          },
        };
        await ctx.scope('module-federation').rpc.broadcast(options);
        for (const [id, session] of sessions) {
          if (!live.has(session.rpc) || session.meta.isTrusted === false)
            sessions.delete(id);
        }
      };
      // Transport handshake only. It is deliberately not agent-visible and
      // accepts no page data, identifiers, URLs or MF mutations.
      ctx.rpc.register(
        defineRpcFunction({
          name: 'module-federation:connect-reader',
          type: 'query',
          jsonSerializable: true,
          handler: async () => {
            await prune();
            const session = ctx.rpc.getCurrentRpcSession();
            if (!session || session.meta.isTrusted === false)
              throw new Error('A trusted browser connection is required.');
            if (!sessions.has(session.meta.id) && sessions.size >= LIMITS.pages)
              throw new Error('Module Federation reader page limit reached.');
            sessions.set(session.meta.id, session);
            return { pageId: `page-${session.meta.id}` };
          },
        }),
      );
      for (const capability of CAPABILITIES) {
        ctx.rpc.register(
          defineRpcFunction({
            name: `module-federation:${capability}`,
            type: 'query',
            args: [querySchema] as const,
            returns: z.unknown(),
            agent: { description: descriptions[capability], safety: 'read' },
            handler: async (query: Query) => {
              await prune();
              const pages = [...sessions.values()];
              const selected = query?.pageId
                ? pages.filter((s) => `page-${s.meta.id}` === query.pageId)
                : pages;
              if (selected.length !== 1) {
                return {
                  state: selected.length > 1 ? 'ambiguous' : 'unavailable',
                  candidates: pages.map((s) => ({
                    pageId: `page-${s.meta.id}`,
                  })),
                };
              }
              const result = await readPage(selected[0]);
              if (result.state !== 'available') return result;
              const { snapshot, pageId } = result;
              const common = {
                state: 'available',
                pageId,
                boundary: snapshot.boundary,
                present: snapshot.present,
                truncated: snapshot.truncated,
              };
              if (capability === 'status')
                return {
                  ...common,
                  instances: snapshot.instances,
                  moduleInfoAvailable: snapshot.moduleInfoAvailable,
                };
              if (capability === 'remotes')
                return { ...common, remotes: snapshot.remotes };
              if (capability === 'shared')
                return { ...common, shared: snapshot.shared };
              return {
                ...common,
                moduleInfoAvailable: snapshot.moduleInfoAvailable,
                moduleInfo: snapshot.moduleInfo,
              };
            },
          }),
        );
      }
    },
  });
}
