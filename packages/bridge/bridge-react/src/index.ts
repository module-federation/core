export { createRemoteComponent } from './remote/create';
export { createBridgeComponent } from './provider/create';
export type {
  ProviderParams,
  RenderFnParams,
  DestroyParams,
  RenderParams,
} from './types';

// 注意：对于特定React版本的支持，请使用以下导入路径：
// - React 16/17: import { createBridgeComponent } from '@module-federation/bridge-react/legacy'
// - React 18: import { createBridgeComponent } from '@module-federation/bridge-react/v18'
// - React 19: import { createBridgeComponent } from '@module-federation/bridge-react/v19'
// export * from './legacy';
