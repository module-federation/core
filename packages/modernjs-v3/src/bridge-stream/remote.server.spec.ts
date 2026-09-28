import { afterEach, expect, it, rs } from '@rstest/core';
import { loadRemote } from '@module-federation/runtime';
import { loadBridgeRemote } from './remote.server';

rs.mock('@module-federation/runtime', () => ({
  loadRemote: rs.fn(),
  getInstance: () => null,
}));
rs.mock('./styles.server', () => ({ bridgeStylesheets: () => ['/route.css'] }));
afterEach(() => rs.clearAllMocks());

it('defers Node remote loading until actual local render and forwards the real stream', async () => {
  const result = {
    revision: 'one',
    stylesheets: ['/base.css'],
    stream: new ReadableStream(),
    snapshot: Promise.resolve({}),
    abort: rs.fn(),
  };
  const renderStream = rs.fn(async () => result);
  rs.mocked(loadRemote).mockResolvedValueOnce({
    default: () => ({ renderStream }),
  });
  const remote = await loadBridgeRemote('products/app');
  expect(remote[Symbol.for('mf_module_id')]).toBe('products/app');
  const provider = remote.default();
  expect(loadRemote).not.toHaveBeenCalled();
  const info = {
    instanceId: 'one',
    identifierPrefix: 'one-',
    url: 'https://host.test/',
    props: { tenant: 'one' },
    signal: new AbortController().signal,
  };
  const response = await provider.renderStream!(info);
  expect(loadRemote).toHaveBeenCalledWith('products/app');
  expect(renderStream).toHaveBeenCalledWith(info);
  expect(response.stream).toBe(result.stream);
  expect(response.snapshot).toBe(result.snapshot);
  expect(response.stylesheets).toEqual(['/base.css', '/route.css']);
  response.abort('end');
  expect(result.abort).toHaveBeenCalledWith('end');
});
