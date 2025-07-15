import { RemoteConfig } from './types';

// Production configuration
export const PRODUCTION_CONFIG: RemoteConfig[] = [
  {
    name: 'mcp_remote1',
    url: 'http://localhost:3030/remoteEntry.js',
    modules: {
      filesystem: '/filesystem',
      tools: '/tools',
    },
  },
  {
    name: 'mcp_remote2',
    url: 'http://localhost:3031/remoteEntry.js',
    modules: {
      git: '/git',
      database: '/database',
    },
  },
];

// Development configuration with local paths
export const DEVELOPMENT_CONFIG: RemoteConfig[] = [
  {
    name: 'mcp_remote1',
    url: 'http://localhost:3030/remoteEntry.js',
    modules: {
      filesystem: '/filesystem',
      tools: '/tools',
    },
  },
  {
    name: 'mcp_remote2',
    url: 'http://localhost:3031/remoteEntry.js',
    modules: {
      git: '/git',
      database: '/database',
    },
  },
];

// Get configuration based on environment
export function getConfig(): RemoteConfig[] {
  const env = process.env.NODE_ENV || 'development';
  return env === 'production' ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;
}
