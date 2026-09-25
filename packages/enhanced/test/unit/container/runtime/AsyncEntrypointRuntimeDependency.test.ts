import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import AsyncEntrypointRuntimeDependency from '../../../../src/lib/container/runtime/AsyncEntrypointRuntimeDependency';

const { buffersSerializer } = require(
  normalizeWebpackPath('webpack/lib/util/serialization'),
) as typeof import('webpack/lib/util/serialization');

describe('AsyncEntrypointRuntimeDependency', () => {
  it('round-trips through the webpack object serializer', async () => {
    const dep = new AsyncEntrypointRuntimeDependency('./federation-entry.js');
    dep.loc = { name: 'worker' };

    const data = await buffersSerializer.serialize(dep, {});
    const restored = await buffersSerializer.deserialize(data, {});

    expect(restored).toBeInstanceOf(AsyncEntrypointRuntimeDependency);
    expect(restored.request).toBe('./federation-entry.js');
    expect(restored.type).toBe(
      'federation runtime async entrypoint dependency',
    );
  });
});
