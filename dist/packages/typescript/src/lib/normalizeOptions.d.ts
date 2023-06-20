import ts from 'typescript';
import { Compiler } from 'webpack';
import type { FederatedTypesPluginOptions } from '../types';
export type NormalizeOptions = ReturnType<typeof normalizeOptions>;
export declare const normalizeOptions: (options: FederatedTypesPluginOptions, compiler: Compiler) => {
    distDir: string;
    publicPath: string;
    tsCompilerOptions: ts.CompilerOptions;
    typesIndexJsonFileName: string;
    typesIndexJsonFilePath: string;
    typescriptFolderName: string;
    webpackCompilerOptions: import("webpack").WebpackOptionsNormalized;
    ignoredWatchOptions: string[];
    disableTypeCompilation: boolean;
    disableDownloadingRemoteTypes: boolean;
    downloadRemoteTypesTimeout: number;
    additionalFilesToCompile: string[];
    compiler: "tsc" | "vue-tsc";
};
