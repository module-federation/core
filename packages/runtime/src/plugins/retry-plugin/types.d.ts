export interface FetchWithRetryOptions {
  url?: string;
  options?: RequestInit;
  retryTimes?: number;
  fallback?: () => string;
}

export interface ScriptWithRetryOptions {
  url?: string;
  attrs?: Record<string, string>;
  retryTimes?: number;
  customCreateScript?: CreateScriptFunc;
}

export type RetryPluginParams = {
  fetch?: FetchWithRetryOptions; // fetch retry options
  script?: ScriptWithRetryOptions; // script retry options
};

export type ReqiuredUrl<T extends { url?: string }> = Required<Pick<T, 'url'>> &
  Omit<T, 'url'>;

export type CreateScriptFunc = (
  url: string,
  attrs: Record<string, any>,
) => HTMLScriptElement;

export type ReqiuredUrl<T extends { url?: string }> = Required<Pick<T, 'url'>> &
  Omit<T, 'url'>;
