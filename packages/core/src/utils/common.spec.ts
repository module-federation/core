import {
  extractUrlAndGlobal,
  createDelegatedModule,
  loadAndInitializeRemote,
} from './common';

describe('Common utils', () => {
  it('extraUrlAndGlobal returns a url and module scope when "at symbol" present', () => {
    const result = extractUrlAndGlobal('test@http://test.com');

    expect(result).toEqual(['http://test.com', 'test']);
  });

  it('extraUrlAndGlobal throws an error when "at symbol" not present', () => {
    const extract = () => {
      extractUrlAndGlobal('test');
    };

    expect(extract).toThrowError('Invalid request "test"');
  });

  it('loadAndInitializeRemote should load a dynamic remote', async () => {
    //@ts-ignore
    global.__webpack_require__ = {
      l: jest.fn((url, callback, containerKey) => {
        //@ts-ignore
        window[containerKey] = {
          init: jest.fn(),
          get: jest.fn(),
        };
        callback({ type: 'load' });
      }),
    };

    //@ts-ignore
    global.__webpack_share_scopes__ = {
      default: {},
    };

    const test = await loadAndInitializeRemote('remote@http://test.com');

    expect(test).toMatchObject({
      get: expect.any(Function),
      init: expect.any(Function),
    });
  });

  it('createDelegatedModule returns formatted webpack internal entry point with query params', () => {
    const delegate = createDelegatedModule('test', {
      version: '1.0.0',
      other: 'foo',
    });

    expect(delegate).toBe('internal test?version=1.0.0&other=foo');
  });

  it('createDelegatedModule throws an error when params contains a key with a value of type array', () => {
    const create = () => {
      createDelegatedModule('test', {
        test: ['test'],
      });
    };

    expect(create).toThrowError(
      '[Module Federation] Delegated module params cannot be an array or object. Key "test" should be a string or number'
    );
  });

  it('createDelegatedModule throws an error when params contains a key with a value of type object', () => {
    const create = () => {
      createDelegatedModule('test', {
        test: {},
      });
    };

    expect(create).toThrowError(
      '[Module Federation] Delegated module params cannot be an array or object. Key "test" should be a string or number'
    );
  });
});
