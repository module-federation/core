export type RemoteKeys =
  | 'react_ts_nested_remote/Module'
  | 'react_ts_nested_remote/Button';
type PackageType<T> = T extends 'react_ts_nested_remote/Button'
  ? typeof import('react_ts_nested_remote/Button')
  : T extends 'react_ts_nested_remote/Module'
  ? typeof import('react_ts_nested_remote/Module')
  : any;
