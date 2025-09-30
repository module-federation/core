// A basic implementation to allow loaders access to loaderContext.currentTraceSpan
import { getRspackCore } from '../../../shared/lib/get-rspack';
const pluginName = 'RspackProfilingPlugin';
const moduleSpansByCompilation = new WeakMap();
export const compilationSpans = new WeakMap();
export class RspackProfilingPlugin {
    constructor({ runWebpackSpan }){
        this.runWebpackSpan = runWebpackSpan;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap({
            name: pluginName,
            stage: -Infinity
        }, (compilation)=>{
            const rspack = getRspackCore();
            moduleSpansByCompilation.set(compilation, new WeakMap());
            compilationSpans.set(compilation, this.runWebpackSpan.traceChild('compilation-' + compilation.name));
            const compilationSpan = this.runWebpackSpan.traceChild(`compilation-${compilation.name}`);
            const moduleHooks = rspack.NormalModule.getCompilationHooks(compilation);
            moduleHooks.loader.tap(pluginName, (loaderContext, module)=>{
                var _moduleSpansByCompilation_get;
                const moduleSpan = (_moduleSpansByCompilation_get = moduleSpansByCompilation.get(compilation)) == null ? void 0 : _moduleSpansByCompilation_get.get(module);
                loaderContext.currentTraceSpan = moduleSpan;
            });
            compilation.hooks.buildModule.tap(pluginName, (module)=>{
                var _moduleSpansByCompilation_get;
                const span = compilationSpan.traceChild('build-module');
                span.setAttribute('name', module.userRequest);
                span.setAttribute('layer', module.layer);
                moduleSpansByCompilation == null ? void 0 : (_moduleSpansByCompilation_get = moduleSpansByCompilation.get(compilation)) == null ? void 0 : _moduleSpansByCompilation_get.set(module, span);
            });
            compilation.hooks.succeedModule.tap(pluginName, (module)=>{
                var _moduleSpansByCompilation_get_get, _moduleSpansByCompilation_get;
                moduleSpansByCompilation == null ? void 0 : (_moduleSpansByCompilation_get = moduleSpansByCompilation.get(compilation)) == null ? void 0 : (_moduleSpansByCompilation_get_get = _moduleSpansByCompilation_get.get(module)) == null ? void 0 : _moduleSpansByCompilation_get_get.stop();
            });
        });
    }
}

//# sourceMappingURL=rspack-profiling-plugin.js.map