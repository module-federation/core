// Test TypeScript features that jiti should handle
interface SharedConfig {
  singleton?: boolean;
  requiredVersion?: string;
  strictVersion?: boolean;
}

interface RemoteConfig {
  url: string;
  format?: 'esm' | 'var';
}

enum ExposedModules {
  Button = './Button',
  Header = './Header',
  Footer = './Footer',
}

const sharedDependencies: Record<string, SharedConfig> = {
  react: { singleton: true, requiredVersion: '^18.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
  lodash: { singleton: false, strictVersion: true },
};

const remoteApps: Record<string, RemoteConfig> = {
  'remote-app-1': {
    url: 'http://localhost:3001/remoteEntry.js',
    format: 'esm',
  },
  'remote-app-2': {
    url: 'http://localhost:3002/remoteEntry.js',
    format: 'var',
  },
};

export default {
  name: 'complex-mf-app',
  filename: 'remoteEntry.js',
  exposes: {
    [ExposedModules.Button]: './src/components/Button.tsx',
    [ExposedModules.Header]: './src/components/Header.tsx',
    [ExposedModules.Footer]: './src/components/Footer.tsx',
  },
  shared: sharedDependencies,
  remotes: Object.entries(remoteApps).reduce(
    (acc, [name, config]) => {
      acc[name] = `${name}@${config.url}`;
      return acc;
    },
    {} as Record<string, string>,
  ),
  // Test generic types
  sharedScope: createSharedScope<'default'>(),
};

// Test generic function
function createSharedScope<T extends string>(): T {
  return 'default' as T;
}
