declare module 'metro/src/lib/relativizeSourceMap' {
  import type { MixedSourceMap } from 'metro-source-map';

  export default function relativizeSourceMap(
    sourceMap: MixedSourceMap,
    sourcesRoot: string,
  ): void;

  export function relativizeSourceMapInline(
    sourceMap: MixedSourceMap,
    sourcesRoot: string,
  ): void;
}
