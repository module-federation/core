import { AsyncComponentOptions } from 'vue';
import { ComponentPublicInstance } from 'vue';
import * as Vue from 'vue';
import * as VueRouter from 'vue-router';

declare type AddOptionsFnParams = {
  app: Vue.App<Vue.Component>;
  basename: RenderFnParams['basename'];
  memoryRoute: RenderFnParams['memoryRoute'];
  [key: string]: any;
};

export declare function createBridgeComponent(
  bridgeInfo: ProviderFnParams,
): () => {
  __APP_VERSION__: string;
  render(info: RenderFnParams): Promise<void>;
  destroy(info: { dom: HTMLElement }): void;
};

export declare function createRemoteComponent(info: {
  loader: () => Promise<any>;
  export?: string;
  asyncComponentOptions?: Omit<AsyncComponentOptions, 'loader'>;
  rootAttrs?: Record<string, unknown>;
  basename?: string;
}): new () => ComponentPublicInstance;

declare type ProviderFnParams = {
  rootComponent: Vue.Component;
  appOptions: (params: AddOptionsFnParams) => {
    router?: VueRouter.Router;
  } | void;
};

declare interface ProviderParams {
  moduleName?: string;
  basename?: string;
  memoryRoute?: {
    entryPath: string;
  };
  style?: React.CSSProperties;
  className?: string;
}

export declare interface RenderFnParams extends ProviderParams {
  dom: HTMLElement;
}

export {};
