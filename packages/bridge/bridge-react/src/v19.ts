/**
 * Entry point for React 19 specific bridge components
 */
export { createBridgeComponent } from './provider/versions/v19';
export type { CreateRootOptions, Root } from './provider/versions/v19';

// 导出必要的类型
export type {
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
  RenderFnParams,
} from './types';
