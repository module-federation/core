
    export type RemoteKeys = 'remote1/useCustomRemoteHook' | 'remote1/WebpackSvg' | 'remote1/WebpackPng';
    type PackageType<T> = T extends 'remote1/WebpackPng' ? typeof import('remote1/WebpackPng') :T extends 'remote1/WebpackSvg' ? typeof import('remote1/WebpackSvg') :T extends 'remote1/useCustomRemoteHook' ? typeof import('remote1/useCustomRemoteHook') :any;