import { regexEqual } from './regex-equal';

describe('regexEqual', () => {
  it('should return true for equal regex patterns', () => {
    const regex1 = /abc/i;
    const regex2 = /abc/i;

    const result = regexEqual(regex1, regex2);

    expect(result).toBe(true);
  });

  it('should return false for different regex patterns', () => {
    const regex1 = /abc/i;
    const regex2 = /def/i;

    const result = regexEqual(regex1, regex2);

    expect(result).toBe(false);
  });

  it('should return false for regex patterns with different flags', () => {
    const regex1 = /abc/i;
    const regex2 = /abc/g;

    const result = regexEqual(regex1, regex2);

    expect(result).toBe(false);
  });

  it('should return false for non-RegExp parameters', () => {
    const regex1 = 'abc';
    const regex2 = /abc/i;

    const result = regexEqual(regex1, regex2);

    expect(result).toBe(false);
  });

  it('should return false for undefined parameters', () => {
    const regex1 = undefined;
    const regex2 = /abc/i;

    const result = regexEqual(regex1, regex2);

    expect(result).toBe(false);
  });
});
