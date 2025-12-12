import type { MixedSourceMap } from 'metro-source-map';

declare module 'metro/private/lib/relativizeSourceMap' {
  export default function relativizeSourceMap(
    sourceMap: MixedSourceMap,
    sourcesRoot: string,
  ): void;
}
