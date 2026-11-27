import { isDebugMode } from '@module-federation/sdk';

const NAMESPACES = ['mf:node:lifecycle'] as const;

function matchesDebugPattern(pattern: string, namespace: string): boolean {
  if (pattern === '*') return true;
  if (!pattern.includes('*')) return pattern === namespace;
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`).test(namespace);
}

export function matchesDebugNamespaces(
  raw: string | undefined,
  namespaces: readonly string[] = NAMESPACES,
): boolean {
  if (!raw) return false;
  const tokens = raw
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  const includes: string[] = [];
  const excludes: string[] = [];
  for (const token of tokens) {
    if (token.startsWith('-')) {
      const pattern = token.slice(1);
      if (pattern) excludes.push(pattern);
    } else {
      includes.push(token);
    }
  }
  return namespaces.some(
    (ns) =>
      includes.some((pattern) => matchesDebugPattern(pattern, ns)) &&
      !excludes.some((pattern) => matchesDebugPattern(pattern, ns)),
  );
}

export function isNodeLifecycleDebugEnabled(): boolean {
  const debugEnv =
    typeof process !== 'undefined' && process.env
      ? process.env.DEBUG
      : undefined;
  return matchesDebugNamespaces(debugEnv) || isDebugMode();
}

export function debugNodeLifecycle(message: string): void {
  console.debug(`[MF Node Lifecycle] ${message}`);
}
