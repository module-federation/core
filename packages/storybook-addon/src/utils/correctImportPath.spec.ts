import { correctImportPath } from './correctImportPath';

describe(`${correctImportPath.name}()`, () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each(['linux', undefined])(
    'should return correct path on non-windows systems: %s',
    (platform) => {
      Object.defineProperty(process, 'platform', {
        value: platform,
      });

      const actual = correctImportPath('/context/path', '/path/to/file.js');

      expect(actual).toEqual('/path/to/file.js');
    },
  );

  it.each([
    ['.\\file.js', './file.js'],
    ['..\\file.js', '../file.js'],
    ['C:\\\\path\\to\\dir\\file.js', './file.js'],
    ['c:\\\\path\\to\\dir\\file.js', './file.js'],
    ['C:\\\\path\\to\\dir\\node_modules\\@scope\\module', '@scope/module'],
    ['@scope\\module', '@scope/module'],
    [
      '@module-federation\\storybook-addon',
      '@module-federation/storybook-addon',
    ],
  ])(
    'should return correct path on windows systems - %s',
    (entryFile: string, output: string) => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
      });

      const actual = correctImportPath('C:\\path\\to\\dir', entryFile);

      expect(actual).toEqual(output);
    },
  );
});
