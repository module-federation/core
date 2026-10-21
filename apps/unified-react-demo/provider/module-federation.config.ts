import { createModuleFederationConfig } from '@module-federation/modern-js-v3';
import { exposes } from '../shared/exposes';
export default createModuleFederationConfig({
  name: 'unified_provider',
  filename: 'remoteEntry.js',
  exposes: Object.fromEntries(
    Object.entries(exposes).map(([name, value]) => [`./${name}`, value.source]),
  ),
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
});
