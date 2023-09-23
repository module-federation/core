import { parseRemotes, parseRemoteSyntax } from './NodeFederationPlugin';

describe('parseRemotes', () => {
  // Positive test case: remotes is an empty object
  it('should return an empty object when remotes is an empty object', () => {
    const remotes = {};
    const result = parseRemotes(remotes);
    expect(result).toEqual({});
  });

  // Positive test case: remotes contains internal remotes only
  it('should return the same object when remotes contains internal remotes only', () => {
    const remotes = {
      remote1: 'internal remote1',
      remote2: 'internal remote2',
    };
    const result = parseRemotes(remotes);
    expect(result).toEqual(remotes);
  });

  // Positive test case: remotes contains global remotes only
  it('should return the parsed remotes when remotes contains global remotes only', () => {
    const remotes = {
      remote1: 'global@https://example.com/remote1',
      remote2: 'remote2@https://example.com/remote2',
    };
    const result = parseRemotes(remotes);
    expect(result).toEqual({
      remote1: 'globalThis.__remote_scope__.global@https://example.com/remote1',
      remote2:
        'globalThis.__remote_scope__.remote2@https://example.com/remote2',
    });
  });

  // Positive test case: remotes contains a mix of internal and global remotes
  it('should return the parsed remotes when remotes contains a mix of internal and global remotes', () => {
    const remotes = {
      remote1: 'internal remote1',
      remote2: 'global@https://example.com/remote2',
    };
    const result = parseRemotes(remotes);
    expect(result).toEqual({
      remote1: 'internal remote1',
      remote2: 'globalThis.__remote_scope__.global@https://example.com/remote2',
    });
  });

  // Positive test case: remotes contains relative file path
  it('should return the parsed remotes when remotes contains relative file path', () => {
    const remotes = {
      remote1: './relative/path/to/remote1',
      remote2: 'someglobal@./relative/path/to/remote2',
    };
    const result = parseRemotes(remotes);
    expect(result).toEqual({
      remote1: './relative/path/to/remote1',
      remote2:
        'globalThis.__remote_scope__.someglobal@./relative/path/to/remote2',
    });
  });

  // Negative test case: remotes is not an object
  it('should throw an error when remotes is not an object', () => {
    const remotes = 'invalid remotes';
    expect(() => parseRemotes(remotes)).toThrow('remotes must be an object');
  });
});

describe('parseRemoteSyntax', () => {
  // Positive test case: remote includes '@' and does not start with 'window', 'global', or 'globalThis'
  it('should return the parsed remote string when remote includes "@" and does not start with "window", "global", or "globalThis"', () => {
    const remote = 'global@https://example.com/remote';
    const result = parseRemoteSyntax(remote);
    expect(result).toBe(
      'globalThis.__remote_scope__.global@https://example.com/remote',
    );
  });

  // Positive test case: remote does not include '@'
  it('should return the original remote string when remote does not include "@"', () => {
    const remote = 'internal remote';
    const result = parseRemoteSyntax(remote);
    expect(result).toBe(remote);
  });

  // Positive test case: remote starts with 'window'
  it('should return the original remote string when remote starts with "window"', () => {
    const remote = 'window.testing@https://example.com/remote';
    const result = parseRemoteSyntax(remote);
    expect(result).toBe(remote);
  });

  // Positive test case: remote starts with 'global'
  it('should return the original remote string when remote starts with "global"', () => {
    const remote = 'global.testing@https://example.com/remote';
    const result = parseRemoteSyntax(remote);
    expect(result).toBe(remote);
  });

  // Positive test case: remote starts with 'globalThis'
  it('should return the original remote string when remote starts with "globalThis"', () => {
    const remote = 'globalThis.testing@https://example.com/remote';
    const result = parseRemoteSyntax(remote);
    expect(result).toBe(remote);
  });

  // Negative test case: remote is not a string
  it('should throw an error when remote is not a string', () => {
    const remote = 123;
    expect(() => parseRemoteSyntax(remote)).toThrow('remote must be a string');
  });
});
