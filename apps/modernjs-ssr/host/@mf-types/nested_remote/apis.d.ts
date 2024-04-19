export type RemoteKeys = 'nested_remote/Content';
type PackageType<T> = T extends 'nested_remote/Content'
  ? typeof import('nested_remote/Content')
  : any;
