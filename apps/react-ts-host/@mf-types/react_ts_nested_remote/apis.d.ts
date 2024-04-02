export type RemoteKeys =
  | 'react_ts_nested_remote/Module'
  | 'react_ts_nested_remote/utils';
type PackageType<T> = T extends 'react_ts_nested_remote/utils'
  ? typeof import('react_ts_nested_remote/utils')
  : T extends 'react_ts_nested_remote/Module'
  ? typeof import('react_ts_nested_remote/Module')
  : any;
