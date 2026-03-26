import { createScript, createLink } from '../src/dom';

describe('createScript', () => {
  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  it('should create a new script element if one does not exist', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const { script, needAttach } = createScript({ url, cb });

    expect(script.tagName).toBe('SCRIPT');
    expect(script.src).toBe(url);
    expect(needAttach).toBe(true);
  });

  it('should reuse an existing script element if one exists', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    document.body.innerHTML = `<script src="${url}"></script>`;
    const { script, needAttach } = createScript({ url, cb });

    expect(script.tagName).toBe('SCRIPT');
    expect(script.src).toBe(url);
    expect(needAttach).toBe(false);
  });

  it('should set attributes on the script element', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const attrs = { async: true, 'data-test': 'test' };
    const { script } = createScript({ url, cb, attrs });

    expect(script.async).toBe(true);
    expect(script.getAttribute('data-test')).toBe('test');
  });

  it('should call the callback when the script loads', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const { script, needAttach } = createScript({ url, cb });

    if (needAttach) {
      document.body.appendChild(script);
    }
    script?.onload?.(new Event('load'));

    expect(cb).toHaveBeenCalled();
  });

  it('should call onErrorCallback (not cb) when the script times out', () => {
    jest.useFakeTimers();
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const onErrorCallback = jest.fn();
    createScript({
      url,
      cb,
      onErrorCallback,
      attrs: {},
      createScriptHook: () => ({ timeout: 100 }),
    });

    jest.advanceTimersByTime(100);

    expect(onErrorCallback).toHaveBeenCalledTimes(1);
    expect(cb).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  describe('Timeout', () => {
    beforeEach(() => {
      jest.spyOn(global, 'setTimeout');
      jest.spyOn(global, 'clearTimeout'); // Add this line
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('should use the default timeout of 20000ms if no timeout is specified', () => {
      const url = 'https://example.com/script.js';
      const cb = jest.fn();
      const { script } = createScript({ url, cb });

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 20000);
    });

    it('should use the timeout specified in the createScriptHook', () => {
      const url = 'https://example.com/script.js';
      const cb = jest.fn();
      const customTimeout = 5000;
      createScript({
        url,
        cb,
        attrs: {},
        createScriptHook: () => ({ timeout: customTimeout }),
      });

      expect(setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        customTimeout,
      );
    });

    it('should clear the timeout when the script loads successfully', () => {
      const url = 'https://example.com/script.js';
      const cb = jest.fn();
      const { script, needAttach } = createScript({ url, cb });

      if (needAttach) {
        document.body.appendChild(script);
      }
      script?.onload?.(new Event('load'));

      expect(clearTimeout).toHaveBeenCalled();
    });

    it('should clear the timeout when the script fails to load', () => {
      const url = 'https://example.com/script.js';
      const cb = jest.fn();
      const { script, needAttach } = createScript({ url, cb });

      if (needAttach) {
        document.body.appendChild(script);
      }
      script?.onerror?.(new Event('error'));

      expect(clearTimeout).toHaveBeenCalled();
    });

    it('should set section attributes on the script element', () => {
      const url = 'https://example.com/script.js';
      const scriptHookUrl = 'https://example.com/hook-script.js';
      const cb = jest.fn();
      const attrs = {
        async: true,
        'data-test': 'test',
        crossOrigin: 'anonymous',
      };
      const { script } = createScript({
        url,
        cb,
        attrs,
        createScriptHook: (url) => {
          const scriptEle = document.createElement('script');
          scriptEle.src = scriptHookUrl;
          scriptEle.crossOrigin = 'use-credentials';
          scriptEle.async = false;
          return scriptEle;
        },
      });

      // if user return element by createScriptHook, it will not add default attrs
      expect(script.src).toBe(scriptHookUrl);
      expect(script.async).toBe(false);
      expect(script.crossOrigin).toBe('use-credentials');
      expect(script.getAttribute('data-test')).toBe(null);
    });
  });
});

describe('createScript - error handling', () => {
  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
    jest.restoreAllMocks();
  });

  it('onerror calls onErrorCallback with a ScriptNetworkError', () => {
    const url = 'https://example.com/network-error.js';
    const cb = jest.fn();
    const onErrorCallback = jest.fn();
    const { script, needAttach } = createScript({ url, cb, onErrorCallback });

    if (needAttach) document.body.appendChild(script);
    script?.onerror?.(new Event('error'));

    expect(onErrorCallback).toHaveBeenCalledTimes(1);
    const err = onErrorCallback.mock.calls[0][0] as Error;
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ScriptNetworkError');
    expect(err.message).toContain(url);
    expect(err.message).toContain('network');
    expect(cb).not.toHaveBeenCalled();
  });

  it('window ErrorEvent with matching filename calls onErrorCallback with ScriptExecutionError and does not call cb', () => {
    const url = 'https://example.com/exec-error.js';
    const cb = jest.fn();
    const onErrorCallback = jest.fn();
    const { script, needAttach } = createScript({ url, cb, onErrorCallback });

    if (needAttach) document.body.appendChild(script);

    // Simulate IIFE throwing during execution before onload fires
    window.dispatchEvent(
      new ErrorEvent('error', {
        message: 'TypeError: x is not a function',
        filename: url,
        lineno: 10,
        colno: 5,
        bubbles: true,
      }),
    );

    // Browser still fires onload even when the IIFE threw
    script?.onload?.(new Event('load'));

    expect(onErrorCallback).toHaveBeenCalledTimes(1);
    const err = onErrorCallback.mock.calls[0][0] as Error;
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ScriptExecutionError');
    expect(err.message).toContain(url);
    expect(err.message).toContain('TypeError: x is not a function');
    expect(cb).not.toHaveBeenCalled();
  });

  it('window ErrorEvent from a different url does not trigger onErrorCallback', () => {
    const url = 'https://example.com/my-script.js';
    const otherUrl = 'https://example.com/other-script.js';
    const cb = jest.fn();
    const onErrorCallback = jest.fn();
    const { script, needAttach } = createScript({ url, cb, onErrorCallback });

    if (needAttach) document.body.appendChild(script);

    window.dispatchEvent(
      new ErrorEvent('error', {
        message: 'ReferenceError: foo is not defined',
        filename: otherUrl,
        lineno: 1,
        colno: 1,
        bubbles: true,
      }),
    );

    script?.onload?.(new Event('load'));

    expect(onErrorCallback).not.toHaveBeenCalled();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('window error listener is removed after onload fires', () => {
    const url = 'https://example.com/remove-on-load.js';
    const cb = jest.fn();
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { script, needAttach } = createScript({ url, cb });

    if (needAttach) document.body.appendChild(script);
    script?.onload?.(new Event('load'));

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
    );
  });

  it('timeout calls onErrorCallback with ScriptNetworkError containing "timed out"', () => {
    jest.useFakeTimers();
    const url = 'https://example.com/timeout-error.js';
    const cb = jest.fn();
    const onErrorCallback = jest.fn();
    createScript({
      url,
      cb,
      onErrorCallback,
      attrs: {},
      createScriptHook: () => ({ timeout: 500 }),
    });

    jest.advanceTimersByTime(500);

    expect(onErrorCallback).toHaveBeenCalledTimes(1);
    const err = onErrorCallback.mock.calls[0][0] as Error;
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ScriptNetworkError');
    expect(err.message).toContain(url);
    expect(err.message).toContain('timed out');
    expect(cb).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('timeout removes window error listener', () => {
    jest.useFakeTimers();
    const url = 'https://example.com/timeout-cleanup.js';
    const cb = jest.fn();
    const onErrorCallback = jest.fn();
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    createScript({
      url,
      cb,
      onErrorCallback,
      attrs: {},
      createScriptHook: () => ({ timeout: 100 }),
    });

    jest.advanceTimersByTime(100);

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
    );
    jest.useRealTimers();
  });

  it('onload after timeout does not call cb or onErrorCallback again', () => {
    jest.useFakeTimers();
    const url = 'https://example.com/late-load.js';
    const cb = jest.fn();
    const onErrorCallback = jest.fn();
    const { script, needAttach } = createScript({
      url,
      cb,
      onErrorCallback,
      attrs: {},
      createScriptHook: () => ({ timeout: 100 }),
    });
    if (needAttach) document.body.appendChild(script);

    jest.advanceTimersByTime(100);
    expect(onErrorCallback).toHaveBeenCalledTimes(1);

    // onload fires late (after timeout already cleared script.onload)
    script?.onload?.(new Event('load'));

    expect(cb).not.toHaveBeenCalled();
    expect(onErrorCallback).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('window error listener is removed after onerror fires', () => {
    const url = 'https://example.com/remove-on-error.js';
    const cb = jest.fn();
    const onErrorCallback = jest.fn();
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { script, needAttach } = createScript({ url, cb, onErrorCallback });

    if (needAttach) document.body.appendChild(script);
    script?.onerror?.(new Event('error'));

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'error',
      expect.any(Function),
    );
  });
});

describe('createLink', () => {
  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  it('should create a new link element if one does not exist', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const { link, needAttach } = createLink({
      url,
      cb,
      attrs: { as: 'script' },
    });

    expect(link.tagName).toBe('LINK');
    expect(link.href).toBe(url);
    expect(link.getAttribute('as')).toBe('script');
    expect(needAttach).toBe(true);
  });

  xit('should reuse an existing link element if one exists', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    document.head.innerHTML = `<link href="${url}" rel="preload" as="script">`;
    const { link, needAttach } = createLink({
      url,
      cb,
      attrs: {
        rel: 'preload',
        as: 'script',
      },
    });

    expect(link.tagName).toBe('LINK');
    expect(link.href).toBe(url);
    expect(needAttach).toBe(false);
  });

  it('should set attributes on the link element', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const attrs = { rel: 'preload', as: 'script', 'data-test': 'test' };
    const { link } = createLink({ url, cb, attrs });

    expect(link.rel).toBe('preload');
    expect(link.getAttribute('as')).toBe('script');
    expect(link.getAttribute('data-test')).toBe('test');
  });

  it('should set section attributes on the link element', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const attrs = {
      rel: 'preload',
      as: 'script',
      'data-test': 'test',
      crossOrigin: 'anonymous',
    };
    const { link } = createLink({
      url,
      cb,
      attrs,
      createLinkHook: (url) => {
        const linkEle = document.createElement('link');
        linkEle.href = url;
        linkEle.crossOrigin = 'use-credentials';
        return linkEle;
      },
    });

    // if user return element by createLinkHook, it will not add default attrs
    expect(link.rel).toBe('');
    expect(link.crossOrigin).toBe('use-credentials');
    expect(link.getAttribute('as')).toBe(null);
    expect(link.getAttribute('data-test')).toBe(null);
  });

  it('should call the callback when the link loads', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const { link, needAttach } = createLink({
      url,
      cb,
      attrs: { as: 'script' },
    });

    if (needAttach) {
      document.head.appendChild(link);
    }
    link?.onload?.(new Event('load'));

    expect(cb).toHaveBeenCalled();
  });

  it('should call the callback when the link fails to load', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const onErrorCallback = jest.fn();
    const { link, needAttach } = createLink({
      url,
      cb,
      onErrorCallback,
      attrs: { as: 'script' },
    });

    if (needAttach) {
      document.head.appendChild(link);
    }
    link?.onerror?.(new Event('error'));
    expect(onErrorCallback).toHaveBeenCalled();
  });

  it('should use the link element returned by createLinkHook', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const customLink = document.createElement('link');
    customLink.href = url;
    customLink.rel = 'preload';
    customLink.setAttribute('as', 'script');
    const { link } = createLink({
      url,
      cb,
      attrs: {},
      createLinkHook: () => customLink,
    });

    expect(link).toBe(customLink);
  });
});
