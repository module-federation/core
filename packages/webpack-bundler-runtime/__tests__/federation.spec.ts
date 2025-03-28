// We need to mock the modules before importing anything else
jest.mock('@module-federation/runtime', () => ({
  init: jest.fn(),
}));

jest.mock('../src/remotes', () => ({
  remotes: jest.fn(),
}));

jest.mock('../src/consumes', () => ({
  consumes: jest.fn(),
}));

jest.mock('../src/initializeSharing', () => ({
  initializeSharing: jest.fn(),
}));

jest.mock('../src/installInitialConsumes', () => ({
  installInitialConsumes: jest.fn(),
}));

jest.mock('../src/attachShareScopeMap', () => ({
  attachShareScopeMap: jest.fn(),
}));

jest.mock('../src/initContainerEntry', () => ({
  initContainerEntry: jest.fn(),
}));

// Now we can import our module
import federation from '../src/index';

describe('Federation object', () => {
  test('should export a federation object', () => {
    expect(federation).toBeDefined();
  });

  test('should have bundlerRuntime property', () => {
    expect(federation.bundlerRuntime).toBeDefined();
  });

  test('should have bundlerRuntimeOptions property', () => {
    expect(federation.bundlerRuntimeOptions).toBeDefined();
  });
});
