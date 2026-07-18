import { describe, expect, it, vi } from 'vitest';
import {
  BRIDGE_SSR_PROTOCOL_VERSION,
  BridgeSSRError,
  assertBridgeJSONValue,
  getMatchingBridgeSSRPayload,
  getMatchingBridgeSSRResult,
  renderRemoteBridge,
  serializeBridgeJSON,
  serializeBridgeSSRStateEnvelope,
  toBridgeSSRReference,
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

  it('validates host-carried results before matching their identity', () => {
    const result = {
      protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
      moduleName: 'remote/app',
      instanceId: 'remote-1',
      html: '<p>remote</p>',
    } as const;

    expect(
      getMatchingBridgeSSRResult(result, {
        moduleName: 'remote/app',
        instanceId: 'remote-1',
      }),
    ).toBe(result);
    expect(
      getMatchingBridgeSSRResult(result, { moduleName: 'other/app' }),
    ).toBeUndefined();
    expect(() =>
      getMatchingBridgeSSRResult(
        { ...result, protocolVersion: 2 },
        { moduleName: 'remote/app' },
      ),
    ).toThrow(/incompatible result/);
  });

  it('creates an identity-only client reference', () => {
    const result = {
      protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
      moduleName: 'remote/app',
      instanceId: 'remote-1',
      html: '<p>remote</p>',
      dehydratedState: { ready: true },
    } as const;
    const reference = toBridgeSSRReference(result);

    expect(reference).toEqual({
      protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
      moduleName: 'remote/app',
      instanceId: 'remote-1',
    });
    expect(reference).not.toHaveProperty('html');
    expect(reference).not.toHaveProperty('dehydratedState');
    expect(Object.isFrozen(reference)).toBe(true);
    expect(
      getMatchingBridgeSSRPayload(reference, {
        moduleName: 'remote/app',
        instanceId: 'remote-1',
      }),
    ).toBe(reference);
  });

  it('serializes state separately from remote HTML', () => {
    expect(
      serializeBridgeSSRStateEnvelope({
        protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
        moduleName: 'remote/app',
        instanceId: 'remote-1',
        state: { value: '</script>\u2028\u2029' },
      }),
    ).toBe(
      '{"protocolVersion":1,"moduleName":"remote/app","instanceId":"remote-1","state":{"value":"\\u003c/script>\\u2028\\u2029"}}',
    );
    expect(() =>
      serializeBridgeSSRStateEnvelope({
        protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
        moduleName: 'remote/app',
        instanceId: 'remote-1',
        html: '<p>must not be serialized</p>',
      } as any),
    ).toThrow(/state envelope is incompatible/);
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
