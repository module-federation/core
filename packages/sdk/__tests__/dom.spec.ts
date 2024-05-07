import { createScript } from '../src/dom';

describe('createScript', () => {
  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  it('should create a new script element if one does not exist', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const { script, needAttach } = createScript(url, cb);

    expect(script.tagName).toBe('SCRIPT');
    expect(script.src).toBe(url);
    expect(needAttach).toBe(true);
  });

  it('should reuse an existing script element if one exists', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    document.body.innerHTML = `<script src="${url}"></script>`;
    const { script, needAttach } = createScript(url, cb);

    expect(script.tagName).toBe('SCRIPT');
    expect(script.src).toBe(url);
    expect(needAttach).toBe(false);
  });

  it('should set attributes on the script element', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const attrs = { async: true, 'data-test': 'test' };
    const { script } = createScript(url, cb, attrs);

    expect(script.async).toBe(true);
    expect(script.getAttribute('data-test')).toBe('test');
  });

  it('should call the callback when the script loads', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    const { script, needAttach } = createScript(url, cb);

    if (needAttach) {
      document.body.appendChild(script);
    }
    script?.onload?.(new Event('load'));

    expect(cb).toHaveBeenCalled();
  });

  it('should call the callback when the script times out', () => {
    const url = 'https://example.com/script.js';
    const cb = jest.fn();
    createScript(url, cb, {}, () => ({ timeout: 100 }));

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
      const { script } = createScript(url, cb);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 20000);
    });

    it('should use the timeout specified in the createScriptHook', () => {
      const url = 'https://example.com/script.js';
      const cb = jest.fn();
      const customTimeout = 5000;
      createScript(url, cb, {}, () => ({ timeout: customTimeout }));

      expect(setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        customTimeout,
      );
    });

    it('should clear the timeout when the script loads successfully', () => {
      const url = 'https://example.com/script.js';
      const cb = jest.fn();
      const { script, needAttach } = createScript(url, cb);

      if (needAttach) {
        document.body.appendChild(script);
      }
      script?.onload?.(new Event('load'));

      expect(clearTimeout).toHaveBeenCalled();
    });

    it('should clear the timeout when the script fails to load', () => {
      const url = 'https://example.com/script.js';
      const cb = jest.fn();
      const { script, needAttach } = createScript(url, cb);

      if (needAttach) {
        document.body.appendChild(script);
      }
      script?.onerror?.(new Event('error'));

      expect(clearTimeout).toHaveBeenCalled();
    });
  });
});
