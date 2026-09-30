import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { executeBridgeSSR } from './executor.server';
import { fetchBridgeService } from './service-http';
import type {
  BridgeSSRRequest,
  BridgeSSRResult,
} from '@module-federation/bridge-react/ssr';

rs.mock('./service-http', () => ({ fetchBridgeService: rs.fn() }));
afterEach(() => rs.clearAllMocks());
const service = {
  url: 'https://producer.test/render',
  revision: 'build-a',
  localFallback: true,
};
const request = (): BridgeSSRRequest => ({
  moduleName: 'products/app',
  instanceId: 'one',
  identifierPrefix: 'one-',
  url: 'https://host.test/',
  props: {},
  signal: new AbortController().signal,
});
function result(): BridgeSSRResult {
  return {
    revision: 'build-a',
    stream: new ReadableStream(),
    snapshot: Promise.resolve({}),
    abort: rs.fn(),
  };
}
function local(value = result()) {
  const renderStream = rs.fn(async () => value);
  return {
    value,
    renderStream,
    factory: rs.fn(() => ({ renderStream, render() {}, destroy() {} })),
  };
}
describe('Bridge execution selection', () => {
  it('does not load or execute the Node provider on HTTP success', async () => {
    const localProvider = local();
    const remote = result();
    rs.mocked(fetchBridgeService).mockResolvedValueOnce(remote);
    expect(
      await executeBridgeSSR(request(), localProvider.factory, service),
    ).toBe(remote);
    expect(localProvider.factory).not.toHaveBeenCalled();
  });
  it('does not require local artifacts or implicitly fall back when HTTP-only SSR fails', async () => {
    rs.mocked(fetchBridgeService).mockRejectedValueOnce(
      Error('service unavailable'),
    );
    const factory = rs.fn(() => {
      throw Error('The Host has no producer Node artifact');
    });
    await expect(
      executeBridgeSSR(request(), factory, {
        url: service.url,
        revision: service.revision,
      }),
    ).rejects.toThrow('service unavailable');
    expect(factory).not.toHaveBeenCalled();
  });
  it('retries a pre-metadata failure using matching local artifacts', async () => {
    rs.mocked(fetchBridgeService).mockRejectedValueOnce(Error('unavailable'));
    const localProvider = local();
    expect(
      await executeBridgeSSR(request(), localProvider.factory, service),
    ).toBe(localProvider.value);
    expect(localProvider.renderStream).toHaveBeenCalledTimes(1);
  });
  it('does not retry a returned stream that fails later', async () => {
    const remote = result();
    remote.stream = new ReadableStream({
      start(controller) {
        controller.error(Error('broken stream'));
      },
    });
    rs.mocked(fetchBridgeService).mockResolvedValueOnce(remote);
    const localProvider = local();
    const response = await executeBridgeSSR(
      request(),
      localProvider.factory,
      service,
    );
    await expect(response.stream.getReader().read()).rejects.toThrow(
      'broken stream',
    );
    expect(localProvider.factory).not.toHaveBeenCalled();
  });
  it('rejects and aborts a different local build', async () => {
    rs.mocked(fetchBridgeService).mockRejectedValueOnce(Error('unavailable'));
    const localProvider = local({ ...result(), revision: 'build-b' });
    await expect(
      executeBridgeSSR(request(), localProvider.factory, service),
    ).rejects.toThrow('revision mismatch');
    expect(localProvider.value.abort).toHaveBeenCalledTimes(1);
  });
  it('does not retry after cancellation or when fallback is disabled', async () => {
    for (const cancelled of [true, false]) {
      rs.mocked(fetchBridgeService).mockRejectedValueOnce(Error('unavailable'));
      const info = request();
      if (cancelled) info.signal = AbortSignal.abort(Error('client closed'));
      const localProvider = local();
      await expect(
        executeBridgeSSR(info, localProvider.factory, {
          ...service,
          localFallback: cancelled,
        }),
      ).rejects.toThrow('unavailable');
      expect(localProvider.factory).not.toHaveBeenCalled();
    }
  });
});
