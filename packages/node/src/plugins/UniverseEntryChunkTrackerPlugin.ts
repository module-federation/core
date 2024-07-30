import pBtoa from 'btoa';
import type { WebpackPluginInstance, Compiler } from 'webpack';

class UniverseEntryChunkTrackerPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler) {
    const code = `
    if(typeof module !== 'undefined') {
    globalThis.entryChunkCache = globalThis.entryChunkCache || new Set();
    module.filename && globalThis.entryChunkCache.add(module.filename);
    if(module.children) {
    module.children.forEach(function(c) {
      c.filename && globalThis.entryChunkCache.add(c.filename);
    })
}
  }
    `;
    const base64Code = pBtoa(code);
    const dataUrl = `data:text/javascript;base64,${base64Code}`;

    compiler.hooks.afterPlugins.tap('UniverseEntryChunkTrackerPlugin', () => {
      new compiler.webpack.EntryPlugin(compiler.context, dataUrl, {}).apply(
        compiler,
      );
    });
  }
}

export default UniverseEntryChunkTrackerPlugin;
