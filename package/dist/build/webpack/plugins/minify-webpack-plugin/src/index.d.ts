import { sources, type CacheFacade, type Compilation } from 'next/dist/compiled/webpack/webpack';
export declare class MinifyPlugin {
    private options;
    constructor(options: {
        noMangling?: boolean;
    });
    optimize(compiler: any, compilation: Compilation, assets: any, cache: CacheFacade, { SourceMapSource, RawSource, }: {
        SourceMapSource: typeof sources.SourceMapSource;
        RawSource: typeof sources.RawSource;
    }): Promise<void>;
    apply(compiler: any): void;
}
