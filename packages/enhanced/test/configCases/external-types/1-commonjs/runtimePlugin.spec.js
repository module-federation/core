/**
 * @jest-environment node
 */

const createRuntimePlugin = require('./runtimePlugin');

describe('RuntimePlugin', () => {
  let runtimePlugin;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    runtimePlugin = createRuntimePlugin();
    // Mock console methods
    consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    // Setup global __non_webpack_require__
    global.__non_webpack_require__ = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('loadEntry', () => {
    it('should load commonjs module using __non_webpack_require__', async () => {
      const mockModule = { foo: 'bar' };
      global.__non_webpack_require__.mockReturnValue(mockModule);

      const remoteInfo = {
        entry: './test-module',
        externalType: 'commonjs',
      };

      const result = await runtimePlugin.loadEntry({ remoteInfo });

      expect(result).toBe(mockModule);
      expect(global.__non_webpack_require__).toHaveBeenCalledWith(
        './test-module',
      );
    });

    it('should return undefined and log errors when module loading fails', async () => {
      const mockError = new Error('Module not found');
      global.__non_webpack_require__.mockImplementation(() => {
        throw mockError;
      });

      const remoteInfo = {
        entry: './non-existent-module',
        externalType: 'commonjs',
      };

      const result = await runtimePlugin.loadEntry({ remoteInfo });
      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading entry:',
        mockError,
      );
    });

    it('should return undefined for non-commonjs external types', async () => {
      const remoteInfo = {
        entry: './test-module',
        externalType: 'script',
      };

      const result = await runtimePlugin.loadEntry({ remoteInfo });

      expect(result).toBeUndefined();
      expect(global.__non_webpack_require__).not.toHaveBeenCalled();
    });

    it('should return undefined when externalType is missing', async () => {
      const remoteInfo = {
        entry: './test-module',
      };

      const result = await runtimePlugin.loadEntry({ remoteInfo });

      expect(result).toBeUndefined();
      expect(global.__non_webpack_require__).not.toHaveBeenCalled();
    });
  });
});
