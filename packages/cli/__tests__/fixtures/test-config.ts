export default {
  name: 'test-mf-app',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button.tsx',
    './Header': './src/components/Header.tsx',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
  },
  remotes: {
    'remote-app': 'remoteApp@http://localhost:3001/remoteEntry.js',
  },
};
