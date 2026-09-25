import type { LoaderContext } from '@rspack/core';

// Replaces `__resourceQuery` in the client. Doubles as the idempotency marker.
const REBASED_QUERY = '__federation_lazy_compilation_query__';

// Rebases the endpoint in the query onto this bundle's public path. An absolute
// endpoint, such as a user's `serverUrl`, comes back unchanged. On any failure
// the query is kept, which is Rspack's own behavior.
const PRELUDE =
  `var ${REBASED_QUERY} = (function (q) { if (!q) return q; try { return '?' + ` +
  `encodeURIComponent(new URL(decodeURIComponent(q.slice(1)), ` +
  `new URL(__webpack_public_path__, self.location.href)).href); } ` +
  `catch (_) { return q; } })(__resourceQuery);\n`;

/**
 * Makes a lazy compilation client resolve its endpoint against the bundle's
 * public path instead of the page. Every Rspack and webpack client reads the
 * endpoint from `__resourceQuery`; the rest of the client runs unchanged.
 * Returns `undefined` when the client doesn't read `__resourceQuery`.
 */
export function rebaseLazyCompilationEndpoint(
  source: string,
): string | undefined {
  if (source.includes(REBASED_QUERY)) {
    return source;
  }
  if (!source.includes('__resourceQuery')) {
    return undefined;
  }
  // The prelude keeps its own `__resourceQuery`, so Rspack still injects the
  // real query there.
  return PRELUDE + source.split('__resourceQuery').join(REBASED_QUERY);
}

export default function lazyCompilationEndpointLoader(
  this: LoaderContext,
  source: string,
): string {
  const rebased = rebaseLazyCompilationEndpoint(source);
  if (rebased !== undefined) {
    return rebased;
  }
  this.emitWarning(
    new Error(
      "[ Module Federation ] Rspack's lazy compilation client no longer reads its endpoint from __resourceQuery, so this remote's lazy compilation requests go to the host page's server. Set `lazyCompilation.serverUrl` to this remote's dev server origin.",
    ),
  );
  return source;
}
