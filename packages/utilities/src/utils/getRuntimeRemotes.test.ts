import { getRuntimeRemotes } from './getRuntimeRemotes';
import {remoteVars} from './common'

describe('getRuntimeRemotes', () => {

  afterEach(() => {
    Object.keys(remoteVars).forEach((key) => {
      delete remoteVars[key];
    });
  });

  test('returns an empty object if REMOTES is not set', () => {
    const remotes = getRuntimeRemotes();
    expect(remotes).toEqual({});
  });

  test('parses asyncContainer from thenable object', () => {
    const thenable = Promise.resolve({ get: () => true, init: () => true });
    // @ts-ignore
    remoteVars['thenable'] = thenable;
    const remotes = getRuntimeRemotes();
    expect(remotes).toEqual({ thenable: { asyncContainer: thenable } });
  });

  test('parses asyncContainer from lazily executing function', () => {
    const lazyFunction = () =>
      Promise.resolve({ get: () => true, init: () => true });
    // @ts-ignore
    remoteVars['lazyFunction'] = lazyFunction

    const remotes = getRuntimeRemotes();
    expect(remotes).toHaveProperty('lazyFunction.asyncContainer');
    expect(typeof remotes['lazyFunction'].asyncContainer).toBe('function');
  });

  test('parses delegate module', () => {
    // @ts-ignore
    Object.assign(remoteVars, {
      delegate:
        'internal some_module?remote=remoteGlobal@https://example.com/remoteEntry.js',
    });
    const remotes = getRuntimeRemotes();
    expect(remotes).toEqual({
      delegate: {
        global: 'remoteGlobal',
        url: 'https://example.com/remoteEntry.js',
      },
    });
  });

  test('parses global@url string', () => {
    // @ts-ignore
    remoteVars["remote"] =  'remoteGlobal@https://example.com/remoteEntry.js'
    const remotes = getRuntimeRemotes();
    expect(remotes).toEqual({
      remote: {
        global: 'remoteGlobal',
        url: 'https://example.com/remoteEntry.js',
      },
    });
  });

  test('throws an error for unsupported types', () => {
    // @ts-ignore
    remoteVars["unsupported"] = 42
    expect(() => getRuntimeRemotes()).toThrow(
      '[mf] Invalid value received for runtime_remote "unsupported"'
    );
  });
});
