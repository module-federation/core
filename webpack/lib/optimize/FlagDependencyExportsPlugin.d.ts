export = FlagDependencyExportsPlugin;
declare class FlagDependencyExportsPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler the compiler instance
     * @returns {void}
     */
    apply(compiler: Compiler): void;
}
declare namespace FlagDependencyExportsPlugin {
    export { MemCacheEntry };
}
import type Compiler from "../Compiler";
type MemCacheEntry = {
    etag: string;
    data: InstanceType<{
        new (exports: ExportsInfo.RestoreProvidedDataExports[], otherProvided: ExportsInfo.ExportInfoProvided, otherCanMangleProvide: boolean, otherTerminalBinding: boolean): {
            exports: ExportsInfo.RestoreProvidedDataExports[];
            otherProvided: ExportsInfo.ExportInfoProvided | undefined;
            otherCanMangleProvide: boolean | undefined;
            otherTerminalBinding: boolean;
            serialize(context: ObjectSerializerContext): void;
        };
        deserialize(context: ObjectDeserializerContext): {
            exports: ExportsInfo.RestoreProvidedDataExports[];
            otherProvided: ExportsInfo.ExportInfoProvided | undefined;
            otherCanMangleProvide: boolean | undefined;
            otherTerminalBinding: boolean;
            serialize(context: ObjectSerializerContext): void;
        };
    }>;
};
import type ExportsInfo from "../graph/ExportsInfo";
