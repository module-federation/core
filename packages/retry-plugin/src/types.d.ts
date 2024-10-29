export interface FetchWithRetryOptions {
  url: string;
  options?: RequestInit;
  retryTimes?: number;
  retryDelay?: number;
  fallback?: () => string;
}

export interface ScriptWithRetryOptions {
  retryTimes?: number;
  retryDelay?: number;
  moduleName?: Array<string>;
  cb?: (resolve: (value: unknown) => void, error: any) => void;
}

export type RetryPluginParams = {
  fetch?: FetchWithRetryOptions;
  script?: ScriptWithRetryOptions;
};
