import { describe, expect, it } from '@rstest/core';
import { initHub } from '@devframes/hub/initiate';
import { createModuleFederationDevframe } from '../src';

// Real host setup and official Agent discovery; no custom MCP implementation.
describe('Devframe host', () => {
  it('mounts a headless definition and discovers exactly four read-only capabilities', async () => {
    const hub = initHub({
      base: '/__devframes/',
      devframes: [createModuleFederationDevframe()],
      auth: false,
      ws: false,
      mcp: false,
    });
    try {
      await hub.ready;
      const ctx = await hub.context;
      const tools = ctx.agent
        .list()
        .tools.filter((t) => t.id.startsWith('module-federation:'));
      expect(tools.map((t) => t.id).sort()).toEqual([
        'module-federation:module-info',
        'module-federation:remotes',
        'module-federation:shared',
        'module-federation:status',
      ]);
      expect(
        tools.every((t) => t.safety === 'read' && t.description.length > 0),
      ).toBe(true);
      for (const tool of tools) {
        expect(await ctx.agent.invoke(tool.id, {})).toEqual({
          state: 'unavailable',
          candidates: [],
        });
      }
    } finally {
      await hub.close();
    }
  });
});

import { createRpcClient } from 'devframe/rpc/client';
import { createWsRpcChannel } from 'devframe/rpc/transports/ws-client';
import { createModuleFederationReader } from '../src/reader';

it('reads fresh page state over the real Devframe channel and requires selection across pages', async () => {
  const hub = initHub({
    base: '/__devframes/',
    devframes: [createModuleFederationDevframe()],
    auth: false,
    host: '127.0.0.1',
    ws: { sidecar: true },
    mcp: false,
  });
  const close: (() => void)[] = [];
  try {
    await hub.ready;
    const { port } = hub.connectionMeta().websocket as { port: number };
    const ctx = await hub.context;
    const host = {
      options: { name: 'page-app', remotes: [{ name: 'shop' }] },
      moduleCache: new Map(),
    };
    const reader = createModuleFederationReader(() => ({
      __FEDERATION__: { __INSTANCES__: [host] },
    }));
    const connect = async (read: () => unknown) => {
      let disconnected!: () => void;
      const closed = new Promise<void>((resolve) => {
        disconnected = resolve;
      });
      const channel = createWsRpcChannel({
        url: `ws://127.0.0.1:${port}/__ws`,
        onDisconnected: disconnected,
      });
      const client = createRpcClient(
        { 'module-federation:read-snapshot': read },
        { channel },
      );
      close.push(() => {
        client.$close();
        channel.close();
      });
      const registration = (await client.$callRaw({
        method: 'module-federation:connect-reader',
        args: [],
      })) as unknown as { pageId: string };
      return { ...registration, close: () => channel.close(), closed };
    };
    const first = await connect(reader);
    const status = (await ctx.agent.invoke('module-federation:status', {})) as {
      instances: { name: string }[];
      pageId: string;
    };
    expect(status.instances[0].name).toBe('page-app');
    expect(status.pageId).toBe(first.pageId);
    host.moduleCache.set('shop', { inited: true });
    expect(
      await ctx.agent.invoke('module-federation:remotes', {}),
    ).toMatchObject({ remotes: [{ loaded: 'loaded' }] });
    const second = await connect(() => reader());
    expect(await ctx.agent.invoke('module-federation:status', {})).toEqual({
      state: 'ambiguous',
      candidates: [{ pageId: first.pageId }, { pageId: second.pageId }],
    });
    expect(
      await ctx.agent.invoke('module-federation:status', {
        arg0: { pageId: second.pageId },
      }),
    ).toMatchObject({ state: 'available', pageId: second.pageId });
    second.close();
    await second.closed;
    await expect
      .poll(() => ctx.agent.invoke('module-federation:status', {}))
      .toMatchObject({ state: 'available', pageId: first.pageId });
  } finally {
    close.forEach((dispose) => dispose());
    await hub.close();
  }
});

it('rejects invalid browser snapshots without leaking their contents', async () => {
  const hub = initHub({
    base: '/__devframes/',
    devframes: [createModuleFederationDevframe()],
    auth: false,
    host: '127.0.0.1',
    ws: { sidecar: true },
    mcp: false,
  });
  let dispose = () => {};
  try {
    await hub.ready;
    const { port } = hub.connectionMeta().websocket as { port: number };
    const channel = createWsRpcChannel({ url: `ws://127.0.0.1:${port}/__ws` });
    const client = createRpcClient(
      { 'module-federation:read-snapshot': () => ({ cookie: 'DO_NOT_LEAK' }) },
      { channel },
    );
    dispose = () => {
      client.$close();
      channel.close();
    };
    const registration = (await client.$callRaw({
      method: 'module-federation:connect-reader',
      args: [],
    })) as unknown as { pageId: string };
    const ctx = await hub.context;
    expect(await ctx.agent.invoke('module-federation:status', {})).toEqual({
      state: 'unavailable',
      pageId: registration.pageId,
    });
  } finally {
    dispose();
    await hub.close();
  }
});
