/** Preserve the full instance identity without depending on a request UUID. */
export function bridgeIdentifierPrefix(
  instanceId: string,
  namespace: 'mf' | 'mf-client' = 'mf',
): string {
  // UTF-16 preserves every JavaScript code unit, including lone surrogates.
  // Sanitizing characters or truncating a hash could merge distinct instances.
  return `${namespace}-${Buffer.from(instanceId, 'utf16le').toString('hex')}-`;
}
