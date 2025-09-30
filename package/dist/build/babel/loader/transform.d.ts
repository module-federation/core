import type { Span } from '../../../trace';
import type { NextJsLoaderContext } from './types';
export default function transform(this: NextJsLoaderContext, source: string, inputSourceMap: object | null | undefined, loaderOptions: any, filename: string, target: string, parentSpan: Span): Promise<{
    code: string;
    map: object | null | undefined;
}>;
