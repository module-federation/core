import type { Span } from '../../../trace';
export declare const compilationSpans: WeakMap<any, Span>;
export declare class RspackProfilingPlugin {
    runWebpackSpan: Span;
    constructor({ runWebpackSpan }: {
        runWebpackSpan: Span;
    });
    apply(compiler: any): void;
}
