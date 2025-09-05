import { RemoteInfo } from '@module-federation/runtime/types';
export interface FetchWithRetryOptions {
  manifestUrl?: string;
  options?: RequestInit;
  retryTimes?: number;
  retryDelay?: number;
  fallback?:
    | (() => string)
    | ((url: string | URL | globalThis.Request) => string);
  getRetryPath?: (url: string) => string;
}
export interface ScriptWithRetryOptions {
  retryTimes?: number;
  retryDelay?: number;
  moduleName?: Array<string>;
  cb?: (resolve: (value: unknown) => void, error: any) => void;
  getRetryPath?: (url: string) => string;
}

export type RetryPluginParams = {
  fetch?: FetchWithRetryOptions;
  script?: ScriptWithRetryOptions;
};

export type ScriptCommonRetryOption = {
  scriptOption: ScriptWithRetryOptions;
  moduleInfo: RemoteInfo & { alias?: string };
  retryFn: (...args: any[]) => Promise<any> | (() => Promise<any>);
  beforeExecuteRetry?: (...args: any[]) => void;
  getRetryPath?: (url: string) => string;
};
