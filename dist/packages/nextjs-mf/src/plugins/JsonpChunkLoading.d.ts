import type { Compiler } from 'webpack';
declare class CustomWebpackPlugin {
    private options;
    constructor(options?: any);
    apply(compiler: Compiler): void;
}
export default CustomWebpackPlugin;
