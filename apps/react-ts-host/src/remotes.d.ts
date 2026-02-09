declare module 'react_ts_nested_remote/Module' {
  import type { ComponentType } from 'react';
  const RemoteModule: ComponentType<any>;
  export default RemoteModule;
}

declare module 'react_ts_nested_remote/utils' {
  export function add(...numbers: number[]): number;
  export function sub(...numbers: number[]): number;
}
