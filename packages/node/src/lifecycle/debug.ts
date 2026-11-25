import { isDebugMode } from '@module-federation/sdk';

const NAMESPACES = ['mf:node:lifecycle', 'modern-js:mf-ssr'] as const;

function matchesDebugPattern(pattern: string, namespace: string): boolean {
  if (pattern === '*') return true;
  if (!pattern.includes('*')) return pattern === namespace;
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`).test(namespace);
}

function matchesEnvDebug(raw: string | undefined): boolean {
  if (!raw) return false;
  const tokens = raw
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  let matched = false;
  for (const token of tokens) {
    if (token.startsWith('-')) {
      const pattern = token.slice(1);
      if (NAMESPACES.some((ns) => matchesDebugPattern(pattern, ns))) {
        return false;
      }
    } else if (NAMESPACES.some((ns) => matchesDebugPattern(token, ns))) {
      matched = true;
    }
  }
  return matched;
}

export function isNodeLifecycleDebugEnabled(): boolean {
  const debugEnv =
    typeof process !== 'undefined' && process.env
      ? process.env.DEBUG
      : undefined;
  return matchesEnvDebug(debugEnv) || isDebugMode();
}

export function debugNodeLifecycle(message: string): void {
  console.debug(`[MF Node Lifecycle] ${message}`);
}
