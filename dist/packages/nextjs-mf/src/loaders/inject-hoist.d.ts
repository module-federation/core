import type { LoaderContext } from 'webpack';
declare function injectTopLoader(this: LoaderContext<Record<string, unknown>>, source: string): string;
export default injectTopLoader;
