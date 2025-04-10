/**
 * Entry point for React 16/17 specific bridge components
 */
export { createBridgeComponent } from './provider/versions/v16';
export type { CreateRootOptions, Root } from './provider/versions/v16';

// 导出必要的类型
export type {
  ProviderParams,
  ProviderFnParams,
  RootType,
  DestroyParams,
  RenderParams,
  RenderFnParams,
} from './types';
