export interface FetchWithRetryOptions {
  url: string;
  options?: RequestInit;
  retryTimes?: number;
  retryDelay?: number;
  fallback?: () => string;
}

export interface ScriptWithRetryOptions {
  url?: string;
  attrs?: Record<string, string>;
  retryTimes?: number;
  retryDelay?: number;
}

export type RetryPluginParams = {
  fetch?: FetchWithRetryOptions; // fetch retry options
  script?: {
    retryTimes?: number;
    retryDelay?: number;
    moduleName?: string;
    cb?: (resolve: (value: unknown) => void, error: any) => void;
  };
};
