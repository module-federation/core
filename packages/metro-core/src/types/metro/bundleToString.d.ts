declare module 'metro/src/lib/bundleToString' {
  interface Bundle {
    modules: readonly [number, string][];
    post: string;
    pre: string;
  }

  interface BundleMetadata {
    pre: number;
    post: number;
    modules: readonly [number, number][];
  }

  export default function bundleToString(bundle: Bundle): {
    code: string;
    metadata: BundleMetadata;
  };
}
