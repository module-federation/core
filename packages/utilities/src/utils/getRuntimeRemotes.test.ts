import { getRuntimeRemotes } from './getRuntimeRemotes';
import { remoteVars } from './pure';

xdescribe('getRuntimeRemotes', () => {
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
    remoteVars['lazyFunction'] = lazyFunction;

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
    remoteVars['remote'] = 'remoteGlobal@https://example.com/remoteEntry.js';
    const remotes = getRuntimeRemotes();
    expect(remotes).toEqual({
      remote: {
        global: 'remoteGlobal',
        url: 'https://example.com/remoteEntry.js',
      },
    });
  });

  test('console.warn should be called for unsupported types', () => {
    console.warn = jest.fn();
    // @ts-ignore
    remoteVars['unsupported'] = 42;
    // Call the function that triggers the warning message
    getRuntimeRemotes();
    // Check that console.warn was called with the correct message
    //@ts-ignore
    expect(console.warn.mock.calls[0][0]).toMatch(
      /Unable to retrieve runtime remotes/,
    );
    //@ts-ignore
    console.log(console.warn.mock.calls[0][1].message);
    //@ts-ignore
    expect(console.warn.mock.calls[0][1].message).toMatch(/runtime_remote/);
    //@ts-ignore
    expect(console.warn.mock.calls[0][1].message).toMatch(/unsupported/);
  });
});
