export const CAPABILITIES = [
  'status',
  'remotes',
  'shared',
  'module-info',
] as const;
export const LIMITS = {
  instances: 32,
  entries: 256,
  text: 240,
  pages: 16,
} as const;
