import type webpack from 'webpack';
export declare function isClientComponentEntryModule(mod: webpack.NormalModule): boolean;
export declare const regexCSS: RegExp;
export declare function isCSSMod(mod: {
    resource: string;
    type?: string;
    loaders?: {
        loader: string;
    }[];
}): boolean;
export declare function encodeToBase64<T extends object>(obj: T): string;
export declare function decodeFromBase64<T extends object>(str: string): T;
export declare function getLoaderModuleNamedExports(resourcePath: string, context: webpack.LoaderContext<any>): Promise<string[]>;
