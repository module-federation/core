import type { Compiler, RspackPluginInstance } from '@rspack/core';

// Rspack's default web client posts to a relative endpoint, which resolves
// against the page. A remote runs on the host's page, so it hits the host.
const RSPACK_LAZY_COMPILATION_WEB_CLIENT =
  /^[^?]*[\\/]@rspack[\\/]core[\\/]hot[\\/]lazy-compilation-web\.js(\?.*)?$/;

/**
 * Points a remote's lazy compilation client at the remote's own dev server.
 *
 * `rspack serve` and Rsbuild turn lazy compilation on after plugins apply, so
 * the `lazyCompilation.client` option can't be set here. The client module is
 * replaced instead, keeping its endpoint query. Rspack 1 ships a different
 * client protocol under the same file name, so only Rspack 2+ is patched.
 */
export class LazyCompilationClientPlugin implements RspackPluginInstance {
  readonly name = 'LazyCompilationClientPlugin';

  apply(compiler: Compiler): void {
    if (!(parseInt(compiler.webpack.rspackVersion, 10) >= 2)) {
      return;
    }
    const client = require.resolve('../client/lazy-compilation-web.js');
    new compiler.webpack.NormalModuleReplacementPlugin(
      RSPACK_LAZY_COMPILATION_WEB_CLIENT,
      (data) => {
        data.request = data.request.replace(
          RSPACK_LAZY_COMPILATION_WEB_CLIENT,
          (_, query = '') => client + query,
        );
      },
    ).apply(compiler);
  }
}
