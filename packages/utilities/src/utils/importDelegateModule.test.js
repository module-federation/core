import { importDelegatedModule } from './importDelegatedModule';
import { loadScript } from './pure';

jest.mock('./pure');

describe('importDelegatedModule', () => {
  let mockLoadScript;
  let mockRuntimeRemote;

  beforeEach(() => {
    mockLoadScript = jest.fn();
    mockRuntimeRemote = {
      get: jest.fn(),
      init: jest.fn(),
    };
    loadScript.mockImplementation(() => Promise.resolve(mockRuntimeRemote));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should successfully import a delegated module', async () => {
    const result = await importDelegatedModule('test');
    expect(loadScript).toHaveBeenCalledWith('test');
    expect(result).toBe(mockRuntimeRemote);
  });

  it('should handle the case when globalThis is not defined', async () => {
    const result = await importDelegatedModule({ global: 'test' });
    expect(loadScript).toHaveBeenCalledWith({ global: 'test' });
    expect(result).toBe(mockRuntimeRemote);
  });
  
  // Test case for when the module has a function property
  it('should define a function property on the result when the module has a function property', async () => {
    global.window = undefined;
    mockRuntimeRemote.get.mockImplementation(() => Promise.resolve(() => ({ testFunc: () => 'test' })));
    const result = await importDelegatedModule({ global: 'test', globalThis: {} });
    expect(typeof result.get('testFunc')).toBe('function');
    global.window = {}; // Reset window object
  });
  
  // Test case for when the module has a non-function property
  it('should define a non-function property on the result when the module has a non-function property', async () => {
    global.window = undefined;
    mockRuntimeRemote.get.mockImplementation(() => Promise.resolve(() => ({ testProp: 'test' })));
    const result = await importDelegatedModule({ global: 'test', globalThis: {} });
    expect(result.get('testProp')).toBe('test');
    global.window = {}; // Reset window object
  });
  
  // Test case for when the module is a Promise
  it('should return a Promise that resolves to the result when the module is a Promise', async () => {
    global.window = undefined;
    mockRuntimeRemote.get.mockImplementation(() => Promise.resolve(() => Promise.resolve('test')));
    const result = await importDelegatedModule({ global: 'test', globalThis: {} });
    expect(result.get('test')).resolves.toBe('test');
    global.window = {}; // Reset window object
  });
});