import type { LoaderContext } from 'webpack';
export default function patchDefaultSharedLoader(this: LoaderContext<Record<string, unknown>>, content: string): string;
