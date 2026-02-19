import {
  fileSystemRunInContextStrategy,
  httpEvalStrategy,
  httpVmStrategy,
} from '../filesystem/stratagies';

describe('filesystem chunk loading strategies', () => {
  test.each([fileSystemRunInContextStrategy, httpEvalStrategy, httpVmStrategy])(
    '%p resolves webpack require via sdk bundler in emitted source',
    (strategyFn) => {
      const source = strategyFn.toString();

      expect(source).toContain("'@module-federation/sdk/bundler'");
      expect(source).toContain('getWebpackRequireOrThrow');
    },
  );
});
