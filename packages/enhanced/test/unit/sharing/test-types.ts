import type { Compilation } from 'webpack';
import type ConsumeSharedPlugin from '../../../src/lib/sharing/ConsumeSharedPlugin';
import type { SemVerRange } from 'webpack/lib/util/semver';

export type ConsumeSharedPluginInstance = ConsumeSharedPlugin;

export type ConsumeConfig = Parameters<
  ConsumeSharedPluginInstance['createConsumeSharedModule']
>[3];

// Infer the resolver signature from webpack's Compilation type so tests stay aligned
// with upstream changes.
type NormalResolver = ReturnType<Compilation['resolverFactory']['get']>;

type ResolveSignature = NormalResolver extends {
  resolve: infer Fn;
}
  ? Fn
  : (
      context: Record<string, unknown>,
      lookupStartPath: string,
      request: string,
      resolveContext: Record<string, unknown>,
      callback: (err: Error | null, result?: string | null) => void,
    ) => void;

export type ResolveFunction = ResolveSignature;

export type DescriptionFileResolver = (
  fs: Parameters<ResolveFunction>[0],
  dir: string,
  files: string[],
  callback: (
    err: Error | null,
    result?: { data?: { name?: string; version?: string }; path?: string },
  ) => void,
) => void;

export type ConsumeEntry = [
  string,
  Partial<ConsumeConfig> & Record<string, unknown>,
];

export type SemVerRangeLike = SemVerRange | string;
