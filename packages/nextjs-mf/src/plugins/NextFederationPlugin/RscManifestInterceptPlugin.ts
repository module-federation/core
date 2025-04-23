import type { Compiler, Compilation } from 'webpack';
import * as vm from 'vm';
import { NextFederationPlugin } from './index';

const PLUGIN_NAME = 'RscManifestInterceptPlugin';
const CLIENT_REFERENCE_MANIFEST = 'client-reference-manifest';

// Define types for the manifest structure
interface ModuleLoading {
  prefix?: string;
  [key: string]: any;
}

interface ManifestEntry {
  moduleLoading?: ModuleLoading;
  [key: string]: any;
}

interface RscManifest {
  [key: string]: ManifestEntry;
}

export class RscManifestInterceptPlugin {
  apply(compiler: Compiler) {
    const { sources, Compilation } = compiler.webpack;
    compiler.hooks.afterPlugins.tap(PLUGIN_NAME, (compiler: Compiler) => {
      compiler.hooks.compilation.tap(
        PLUGIN_NAME,
        (compilation: Compilation) => {
          compilation.hooks.processAssets.tapPromise(
            {
              name: `${PLUGIN_NAME}Modify`,
              // Run at a later stage to ensure manifest files are available
              stage:
                // @ts-expect-error use runtime variable in case peer dep not installed
                compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER,
            },
            async (assets) => {
              // Get the original public path from NextFederationPlugin
              const originalPublicPath =
                NextFederationPlugin.originalPublicPath || '/_next/';

              for (const assetName in assets) {
                if (assetName.includes('client-reference-manifest.js')) {
                  const asset = assets[assetName];
                  if (!asset) continue;
                  const originalSource = asset.source();
                  const content = Buffer.isBuffer(originalSource)
                    ? originalSource.toString()
                    : String(originalSource);

                  try {
                    // Create a sandbox with globalThis
                    const sandbox = {
                      globalThis: {
                        __RSC_MANIFEST: {} as RscManifest,
                      },
                    };

                    // Create a new VM context
                    vm.createContext(sandbox);

                    // Run the file content in the VM context
                    vm.runInContext(content, sandbox);

                    // Get the manifest object from the sandbox
                    const manifest = sandbox.globalThis.__RSC_MANIFEST;

                    // Check if we need to modify the prefix
                    let modified = false;
                    for (const key in manifest) {
                      if (manifest[key]?.moduleLoading?.prefix === 'auto') {
                        manifest[key].moduleLoading.prefix = originalPublicPath;
                        modified = true;
                      }
                    }

                    if (modified) {
                      // Serialize the modified manifest back to a string
                      const newContent = `globalThis.__RSC_MANIFEST=${JSON.stringify(manifest)};`;

                      // Create a new source
                      const newSource = new sources.RawSource(newContent);

                      // Update the asset using the compilation API
                      compilation.updateAsset(assetName, newSource);
                    }
                  } catch (e: any) {
                    console.error(
                      `[${PLUGIN_NAME}] Error processing manifest ${assetName}:`,
                      e.message,
                    );
                    compilation.errors.push(
                      new compiler.webpack.WebpackError(
                        `${PLUGIN_NAME}: Failed to process ${assetName}: ${e.message}`,
                      ),
                    );
                  }
                }
              }
            },
          );
        },
      );
    });
  }
}

export default RscManifestInterceptPlugin;
