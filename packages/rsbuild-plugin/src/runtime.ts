export * from '@module-federation/enhanced/runtime';
export type DataFetchParams = {
  isDowngrade: boolean;
} & Record<string, unknown>;
