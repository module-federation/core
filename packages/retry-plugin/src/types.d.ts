import { RemoteInfo } from '@module-federation/runtime/types';

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

export type RetryPluginParamsNew = {
  /**
   * 重试的请求配置
   */
  fetchOptions?: RequestInit;
  /**
   * 重试次数
   */
  retryTimes?: number;
  /**
   * 重试成功次数
   */
  successTimes?: number;
  /**
   * 重试延迟
   */
  retryDelay?: number;
  /**
   * 重试路径
   */
  getRetryPath?: (url: string) => string;
  /**
   * 添加查询参数
   */
  addQuery?:
    | boolean
    | ((context: { times: number; originalQuery: string }) => string);
  /**
   * 重试的域名列表
   */
  domains?: string[];
  /**
   * 重试回调
   */
  onRetry?: ({ times, domains, url }) => void;
  /**
   * 重试成功回调
   */
  onSuccess?: ({ domains, url, tagName }) => void;
  /**
   * 重试失败回调
   */
  onError?: ({ domains, url, tagName }) => void;
};

export type FetchWithRetryOptions = {
  url?: string;
  options?: RequestInit;
} & RetryPluginParamsNew;

export type ScriptCommonRetryOption = {
  scriptOption: ScriptWithRetryOptions;
  moduleInfo: RemoteInfo & { alias?: string };
  retryFn: (...args: any[]) => Promise<any> | (() => Promise<any>);
  beforeExecuteRetry?: (...args: any[]) => void;
} & RetryPluginParamsNew;
