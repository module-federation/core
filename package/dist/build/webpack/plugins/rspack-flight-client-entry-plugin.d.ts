import type { Compiler } from '@rspack/core';
type Actions = {
    [actionId: string]: {
        workers: {
            [name: string]: {
                moduleId: string | number;
                async: boolean;
            };
        };
        layer: {
            [name: string]: string;
        };
    };
};
export type ActionManifest = {
    encryptionKey: string;
    node: Actions;
    edge: Actions;
};
export interface ModuleInfo {
    moduleId: string | number;
    async: boolean;
}
interface Options {
    dev: boolean;
    appDir: string;
    isEdgeServer: boolean;
    encryptionKey: string;
}
export declare class RspackFlightClientEntryPlugin {
    plugin: any;
    compiler?: Compiler;
    constructor(options: Options);
    apply(compiler: Compiler): void;
}
export {};
