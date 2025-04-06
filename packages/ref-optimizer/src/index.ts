import type { Plugin, PluginContext } from 'rollup';
import {
  analyzeProperties,
  PropertyStats,
  getPropertiesForMangling,
  PropertyConfig,
} from './property-analyzer';
import * as babel from '@babel/core';
import hoistPropertiesPlugin from './hoistproperties';

// Define the *default* virtual module ID
const DEFAULT_VIRTUAL_MODULE_ID = 'virtual:property-literals';

interface RefOptimizerPluginOptions {
  /** Glob patterns for files to analyze. */
  patterns: string[];
  /** Options for the property analyzer. */
  analyzerOptions?: {
    limit?: number;
    minOccurrences?: number;
    excludeUnsafe?: boolean;
    excludeBuiltIns?: boolean;
    /** Special handling for properties */
    propertyRules?: {
      /** Properties that should be treated as object properties regardless of context */
      alwaysObjectProps?: string[];
      /** Properties that should never be mangled */
      neverMangle?: string[];
      /** Properties that should be mangled even if they are built-ins when used as object props */
      mangleAsObjectProps?: {
        names: string[];
        /** Minimum ratio of object property usage to total usage (0-1) */
        minObjectPropRatio?: number;
        /** Maximum ratio of method calls to total usage (0-1) */
        maxMethodCallRatio?: number;
      };
      /** Custom thresholds for specific properties */
      customThresholds?: {
        [propName: string]: {
          minObjectPropRatio?: number;
          maxMethodCallRatio?: number;
        };
      };
      /** Property names to exclude from key transformation in destructuring patterns */
      excludeFromDestructuring?: string[];
    };
  };
  /** Options specifically for getting mangling candidates. */
  manglingOptions?: {
    minOccurrences?: number;
    excludeBuiltIns?: boolean;
    prefix?: string;
  };
  /** (Optional) Callback function to receive the full analysis results. */
  onAnalysisComplete?: (results: PropertyStats[]) => void;
  /** (Optional) Callback function to receive the mangling candidates used for literals.ts. */
  onManglingCandidates?: (candidates: PropertyConfig[]) => void;
  /** Virtual module ID for importing mangled properties. Defaults to 'virtual:property-literals'. */
  virtualModuleId?: string;
  /** If true, enables aggressive mode (minOccurrences: 1, excludeBuiltIns: false) overriding other settings. */
  aggressive?: boolean;
}

interface ManglingCandidate extends PropertyConfig {
  propertyName: string;
  constantName: string;
}

// Create the plugin function
function createRefOptimizer(options: RefOptimizerPluginOptions): Plugin {
  if (!options || !options.patterns || options.patterns.length === 0) {
    throw new Error(
      `Rollup Plugin Ref Optimizer: 'patterns' option is required.`,
    );
  }

  // Determine the effective virtual module ID and its resolved counterpart
  const effectiveVirtualId =
    options.virtualModuleId || DEFAULT_VIRTUAL_MODULE_ID;
  const resolvedEffectiveVirtualId = '\0' + effectiveVirtualId;

  let analysisResults: PropertyStats[] | null = null;
  let manglingCandidates: ManglingCandidate[] | null = null;
  let resolvedAnalyzerOptions: RefOptimizerPluginOptions['analyzerOptions'] =
    {};

  return {
    name: 'ref-optimizer',

    buildStart(this: PluginContext) {
      // Determine final options based on aggressive mode
      let finalAnalyzerOptions = { ...options.analyzerOptions };
      let finalManglingOptions = { ...options.manglingOptions };

      if (options.aggressive) {
        finalAnalyzerOptions.minOccurrences = 1;
        finalAnalyzerOptions.excludeBuiltIns = false;
        finalManglingOptions.minOccurrences = 1;
        finalManglingOptions.excludeBuiltIns = false;
      }

      // Store resolved options in the closure scope
      resolvedAnalyzerOptions = finalAnalyzerOptions;

      // Run the main analysis
      analysisResults = analyzeProperties(
        options.patterns,
        finalAnalyzerOptions,
      );
      if (options.onAnalysisComplete) {
        options.onAnalysisComplete(analysisResults);
      }

      // Get mangling candidates for the virtual module
      manglingCandidates = getPropertiesForMangling(options.patterns, {
        ...finalManglingOptions,
        // Pass finalAnalyzerOptions for consistent analysis rules
        analyzerOptions: finalAnalyzerOptions,
      }) as ManglingCandidate[];

      // Optionally call the callback
      if (options.onManglingCandidates) {
        options.onManglingCandidates(manglingCandidates);
      }
    },

    resolveId(source: string): string | null {
      // Use the effective ID determined from options or default
      if (source === effectiveVirtualId) {
        return resolvedEffectiveVirtualId;
      }
      return null;
    },

    load(id: string): string | null {
      // Use the effective resolved ID determined from options or default
      if (id === resolvedEffectiveVirtualId) {
        if (!manglingCandidates) {
          this.warn(
            'Ref Optimizer: Mangling candidates not available for virtual module. Was buildStart completed?',
          );
          return '';
        }

        const fileHeader = `// Auto-generated by @module-federation/ref-optimizer
// Content provided by the ref-optimizer Rollup plugin.
// ${new Date().toISOString()}

`;

        const constants = manglingCandidates
          .map((c) => `export const ${c.constantName} = '${c.propertyName}';`)
          .join('\n');

        const fileContent = fileHeader + constants + '\n';
        return fileContent;
      }
      return null;
    },

    async transform(code: string, id: string) {
      // Don't transform the virtual module itself or files outside the project scope
      if (
        id === resolvedEffectiveVirtualId ||
        !id.includes(process.cwd()) ||
        id.includes('node_modules')
      ) {
        return null;
      }

      // Only transform if we have mangling candidates
      if (!manglingCandidates || manglingCandidates.length === 0) {
        return null;
      }

      // Retrieve resolved analyzer options from closure
      const currentAnalyzerOptions = resolvedAnalyzerOptions;

      try {
        // Run Babel transformation with proper configuration
        const result = await babel.transformAsync(code, {
          filename: id,
          configFile: false,
          babelrc: false,
          presets: [
            [
              '@babel/preset-typescript',
              {
                isTSX: id.endsWith('.tsx') || id.endsWith('.ts'),
                allExtensions: true,
              },
            ],
          ],
          plugins: [
            [
              hoistPropertiesPlugin,
              {
                propertyConfigs: manglingCandidates.map((c) => ({
                  propertyName: c.propertyName,
                  constantName: c.constantName,
                })),
                // Pass the effective virtual ID to the hoist plugin
                virtualModuleId: effectiveVirtualId,
                // Pass propertyRules from analyzerOptions to hoist plugin
                propertyRules: currentAnalyzerOptions?.propertyRules,
              },
            ],
          ],
          sourceMaps: true,
          ast: false,
          code: true,
        });

        // If Babel returned transformed code, return it with the map
        if (result && result.code) {
          return {
            code: result.code,
            map: result.map,
          };
        }
      } catch (error) {
        if (error instanceof Error) {
          this.error(
            `Ref Optimizer: Babel transform failed for ${id}: ${error.message}`,
          );
        } else {
          this.error(
            `Ref Optimizer: Babel transform failed for ${id}: Unknown error`,
          );
        }
      }

      return null;
    },
  };
}

export default createRefOptimizer;
