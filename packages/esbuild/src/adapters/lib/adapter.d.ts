import {
  BuildAdapter,
  BuildAdapterOptions,
  BuildResult,
} from '@module-federation/native-federation/build';
import * as esbuild from 'esbuild';
export declare const esBuildAdapter: BuildAdapter;
export type ReplacementConfig = {
  file: string;
};
export interface EsBuildAdapterConfig {
  plugins: esbuild.Plugin[];
  fileReplacements?: Record<string, string | ReplacementConfig>;
  skipRollup?: boolean;
  compensateExports?: RegExp[];
  loader?: {
    [ext: string]: esbuild.Loader;
  };
}
export declare function createEsBuildAdapter(
  config: EsBuildAdapterConfig,
): (options: BuildAdapterOptions) => Promise<BuildResult[]>;
