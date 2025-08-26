import type {
  Compiler,
  Compilation,
  WebpackPluginInstance,
  Module,
} from 'webpack';
import { WEBPACK_MODULE_TYPE_CONSUME_SHARED_MODULE } from '../Constants';

interface ChunkCharacteristics {
  entry_module_id: string | null;
  is_runtime_chunk: boolean;
  has_runtime: boolean;
  is_entrypoint: boolean;
  can_be_initial: boolean;
  is_only_initial: boolean;
  chunk_format: string | null;
  chunk_loading_type: string | null;
  runtime_names: string[];
  entry_name: string | null;
  has_async_chunks: boolean;
  chunk_files: string[];
  shared_modules: string[];
}

interface ModuleExportUsage {
  [exportName: string]: boolean;
}

interface ModuleExportUsageWithCharacteristics {
  exports: ModuleExportUsage;
  chunk_characteristics: ChunkCharacteristics;
}

interface ShareUsageReport {
  treeShake: Record<string, ModuleExportUsageWithCharacteristics>;
}

export interface ShareUsagePluginOptions {
  filename?: string;
}

export default class ShareUsagePlugin implements WebpackPluginInstance {
  private options: ShareUsagePluginOptions;
  name = 'ShareUsagePlugin';

  constructor(options: ShareUsagePluginOptions = {}) {
    this.options = { filename: 'share-usage.json', ...options };
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(
      this.name,
      (compilation: Compilation & any) => {
        const stage =
          compiler.webpack?.Compilation?.PROCESS_ASSETS_STAGE_SUMMARIZE || 0;
        const emit = () => {
          const usage = this.analyzeConsumeSharedUsage(compilation);
          const report: ShareUsageReport = { treeShake: usage };
          const json = JSON.stringify(report, null, 2);
          const filename = this.uniqueAssetName(
            compilation,
            this.options.filename!,
          );
          const RawSource =
            (compiler.webpack?.sources as any)?.RawSource ||
            require('webpack').sources.RawSource;
          compilation.emitAsset(filename, new RawSource(json));
        };
        if (compilation.hooks.processAssets) {
          compilation.hooks.processAssets.tap({ name: this.name, stage }, emit);
        } else {
          compilation.hooks.additionalAssets.tap(this.name, emit);
        }
      },
    );
  }

  private uniqueAssetName(compilation: any, base: string): string {
    if (!compilation.getAsset || !compilation.getAsset(base)) return base;
    let i = 1;
    let name = `${base}.${i}`;
    while (compilation.getAsset(name)) {
      i++;
      name = `${base}.${i}`;
    }
    return name;
  }

  // Core analysis
  private analyzeConsumeSharedUsage(
    compilation: any,
  ): Record<string, ModuleExportUsageWithCharacteristics> {
    const moduleGraph = compilation.moduleGraph;
    const result: Record<string, ModuleExportUsageWithCharacteristics> = {};

    for (const mod of compilation.modules as Iterable<Module & any>) {
      const shareKey = this.getConsumeSharedKey(mod);
      if (!shareKey) continue;

      const fallback = this.findFallbackModule(moduleGraph, mod);

      if (fallback) {
        const [used, provided] = this.analyzeModuleUsage(
          compilation,
          fallback,
          mod,
        );
        const entryModuleId = this.getStableModuleId(compilation, fallback);
        const [exportsMap, chunkChar] = this.getSingleChunkCharacteristics(
          compilation,
          fallback,
          entryModuleId,
          used,
          provided,
        );
        result[shareKey] = {
          exports: exportsMap,
          chunk_characteristics: chunkChar,
        };
      } else {
        result[shareKey] = {
          exports: {},
          chunk_characteristics: this.defaultChunkChar(),
        };
      }
    }

    return result;
  }

  private getConsumeSharedKey(module: any): string | null {
    // Prefer structural detection by module.type + public options
    if (module?.type === WEBPACK_MODULE_TYPE_CONSUME_SHARED_MODULE) {
      return module.options?.shareKey || null;
    }
    return null;
  }

