import { ModuleFederationPluginOptions } from '../types';
import type { Compiler, container } from 'webpack';
interface NodeFederationOptions extends ModuleFederationPluginOptions {
    isServer: boolean;
    promiseBaseURI?: string;
    verbose?: boolean;
}
interface NodeFederationContext {
    ModuleFederationPlugin?: typeof container.ModuleFederationPlugin;
}
declare class UniversalFederationPlugin {
    private _options;
    private context;
    constructor(options: NodeFederationOptions, context: NodeFederationContext);
    apply(compiler: Compiler): void;
}
export default UniversalFederationPlugin;
