import { removeUnnecessarySharedKeys } from './remove-unnecessary-shared-keys';
import type { Compiler } from 'webpack';

// Basic mock compiler
const mockCompiler = {
  options: {
    name: 'server',
    // Add minimal resolve structure to prevent crash in writeCompilerResolveConfig
    resolve: { alias: {} },
  },
} as Compiler;

describe('removeUnnecessarySharedKeys', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should remove unnecessary shared keys from the given object', () => {
    const shared: Record<string, unknown> = {
      react: '17.0.0',
      'react-dom': '17.0.0',
      lodash: '4.17.21',
    };

    removeUnnecessarySharedKeys(shared, mockCompiler);

    expect(shared).toEqual({ lodash: '4.17.21' });
    expect(console.warn).toHaveBeenCalled();
  });

  it('should not remove keys that are not in the default share scope', () => {
    const shared: Record<string, unknown> = {
      lodash: '4.17.21',
      axios: '0.21.1',
    };

    (console.warn as jest.Mock).mockClear();

    removeUnnecessarySharedKeys(shared, mockCompiler);

    expect(shared).toEqual({ lodash: '4.17.21', axios: '0.21.1' });
  });

  it('should not remove keys from an empty object', () => {
    const shared: Record<string, unknown> = {};

    (console.warn as jest.Mock).mockClear();

    removeUnnecessarySharedKeys(shared, mockCompiler);

    expect(shared).toEqual({});
  });
});
