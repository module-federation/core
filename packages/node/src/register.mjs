/**
 * Side-effect entry point (ESM build) enabling the Module Federation native
 * HTTP(S) ESM loader:
 *
 *   node --import @module-federation/node/register app.mjs
 *
 * Shipped as a verbatim .mjs file because it needs `import.meta.url` to
 * locate the hooks module, which the dual-format TypeScript build cannot
 * express portably.
 */
import { registerNativeHttpLoader } from './loader-hooks/register.mjs';

registerNativeHttpLoader({
  hooksUrl: new URL('./loader-hooks/hooks.mjs', import.meta.url).href,
});
