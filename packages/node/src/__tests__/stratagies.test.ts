import {
  fileSystemRunInContextStrategy,
  httpEvalStrategy,
  httpVmStrategy,
} from '../filesystem/stratagies';

describe('filesystem chunk loading strategies', () => {
  test.each([fileSystemRunInContextStrategy, httpEvalStrategy, httpVmStrategy])(
    '%p inlines webpack require access for toString runtime emission',
    (strategyFn) => {
      const source = strategyFn.toString();

      expect(source).toContain("typeof __webpack_require__ === 'function'");
      expect(source).not.toContain('getWebpackRequire(');
    },
  );
});