  private findFallbackModule(moduleGraph: any, consumeModule: any): any | null {
    // Webpack ModuleGraph exposes connections; identify fallback by dependency type when exposed
    if (!moduleGraph?.getOutgoingConnections) return null;
    for (const conn of moduleGraph.getOutgoingConnections(consumeModule) ||
      []) {
      const dep = conn.dependency;
      const t = dep && (dep.type || dep.constructor?.name);
      if (t && /ConsumeSharedFallback|Fallback/i.test(String(t)))
        return conn.module || null;
    }
    // Also consider blocks for async fallback
    for (const block of consumeModule.blocks || []) {
      for (const dep of block.dependencies || []) {
        const t = dep && (dep.type || dep.constructor?.name);
        if (t && /ConsumeSharedFallback|Fallback/i.test(String(t))) {
          const m = moduleGraph.getModule?.(dep);
          if (m) return m;
        }
      }
    }
    return null;
  }

  private analyzeModuleUsage(
    compilation: any,
    fallbackModule: any,
    consumeModule: any,
  ): [string[], string[]] {
    const moduleGraph = compilation.moduleGraph;
    const used = new Set<string>();
    const provided = new Set<string>();

    // Prefer ExportsInfo when available
    const fallbackInfo = moduleGraph.getExportsInfo?.(fallbackModule);
    const consumeInfo = moduleGraph.getExportsInfo?.(consumeModule);

    this.collectProvidedExports(fallbackInfo, provided, used);
    this.collectProvidedExports(consumeInfo, provided, used);

    // Incoming connections infer usage
    this.inferUsageFromIncoming(moduleGraph, consumeModule, used, provided);
    this.inferUsageFromIncoming(moduleGraph, fallbackModule, used, provided);

    // CJS heuristic: if nothing provided, assume dynamic
    if (provided.size === 0 && this.isLikelyCJS(fallbackModule)) {
      provided.add('*');
      provided.add('__commonjs_module__');
    }

    return [Array.from(used), Array.from(provided)];
  }

  private collectProvidedExports(
    exportsInfo: any,
    provided: Set<string>,
    used: Set<string>,
  ) {
    if (!exportsInfo?.exports) return;
    for (const e of exportsInfo.exports) {
      const name = Array.isArray(e.name) ? e.name[0] : e.name;
      if (!name) continue;
      const s = String(name);
      if (s && s !== '__esModule') {
        provided.add(s);
        try {
          if (
            e.getUsed &&
            (e.getUsed(undefined) === true || e.getUsed(undefined) === 1)
          )
            used.add(s);
        } catch {}
      }
    }
  }

  private inferUsageFromIncoming(
    moduleGraph: any,
    mod: any,
    used: Set<string>,
    provided: Set<string>,
  ) {
    if (!moduleGraph?.getIncomingConnections) return;
    for (const conn of moduleGraph.getIncomingConnections(mod) || []) {
      const dep = conn.dependency;
      if (!dep) continue;
      const refs = this.getReferencedExports(moduleGraph, dep);
      for (const n of refs) {
        if (!n || n === '*') continue;
        used.add(n);
        if (provided.has('*') && !provided.has(n)) provided.add(n);
      }
    }
  }

  private getReferencedExports(moduleGraph: any, dependency: any): string[] {
    try {
      if (dependency?.getReferencedExports) {
        const res = dependency.getReferencedExports(moduleGraph) || [];
        const out: string[] = [];
        for (const r of res) {
          if (Array.isArray(r)) out.push(...r.map(String));
          else if (r?.name)
            out.push(
              ...(Array.isArray(r.name)
                ? r.name.map(String)
                : [String(r.name)]),
            );
        }
        return out;
      }
    } catch {}
    return [];
  }

  private isLikelyCJS(module: any): boolean {
    const id = module?.identifier?.() || '';
    return /commonjs|cjs/i.test(String(id));
  }

  private getStableModuleId(compilation: any, module: any): string | null {
    try {
      return String(compilation.chunkGraph?.getModuleId?.(module) ?? null);
    } catch {
      return null;
    }
  }

