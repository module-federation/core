import type { Compiler, container } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
interface NodeFederationOptions extends ModuleFederationPluginOptions {
    experiments?: Record<string, unknown>;
    verbose?: boolean;
}
interface Context {
    ModuleFederationPlugin?: typeof container.ModuleFederationPlugin;
}
export declare const parseRemotes: (remotes: Record<string, any>) => Record<string, string>;
export declare const generateRemoteTemplate: (url: string, global: any) => string;
export declare const parseRemoteSyntax: (remote: any) => any;
declare class NodeFederationPlugin {
    private _options;
    private context;
    private experiments;
    constructor({ experiments, verbose, ...options }: NodeFederationOptions, context: Context);
    apply(compiler: Compiler): void;
}
export default NodeFederationPlugin;
