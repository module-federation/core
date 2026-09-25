import { afterEach, describe, expect, it, rs } from '@rstest/core';
import {
  createModernBrowserBridge,
  createModernServerBridge,
} from './application';

function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function application() {
  return {
    mount: rs.fn(async () => {}),
    hydrate: rs.fn(async () => {}),
    update: rs.fn(async () => {}),
    destroy: rs.fn(),
  };
}
function browser() {
  rs.stubGlobal('window', {
    location: { href: 'https://host.example/dashboard?tab=goods' },
  });
}
afterEach(() => rs.unstubAllGlobals());

describe('Modern server Bridge adapter', () => {
  it('preserves the producer request, snapshot, cancellation and isolated route', async () => {
    const controller = new AbortController();
    const stream = new ReadableStream<Uint8Array>();
    const snapshot = Promise.resolve({ loaderData: { products: 3 } });
    const cancelled: unknown[] = [];
    const result = {
      stream,
      snapshot,
      cancel(reason?: unknown) {
        expect(this).toBe(result);
        cancelled.push(reason);
      },
    };
    const renderer = rs.fn(async () => result);
    const provider = createModernServerBridge({
      renderApplication: renderer,
    })();
    const rendered = await provider.renderStream({
      instanceId: 'a',
      identifierPrefix: 'a-',
      url: 'https://host.example/dashboard',
      memoryRoute: { entryPath: '/products?sort=stock' },
      basename: '/outer',
      props: { tenant: 'a' },
      headers: { cookie: 'user=a' },
      nonce: 'nonce-a',
      signal: controller.signal,
    });
    const [request, options] = renderer.mock.calls[0] as unknown as [
      Request,
      any,
    ];
    expect(request.url).toBe('https://host.example/products?sort=stock');
    expect(request.headers.get('cookie')).toBe('user=a');
    expect(options).toMatchObject({
      basename: '/',
      identifierPrefix: 'a-',
      props: { tenant: 'a' },
      nonce: 'nonce-a',
    });
    expect(rendered.stream).toBe(stream);
    expect(rendered.snapshot).toBe(snapshot);
    controller.abort();
    expect(request.signal.aborted).toBe(true);
    rendered.abort('stop');
    expect(cancelled).toEqual(['stop']);
  });
});

describe('Modern browser Bridge adapter', () => {
  it('mounts, updates and destroys the same instance while filtering host lifecycle props', async () => {
    browser();
    const app = application();
    const createApplication = rs.fn(() => app);
    const provider = createModernBrowserBridge({ createApplication })();
    const dom = {} as HTMLElement;
    const onRecoverableError = rs.fn();
    const controller = new AbortController();
    const info = {
      dom,
      signal: controller.signal,
      moduleName: 'products/app',
      basename: '/products',
      fallback: () => null,
      rootOptions: { identifierPrefix: 'p-', onRecoverableError },
      value: 1,
    };
    await provider.render(info);
    expect(app.mount).toHaveBeenCalledWith(
      dom,
      expect.objectContaining({
        url: 'https://host.example/dashboard?tab=goods',
        basename: '/products',
        props: { value: 1 },
        identifierPrefix: 'p-',
        signal: controller.signal,
        onRecoverableError,
      }),
    );
    await provider.render({ ...info, value: 2 });
    expect(app.update).toHaveBeenCalledWith(
      expect.objectContaining({ props: { value: 2 } }),
    );
    expect(createApplication).toHaveBeenCalledTimes(1);
    provider.destroy({ dom, moduleName: 'products/app' });
    provider.destroy({ dom, moduleName: 'products/app' });
    expect(app.destroy).toHaveBeenCalledTimes(1);
  });

  it('hydrates with the original snapshot and preserves recoverable-error/cancellation hooks', async () => {
    browser();
    const app = application();
    const provider = createModernBrowserBridge({
      createApplication: () => app,
    })();
    const dom = {} as HTMLElement;
    const snapshot = {
      protocol: 'modern-application/1',
      url: '/products',
      identifierPrefix: 'p-',
    };
    const signal = new AbortController().signal;
    const onRecoverableError = rs.fn();
    await provider.hydrate({
      dom,
      snapshot,
      signal,
      rootOptions: { onRecoverableError },
    });
    expect(app.hydrate).toHaveBeenCalledWith(dom, snapshot, {
      signal,
      onRecoverableError,
    });
    await expect(provider.hydrate({ dom, snapshot })).rejects.toThrow(
      'already mounted',
    );
    expect(app.mount).not.toHaveBeenCalled();
  });

  it('orders an update after the pending initial mount', async () => {
    browser();
    const pending = deferred();
    const app = application();
    app.mount.mockImplementation(() => pending.promise);
    const provider = createModernBrowserBridge({
      createApplication: () => app,
    })();
    const dom = {} as HTMLElement;
    const mounting = provider.render({ dom, value: 1 });
    const update = provider.render({ dom, value: 2 });
    await Promise.resolve();
    expect(app.update).not.toHaveBeenCalled();
    pending.resolve();
    await Promise.all([mounting, update]);
    expect(app.update).toHaveBeenCalledWith(
      expect.objectContaining({ props: { value: 2 } }),
    );
  });

  it('does not remove a replacement instance when an older mount rejects after destroy', async () => {
    browser();
    const pending = deferred();
    const old = application();
    old.mount.mockImplementation(() => pending.promise);
    const replacement = application();
    const createApplication = rs
      .fn()
      .mockReturnValueOnce(old)
      .mockReturnValue(replacement);
    const provider = createModernBrowserBridge({ createApplication })();
    const dom = {} as HTMLElement;
    const mounting = provider.render({ dom });
    const rejected = expect(mounting).rejects.toThrow('old mount failed');
    await Promise.resolve();
    provider.destroy({ dom, moduleName: 'products/app' });
    await provider.render({ dom, value: 'replacement' });
    pending.reject(Error('old mount failed'));
    await rejected;
    await provider.render({ dom, value: 'updated' });
    expect(createApplication).toHaveBeenCalledTimes(2);
    expect(replacement.update).toHaveBeenCalledTimes(1);
    expect(old.destroy).toHaveBeenCalledTimes(1);
    expect(replacement.destroy).not.toHaveBeenCalled();
  });

  it('skips an already cancelled initialization and cleans up failed hydration for retry', async () => {
    browser();
    const app = application();
    const createApplication = rs.fn(() => app);
    const provider = createModernBrowserBridge({ createApplication })();
    const dom = {} as HTMLElement;
    const controller = new AbortController();
    controller.abort();
    await provider.render({ dom, signal: controller.signal });
    expect(createApplication).not.toHaveBeenCalled();
    app.hydrate.mockRejectedValueOnce(Error('Version mismatch'));
    await expect(provider.hydrate({ dom, snapshot: {} })).rejects.toThrow(
      'Version mismatch',
    );
    expect(app.destroy).toHaveBeenCalledTimes(1);
    await provider.render({ dom });
    expect(app.mount).toHaveBeenCalledTimes(1);
  });
});
