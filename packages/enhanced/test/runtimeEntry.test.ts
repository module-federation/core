import { execFileSync } from 'node:child_process';
import path from 'node:path';

describe('enhanced/runtime entry', () => {
  it.each(['commonjs', 'module'])(
    '%s exposes live runtime helpers',
    (format) => {
      const load =
        format === 'module'
          ? "import * as runtime from '@module-federation/enhanced/runtime';"
          : "const runtime = require('@module-federation/enhanced/runtime');";

      execFileSync(
        process.execPath,
        [
          '--input-type=' + format,
          '-e',
          `
      ${load}
      const { createInstance, helpers } = runtime;
      const instance = createInstance({ name: 'enhanced-runtime-' + ${JSON.stringify(format)}, remotes: [] });
      if (helpers.global.getGlobalFederationInstance(instance.name) !== instance) {
        throw new Error('Helpers must use the same runtime instance registry');
      }
      const remote = { name: 'remote', alias: 'alias', entry: 'http://localhost/remoteEntry.js' };
      const matched = helpers.utils.matchRemoteWithNameAndExpose([remote], 'alias/component');
      if (matched.remote !== remote || matched.expose !== './component') {
        throw new Error('Runtime helpers must preserve remote matching');
      }
      if (typeof helpers.share.getRegisteredShare !== 'function') {
        throw new Error('Share helpers must be available');
      }
    `,
        ],
        { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' },
      );
    },
  );
});
