import type {
  Module,
  ReadOnlyGraph,
  SerializerOptions,
} from 'metro/private/DeltaBundler/types';

declare module 'metro/private/DeltaBundler/Serializers/baseJSBundle' {
  interface Bundle {
    modules: readonly [number, string][];
    post: string;
    pre: string;
  }

  export default function baseJSBundle(
    entryPoint: string,
    preModules: readonly Module[],
    graph: ReadOnlyGraph,
    options: SerializerOptions,
  ): Bundle;
}
