/**
 * Test to reproduce the Maximum call stack size exceeded error
 * when there are circular dependencies in module loading
 */

import { jest } from '@jest/globals';

// Mock vm and fetch to simulate the error scenario
const mockVm = {
  Script: jest.fn(),
  SourceTextModule: jest.fn(),
  constants: {
    USE_MAIN_CONTEXT_DEFAULT_LOADER: undefined,
  },
};

const mockFetch = jest.fn();

// Mock the modules that would be imported
jest.mock('vm', () => mockVm, { virtual: true });
jest.mock(
  'path',
  () => ({
    basename: jest.fn(),
    join: jest.fn(),
  }),
  { virtual: true },
);

describe('Node importNodeModule recursion test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reproduce maximum call stack size exceeded', async () => {
    // Mock a scenario where importNodeModule gets called recursively
    let callCount = 0;
    const maxCalls = 10000; // Set high to trigger stack overflow

    // Create a mock script that will trigger recursive importModuleDynamically calls
    const mockScript = {
      runInThisContext: jest.fn(() => {
        return (
          exports: any,
          module: any,
          require: any,
          dirname: string,
          filename: string,
        ) => {
          // Simulate module execution that triggers another import
          module.exports = {};
        };
      }),
    };

    // Set up the vm.Script mock to simulate importModuleDynamically calls
    mockVm.Script.mockImplementation((code: string, options: any) => {
      // Simulate the importModuleDynamically option being called
      if (options.importModuleDynamically && callCount < maxCalls) {
        callCount++;
        // This simulates a circular dependency where modules import each other
        setTimeout(() => {
          options.importModuleDynamically('circular-module').catch(() => {});
        }, 0);
      }
      return mockScript;
    });

    // Mock fetch to return some JavaScript code
    mockFetch.mockResolvedValue({
      text: () => Promise.resolve('module.exports = {};'),
    });

    // Simulate the createScriptNode function call that leads to recursion
    const { createScriptNode } = await import('../node');

    // This should trigger the recursive calls and eventually cause a stack overflow
    const promise = new Promise((resolve, reject) => {
      createScriptNode(
        'http://example.com/test.js',
        (error, scriptContext) => {
          if (error) {
            reject(error);
          } else {
            resolve(scriptContext);
          }
        },
        {},
        {
          fetch: mockFetch,
        },
      );
    });

    // The test should catch the stack overflow error
    await expect(promise).rejects.toThrow();

    // Verify that multiple calls were made (indicating recursion)
    expect(callCount).toBeGreaterThan(1);
  }, 30000); // Increased timeout for this test

  it('should reproduce ESM module loading recursion', async () => {
    // Mock SourceTextModule for ESM loading test
    let linkCallCount = 0;
    const mockModule = {
      link: jest.fn(async (linker) => {
        linkCallCount++;
        if (linkCallCount < 5) {
          // Simulate circular dependency by calling linker with same module
          await linker('circular-esm-module');
        }
      }),
      evaluate: jest.fn(),
    };

    mockVm.SourceTextModule.mockImplementation((code: string, options: any) => {
      // Trigger importModuleDynamically recursion
      if (options.importModuleDynamically && linkCallCount < 3) {
        setTimeout(() => {
          options.importModuleDynamically('circular-esm', {}).catch(() => {});
        }, 0);
      }
      return mockModule;
    });

    mockFetch.mockResolvedValue({
      text: () => Promise.resolve('export default {};'),
    });

    const { createScriptNode } = await import('../node');

    const promise = new Promise((resolve, reject) => {
      createScriptNode(
        'http://example.com/test.mjs',
        (error, scriptContext) => {
          if (error) {
            reject(error);
          } else {
            resolve(scriptContext);
          }
        },
        { type: 'esm' },
        {
          fetch: mockFetch,
        },
      );
    });

    // This test demonstrates the ESM loading recursion scenario
    await expect(promise).rejects.toThrow();
    expect(linkCallCount).toBeGreaterThan(1);
  }, 30000);
});
