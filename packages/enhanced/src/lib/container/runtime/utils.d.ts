import type webpack from 'webpack';
import type RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { init } from '@module-federation/runtime-tools';
type Remotes = Parameters<typeof init>[0]['remotes'];
export interface NormalizedRuntimeInitOptionsWithOutShared {
  name: string;
  remotes: Array<
    Remotes[0] & {
      externalType: moduleFederationPlugin.ExternalsType;
    }
  >;
}
type EntryStaticNormalized = Awaited<
  ReturnType<Extract<webpack.WebpackOptionsNormalized['entry'], () => any>>
>;
interface ModifyEntryOptions {
  compiler: webpack.Compiler;
  prependEntry?: (entry: EntryStaticNormalized) => void;
  staticEntry?: EntryStaticNormalized;
}
export declare function getFederationGlobalScope(
  runtimeGlobals: typeof RuntimeGlobals,
): string;
export declare function normalizeRuntimeInitOptionsWithOutShared(
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
): NormalizedRuntimeInitOptionsWithOutShared;
export declare function modifyEntry(options: ModifyEntryOptions): void;
export declare function createHash(contents: string): string;
export declare const normalizeToPosixPath: (p: string) => string;
export {};
