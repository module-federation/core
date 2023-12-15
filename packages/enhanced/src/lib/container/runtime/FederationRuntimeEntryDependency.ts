import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
);
const EntryDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/EntryDependency'),
) as typeof import('webpack/lib/dependencies/EntryDependency');

class FederationRuntimeEntryDependency extends EntryDependency {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    const code = `import * as runtime from '@vmok/runtime';
		__webpack_require__.vmok.runtime = runtime;
		__webpack_require__.vmok.instance = __webpack_require__.vmok.runtime.init(
			__webpack_require__.vmok.initOptions,
		);`;
    const mimeType = 'text/javascript';
    const encodedCode = encodeURIComponent(code);
    const request = `data:${mimeType},${encodedCode}`;
    super(request);
  }

  override get type() {
    return 'entry';
  }

  override get category() {
    return 'esm';
  }
}

makeSerializable(
  FederationRuntimeEntryDependency,
  'enhanced/lib/container/runtime/FederationRuntimeEntryDependency',
);

export default FederationRuntimeEntryDependency;
