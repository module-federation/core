
    export type RemoteKeys = 'js-entry-provider/Component';
    type PackageType<T> = T extends 'js-entry-provider/Component' ? typeof import('js-entry-provider/Component') :any;