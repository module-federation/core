export type RemoteKeys = 'REMOTE_ALIAS_IDENTIFIER/Module';
type PackageType<T> = T extends 'REMOTE_ALIAS_IDENTIFIER/Module'
  ? typeof import('REMOTE_ALIAS_IDENTIFIER/Module')
  : any;
