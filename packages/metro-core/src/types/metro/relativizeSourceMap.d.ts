import type { MixedSourceMap } from 'metro-source-map';

declare module 'metro/src/lib/relativizeSourceMap' {
  export default function relativizeSourceMap(
    sourceMap: MixedSourceMap,
    sourcesRoot: string,
  ): void;
}
