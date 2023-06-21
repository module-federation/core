import { Compiler } from 'webpack';
declare class RemoveEagerModulesFromRuntimePlugin {
    private container;
    private debug;
    private dependentModules;
    private visitedModules;
    constructor(options: {
        container?: string;
        debug?: boolean;
    });
    apply(compiler: Compiler): void;
    private traverseModuleGraph;
    private getEagerModulesInRemote;
    private processModules;
    private removeDependentModules;
}
export default RemoveEagerModulesFromRuntimePlugin;
