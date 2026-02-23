const storedApiBase =
  typeof window !== 'undefined'
    ? window.localStorage.getItem('treeshake_server_url')
    : null;

export const ENV_API_BASE =
  storedApiBase ||
  import.meta.env?.VITE_API_BASE_URL ||
  'http://localhost:3000/tree-shaking-shared';

export const STORAGE_KEY_CONFIG = 'tree-shaking-config-v1';
