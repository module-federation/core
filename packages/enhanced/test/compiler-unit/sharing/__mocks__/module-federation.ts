// Mock module federation dependencies
export const mockModule = class MockModule {};

export const mockFederationHost = {
  name: 'MockFederationHost',
  init: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
};

export const mockRuntimeCore = {
  satisfy: jest.fn(),
  getWebpackPath: jest.fn(() => 'mocked-webpack-path'),
  setGlobalFederationConstructor: jest.fn(),
  FederationHost: mockFederationHost,
  Module: mockModule,
};

export const mockSdk = {
  normalizeWebpackPath: jest.fn((path) => path),
  getWebpackPath: jest.fn(() => 'mocked-webpack-path'),
  TEMP_DIR: '.federation',
  encodeName: jest.fn((name, prefix = '', withExt = false) => {
    const ext = withExt ? '.js' : '';
    return `${prefix}${name
      .replace(/@/g, 'scope_')
      .replace(/-/g, '_')
      .replace(/\//g, '__')}${ext}`;
  }),
  decodeName: jest.fn((name, prefix = '', withExt = false) => {
    let decodedName = name;
    if (prefix) {
      if (!decodedName.startsWith(prefix)) {
        return decodedName;
      }
      decodedName = decodedName.replace(new RegExp(prefix, 'g'), '');
    }
    decodedName = decodedName
      .replace(/scope_/g, '@')
      .replace(/__/g, '/')
      .replace(/_/g, '-');
    if (withExt) {
      decodedName = decodedName.replace('.js', '');
    }
    return decodedName;
  }),
};
