export type RemoteKeys = 'react_ts_remote/Module';
type PackageType<T> = T extends 'react_ts_remote/Module'
  ? typeof import('react_ts_remote/Module')
  : any;
