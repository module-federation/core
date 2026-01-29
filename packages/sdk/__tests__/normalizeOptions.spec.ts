import { normalizeOptions } from '../src/normalizeOptions';

describe('normalizeOptions test', () => {
  it('should return false if enabledDefault is false and options is falsy', () => {
    expect(normalizeOptions(false, undefined, '')(undefined)).toBe(false);
    expect(normalizeOptions(false, {}, '')({})).toStrictEqual({});
    expect(normalizeOptions(false, true, '')(false)).toBe(false);
    expect(normalizeOptions(false, false, '')(true)).toBe(false);
    expect(normalizeOptions(false, false, '')(false)).toBe(false);
  });

  it('should return default value if options is undefined', () => {
    expect(normalizeOptions(true, { foo: 'bar' }, '')(undefined)).toStrictEqual(
      { foo: 'bar' },
    );
  });

  it('should return default value if enabledDefault is false and options is not falsy', () => {
    expect(normalizeOptions(true, undefined, '')(undefined)).toBe(undefined);
    expect(normalizeOptions(true, {}, '')(true)).toStrictEqual({});
    expect(normalizeOptions(true, {}, '')({})).toStrictEqual({});
    expect(normalizeOptions(true, true, '')(false)).toBe(false);
    expect(normalizeOptions(true, true, '')(true)).toBe(true);
    expect(normalizeOptions(true, false, '')(false)).toBe(false);
    expect(normalizeOptions(true, false, '')(true)).toBe(false);
  });

  it('should throw error if type is not correct', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      normalizeOptions(true, 1, '')('true');
    }).toThrowError();
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      normalizeOptions(true, true, '')(Symbol());
    }).toThrowError();
  });
});
