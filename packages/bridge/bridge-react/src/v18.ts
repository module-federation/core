/**
 * Entry point for React 18 specific bridge components
 */
export { createBridgeComponent } from './provider/versions/v18';
export type { CreateRootOptions, Root } from './provider/versions/v18';

// 导出必要的类型
export type {
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
  RenderFnParams,
} from './types';
