// eslint-disable-next-line @typescript-eslint/no-require-imports -- Exercises the CommonJS export condition.
import rstest = require('@module-federation/rstest');

rstest.federation({
  name: 'cjs_consumer',
});
