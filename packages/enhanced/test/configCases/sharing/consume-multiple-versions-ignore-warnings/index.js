// const expectWarning = require('../../../helpers/expectWarningFactory')();

it('should be able to consume different shared module version depending on context with ignored warnings', async () => {
  __webpack_share_scopes__['default'] = {
    shared: {
      '9.9.9': {
        get: () => () => 'shared@9.9.9',
      },
      '1.9.9': {
        get: () => () => 'shared@1.9.9',
      },
      '1.2.9': {
        get: () => () => 'shared@1.2.9',
      },
      '1.2.3': {
        get: () => () => 'shared@1.2.3',
        from: 'mfe1',
      },
      '2.9.9': {
        get: () => () => 'shared@2.9.9',
      },
      '2.3.9': {
        get: () => () => 'shared@2.3.9',
      },
      '2.3.4': {
        get: () => () => 'shared@2.3.4',
      },
      '3.0.0': {
        get: () => () => 'shared@3.0.0',
      },
    },
    shared2: {
      '9.9.9': {
        get: () => () => 'shared2@9.9.9',
      },
    },
  };
  expect(require('shared')).toBe('shared@1.9.9');
  expect(
    ['shared@2.9.9', 'shared@2.3.9', 'shared@2.3.4'].includes(
      require('my-module'),
    ),
  ).toBe(true);
  expect(
    ['shared@2.9.9', 'shared@2.3.9', 'shared@2.3.4'].includes(
      require('my-module2'),
    ),
  ).toBe(true);
  expect(() => require('my-module3')).toThrowError(
    'Invalid loadShareSync function',
  );
  expect(require('my-module4')).toBe('shared@9.9.9');
  // expectWarning();
  expect(require('shared2')).toBe('shared2@9.9.9');
  // expectWarning();
});
