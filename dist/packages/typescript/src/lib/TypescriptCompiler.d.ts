import { FederatedTypesPluginOptions, ModuleFederationPluginOptions } from '../types';
import { NormalizeOptions } from './normalizeOptions';
export declare class TypescriptCompiler {
    private options;
    private compilerOptions;
    private tsDefinitionFilesObj;
    private logger;
    constructor(options: NormalizeOptions);
    generateDeclarationFiles(exposedComponents: ModuleFederationPluginOptions['exposes'], additionalFilesToCompile?: FederatedTypesPluginOptions['additionalFilesToCompile']): Record<string, string>;
    private getCompilerProgram;
    private normalizeFiles;
    private getNormalizedPathWithExt;
    private createHost;
    private reportCompileDiagnostic;
    private getTSConfigCompilerOptions;
    private getFilenameWithExtension;
}