  private getSingleChunkCharacteristics(
    compilation: any,
    module: any,
    entryModuleId: string | null,
    usedExports: string[],
    providedExports: string[],
  ): [ModuleExportUsage, ChunkCharacteristics] {
    const chunkGraph = compilation.chunkGraph;
    const chunks = chunkGraph?.getModuleChunks?.(module) || new Set();

    const usage: ModuleExportUsage = {};
    const isCjs = providedExports.includes('__commonjs_module__');
    const hasDynamic = providedExports.includes('*');

    if (isCjs) {
      for (const e of usedExports) usage[e] = true;
      if (Object.keys(usage).length === 0) usage['__dynamic_commonjs__'] = true;
    } else if (hasDynamic && providedExports.length === 1) {
      usage['__dynamic__'] = true;
    } else {
      for (const e of providedExports) {
        if (e === '*' || e === '__commonjs_module__') continue;
        usage[e] = usedExports.includes(e);
      }
    }

    const first = Array.from(chunks)[0];
    if (first) {
      const chunk = compilation.chunks?.get?.(first) || first;
      const sharedModules = this.collectSharedModulesInChunk(
        compilation,
        chunk,
      );

      return [
        usage,
        {
          entry_module_id: entryModuleId,
          is_runtime_chunk:
            typeof chunk.hasRuntime === 'function'
              ? !!chunk.hasRuntime()
              : false,
          has_runtime:
            typeof chunk.hasRuntime === 'function'
              ? !!chunk.hasRuntime()
              : false,
          is_entrypoint: this.isChunkEntrypoint(chunk),
          can_be_initial:
            typeof chunk.canBeInitial === 'function'
              ? !!chunk.canBeInitial()
              : false,
          is_only_initial:
            typeof chunk.isOnlyInitial === 'function'
              ? !!chunk.isOnlyInitial()
              : false,
          chunk_format: this.determineChunkFormat(compilation),
          chunk_loading_type: this.getChunkLoadingType(compilation, chunk),
          runtime_names: Array.isArray(chunk.runtime)
            ? chunk.runtime.map(String)
            : [],
          entry_name: this.getEntryName(compilation, chunk),
          has_async_chunks: !!(chunk as any).hasAsyncChunks,
          chunk_files: Array.from(chunk.files || []),
          shared_modules: sharedModules,
        },
      ];
    }

    return [usage, this.defaultChunkChar()];
  }

  private isChunkEntrypoint(chunk: any): boolean {
    try {
      for (const g of chunk.groupsIterable || []) {
        if (g.isInitial?.()) return true;
      }
    } catch {}
    return false;
  }

  private determineChunkFormat(compilation: any): string | null {
    try {
      if (compilation.options?.output?.module) return 'module';
      const cl = compilation.options?.output?.chunkLoading;
      if (cl === false) return 'false';
      if (typeof cl === 'string') return cl;
    } catch {}
    return null;
  }

  private getChunkLoadingType(compilation: any, chunk: any): string | null {
    try {
      for (const g of chunk.groupsIterable || []) {
        const eo = g.getEntryOptions?.();
        if (eo?.chunkLoading) return String(eo.chunkLoading);
      }
    } catch {}
    return null;
  }

  private getEntryName(compilation: any, chunk: any): string | null {
    try {
      for (const g of chunk.groupsIterable || []) {
        const eo = g.getEntryOptions?.();
        if (eo?.name) return eo.name;
      }
    } catch {}
    return null;
  }

  private collectSharedModulesInChunk(compilation: any, chunk: any): string[] {
    const out: string[] = [];
    const chunkGraph = compilation.chunkGraph;
    const modules = chunkGraph?.getChunkModulesIterable?.(chunk) || [];
    for (const m of modules) {
      if (m?.type === WEBPACK_MODULE_TYPE_CONSUME_SHARED_MODULE) {
        const key = m.options?.shareKey;
        if (key) out.push(String(key));
      }
      // ProvideSharedModule keys could be added if needed via identifier parsing or exposing a getter in class
    }
    return out;
  }

  private defaultChunkChar(): ChunkCharacteristics {
    return {
      entry_module_id: null,
      is_runtime_chunk: false,
      has_runtime: false,
      is_entrypoint: false,
      can_be_initial: false,
      is_only_initial: false,
      chunk_format: null,
      chunk_loading_type: null,
      runtime_names: [],
      entry_name: null,
      has_async_chunks: false,
      chunk_files: [],
      shared_modules: [],
    };
  }
}
