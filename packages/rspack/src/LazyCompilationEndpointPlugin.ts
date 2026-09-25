import type { Compiler, RspackPluginInstance } from '@rspack/core';

// Rspack's default web client. The Node client and a user's
// `lazyCompilation.client` are left alone.
export const RSPACK_LAZY_COMPILATION_WEB_CLIENT =
  /[\\/]@rspack[\\/]core[\\/]hot[\\/]lazy-compilation-web\.js$/;

/**
 * Points a remote's lazy compilation requests at the remote's own dev server.
 *
 * With no `serverUrl`, Rspack's client posts to a relative endpoint, and the
 * browser resolves it against the page. A remote runs on the host's page, so
 * the request hits the host. `rspack serve` sets `lazyCompilation` after every
 * plugin hook, so the option can't be changed here. Instead a loader rebases
 * the endpoint onto the remote's public path at runtime.
 *
 * The rule is inert unless lazy compilation adds the client. Matching is
 * native, so no JavaScript runs per module.
 */
export class LazyCompilationEndpointPlugin implements RspackPluginInstance {
  readonly name = 'LazyCompilationEndpointPlugin';

  apply(compiler: Compiler): void {
    compiler.options.module.rules.push({
      test: RSPACK_LAZY_COMPILATION_WEB_CLIENT,
      loader: require.resolve('./lazyCompilationEndpointLoader'),
    });
  }
}
