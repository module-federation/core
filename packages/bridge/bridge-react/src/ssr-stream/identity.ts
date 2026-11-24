/** Preserve the full instance identity without depending on a request UUID. */
export function bridgeIdentifierPrefix(
  instanceId: string,
  namespace: 'mf' | 'mf-client' = 'mf',
): string {
  // UTF-16 preserves every JavaScript code unit, including lone surrogates.
  // Sanitizing characters or truncating a hash could merge distinct instances.
  return `${namespace}-${Array.from(
    { length: instanceId.length },
    (_, index) => {
      const code = instanceId.charCodeAt(index);
      return (
        (code & 255).toString(16).padStart(2, '0') +
        (code >> 8).toString(16).padStart(2, '0')
      );
    },
  ).join('')}-`;
}
