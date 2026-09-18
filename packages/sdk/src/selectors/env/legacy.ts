declare const ENV_TARGET: 'web' | 'node';

export const isBrowserEnvValue =
  typeof ENV_TARGET !== 'undefined'
    ? ENV_TARGET === 'web'
    : typeof window !== 'undefined' && typeof window.document !== 'undefined';
