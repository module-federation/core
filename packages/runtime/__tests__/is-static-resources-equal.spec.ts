import { describe, it, expect } from 'vitest';
import { isStaticResourcesEqual } from '@module-federation/runtime-core';
describe('isStaticResourcesEqual', () => {
  it('verify resources when URL does not specify protocol', () => {
    const url = '//a.b.c';
    const scriptElement = document.createElement('script');
    scriptElement.src = url;
    expect(scriptElement.src).toBe('http://a.b.c/');
    expect(isStaticResourcesEqual(scriptElement.src, url)).toBe(true);
    expect(isStaticResourcesEqual(scriptElement.src, 'http://a.b.c/')).toBe(
      true,
    );
    expect(isStaticResourcesEqual(scriptElement.src, 'http://a.b.c')).toBe(
      true,
    );
  });
  it('verify resources when URL specifies protocol (https)', () => {
    const url = 'https://a.b.c';
    const scriptElement = document.createElement('script');
    scriptElement.src = url;
    expect(scriptElement.src).toBe('https://a.b.c/');
    expect(isStaticResourcesEqual(scriptElement.src, url)).toBe(true);
    expect(isStaticResourcesEqual(scriptElement.src, 'https://a.b.c/')).toBe(
      true,
    );
    expect(isStaticResourcesEqual(scriptElement.src, '//a.b.c')).toBe(true);
    expect(isStaticResourcesEqual(scriptElement.src, 'a.b.c')).toBe(true);
    expect(isStaticResourcesEqual(scriptElement.src, 'http://a.b.c')).toBe(
      true,
    );
  });
  it('verify resources when URL specifies protocol (http)', () => {
    const url = 'http://a.b.c';
    const scriptElement = document.createElement('script');
    scriptElement.src = url;
    expect(scriptElement.src).toBe('http://a.b.c/');
    expect(isStaticResourcesEqual(scriptElement.src, url)).toBe(true);
    expect(isStaticResourcesEqual(scriptElement.src, 'http://a.b.c/')).toBe(
      true,
    );
    expect(isStaticResourcesEqual(scriptElement.src, '//a.b.c')).toBe(true);
    expect(isStaticResourcesEqual(scriptElement.src, 'a.b.c')).toBe(true);
    expect(isStaticResourcesEqual(scriptElement.src, 'https://a.b.c')).toBe(
      true,
    );
  });
});
