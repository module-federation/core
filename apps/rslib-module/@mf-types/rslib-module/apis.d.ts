export type RemoteKeys = 'rslib-module';
type PackageType<T> = T extends 'rslib-module'
  ? typeof import('rslib-module')
  : any;
