export type CommonRetryOptions = {
  /**
   * retry request options
   */
  fetchOptions?: RequestInit;
  /**
   * retry times
   */
  retryTimes?: number;
  /**
   * retry success times
   */
  successTimes?: number;
  /**
   * retry delay
   */
  retryDelay?: number;
  /**
   * retry path
   */
  getRetryPath?: (url: string) => string;
  /**
   * add query parameter
   */
  addQuery?:
    | boolean
    | ((context: { times: number; originalQuery: string }) => string);
  /**
   * retry domains
   */
  domains?: string[];
  /**
   * retry callback
   */
  onRetry?: ({
    times,
    domains,
    url,
  }: {
    times?: number;
    domains?: string[];
    url?: string;
    tagName?: string;
  }) => void;
  /**
   * retry success callback
   */
  onSuccess?: ({
    domains,
    url,
    tagName,
  }: {
    domains?: string[];
    url?: string;
    tagName?: string;
  }) => void;
  /**
   * retry failure callback
   */
  onError?: ({
    domains,
    url,
    tagName,
  }: {
    domains?: string[];
    url?: string;
    tagName?: string;
  }) => void;
};

export type FetchRetryOptions = {
  url?: string;
  fetchOptions?: RequestInit;
} & CommonRetryOptions;

export type ScriptRetryOptions = {
  retryOptions: CommonRetryOptions;
  retryFn: (...args: any[]) => Promise<any> | (() => Promise<any>);
  beforeExecuteRetry?: (...args: any[]) => void;
};
