import type { LoaderContext } from 'webpack';
/**
 *
 * Requires either the default delegate module or a custom one
 *
 */
export default function patchDefaultSharedLoader(this: LoaderContext<Record<string, unknown>>, content: string): string;
