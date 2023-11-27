import type { Compiler, WebpackOptionsNormalized } from 'webpack';

export type EntryStaticNormalized = Awaited<
ReturnType<Extract<WebpackOptionsNormalized['entry'], () => any>>
>;

export interface ModifyEntryOptions {
  compiler: Compiler;
  prependEntry?: (entry: EntryStaticNormalized) => void;
  staticEntry?: EntryStaticNormalized;
}
