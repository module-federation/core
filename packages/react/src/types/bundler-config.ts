// import type { container } from 'webpack';
// export type ModuleFederationPluginOptions = ConstructorParameters<typeof container.ModuleFederationPlugin>['0'];
// type RemotesObject = ModuleFederationPluginOptions['remotes'];

export enum ScopeType {
    Host,
    Remote
};

export type FederatedRemote = {
    [key: string]: string;
};

export type FederatedModule = {
    [key: string]: string;
};

export type BundlerConfigProps = {
    scopeType: ScopeType;
    scope?: string;
    useTypescript: boolean;
    devPort: number;
    remotes?: FederatedRemote[];
    exposes?: FederatedModule;
};