import { Compiler } from 'webpack';
declare class CopyBuildOutputPlugin {
    private isServer;
    constructor(isServer: boolean);
    apply(compiler: Compiler): void;
}
export default CopyBuildOutputPlugin;
