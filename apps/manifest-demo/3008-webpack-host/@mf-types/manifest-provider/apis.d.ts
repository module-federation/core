
    export type RemoteKeys = 'manifest-provider/Component';
    type PackageType<T> = T extends 'manifest-provider/Component' ? typeof import('manifest-provider/Component') :any;