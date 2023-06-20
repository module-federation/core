type RemoteUrl = string | (() => Promise<string>);
export interface ImportRemoteOptions {
    url: RemoteUrl;
    scope: string;
    module: string;
    remoteEntryFileName?: string;
    bustRemoteEntryCache?: boolean;
}
export declare const importRemote: <T>({ url, scope, module, remoteEntryFileName, bustRemoteEntryCache, }: ImportRemoteOptions) => Promise<T>;
export {};
