/**
 * Jest setup file for HMR testing with experimental VM modules support
 */

// Add experimental VM modules support
process.env['NODE_OPTIONS'] =
  (process.env['NODE_OPTIONS'] || '') + ' --experimental-vm-modules';

// Mock console methods to reduce noise in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  // Suppress webpack warnings in tests unless NODE_ENV is test-verbose
  if (process.env['NODE_ENV'] !== 'test-verbose') {
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterEach(() => {
  // Restore console methods
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;

  // Clean up global state
  delete (global as any).__webpack_require__;
  delete (global as any).module;
  delete (global as any).__FEDERATION__;
});
