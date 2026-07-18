import { describe, expect, it, vi } from 'vitest';
import {
  BRIDGE_SSR_PROTOCOL_VERSION,
  BridgeSSRError,
  assertBridgeJSONValue,
  renderRemoteBridge,
  serializeBridgeJSON,
} from './index';

describe('Bridge SSR V1 contract', () => {
  it('escapes executable sequences in host-carried JSON', () => {
    expect(serializeBridgeJSON({ value: '</script>\u2028\u2029' })).toBe(
      '{"value":"\\u003c/script>\\u2028\\u2029"}',
    );
  });

  it('rejects cyclic and non-JSON state', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => assertBridgeJSONValue(cyclic)).toThrow(/cyclic/);
    expect(() => assertBridgeJSONValue({ value: Number.NaN })).toThrow(
      /finite/,
    );
  });

  it('loads, renders, and validates a remote provider', async () => {
    const renderServer = vi.fn(async (context) => ({
      protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
      moduleName: context.moduleName,
      instanceId: context.instanceId,
      html: '<p>remote</p>',
      dehydratedState: { ready: true },
    }));
    const request = new Request('http://bridge.test/detail');
    await expect(
      renderRemoteBridge({
        loader: async () => ({ default: () => ({ renderServer }) }),
        moduleName: 'remote/app',
        instanceId: 'remote-1',
        request,
        props: { intentional: true },
      }),
    ).resolves.toMatchObject({ html: '<p>remote</p>' });
    expect(renderServer).toHaveBeenCalledWith(
      expect.objectContaining({ request, signal: request.signal }),
    );
  });

  it('adds context to load and contract failures', async () => {
    await expect(
      renderRemoteBridge({
        loader: async () => {
          throw new Error('network');
        },
        moduleName: 'remote/app',
        instanceId: 'remote-1',
        request: new Request('http://bridge.test/'),
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        name: 'BridgeSSRError',
        message: 'Unable to load Bridge remote remote/app',
      }),
    );

    await expect(
      renderRemoteBridge({
        loader: async () => ({ default: () => ({}) }),
        moduleName: 'remote/app',
        instanceId: 'remote-1',
        request: new Request('http://bridge.test/'),
      }),
    ).rejects.toBeInstanceOf(BridgeSSRError);
  });
});
