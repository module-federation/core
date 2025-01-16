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

  it('should call the callback when the script times out', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    createScript({
      url,
      cb,
      attrs: {},
      createScriptHook: () => ({ timeout: 100 }),
    });

    setTimeout(() => {
      expect(cb).toHaveBeenCalled();
    }, 150);
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
