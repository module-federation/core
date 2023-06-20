import type { LoaderContext } from 'webpack';
/**
 *
 * Requires `include-defaults.js` with required shared libs
 *
 */
export default function patchDefaultSharedLoader(this: LoaderContext<Record<string, unknown>>, content: string): string;
