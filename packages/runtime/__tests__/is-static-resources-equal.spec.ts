import { assert, describe, test, it } from 'vitest';
import { isStaticResourcesEqual } from '../src/utils/tool';
// eslint-disable-next-line max-lines-per-function
describe('isStaticResourcesEqual', () => {
  it('check resources while url not specify protocol', () => {
    const url = '//a.b.c';
    var sc = document.createElement('script');
    sc.src = url;
    expect(sc.src).toBe('http://a.b.c/');

    expect(isStaticResourcesEqual(sc.src, url)).toBe(true);
    expect(isStaticResourcesEqual(sc.src, 'http://a.b.c/')).toBe(true);
    expect(isStaticResourcesEqual(sc.src, 'http://a.b.c')).toBe(true);
  });

  it('check resources while url specify protocol(https)', () => {
    const url = 'https://a.b.c';
    var sc = document.createElement('script');
    sc.src = url;
    expect(sc.src).toBe('https://a.b.c/');

    expect(isStaticResourcesEqual(sc.src, url)).toBe(true);
    expect(isStaticResourcesEqual(sc.src, 'https://a.b.c/')).toBe(true);
    expect(isStaticResourcesEqual(sc.src, '//a.b.c')).toBe(true);
    expect(isStaticResourcesEqual(sc.src, 'a.b.c')).toBe(true);

    expect(isStaticResourcesEqual(sc.src, 'http://a.b.c')).toBe(true);
  });

  it('check resources while url specify protocol(http)', () => {
    const url = 'http://a.b.c';
    var sc = document.createElement('script');
    sc.src = url;
    expect(sc.src).toBe('http://a.b.c/');

    expect(isStaticResourcesEqual(sc.src, url)).toBe(true);
    expect(isStaticResourcesEqual(sc.src, 'http://a.b.c/')).toBe(true);
    expect(isStaticResourcesEqual(sc.src, '//a.b.c')).toBe(true);
    expect(isStaticResourcesEqual(sc.src, 'a.b.c')).toBe(true);

    expect(isStaticResourcesEqual(sc.src, 'https://a.b.c')).toBe(true);
  });
});
