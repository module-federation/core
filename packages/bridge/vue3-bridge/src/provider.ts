import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import {
  BRIDGE_SSR_PROTOCOL_VERSION,
  hasBridgeSSRMarkup,
  type BridgeSSRConfig,
  type BridgeSSRPrepareResult,
  type BridgeSSRResult,
  type BridgeServerRenderContext,
  type RenderFnParams,
} from '@module-federation/bridge-shared';
import { LoggerInstance } from './utils';
import { getInstance } from '@module-federation/runtime';
import { processRoutes } from './routeUtils';

declare const __APP_VERSION__: string;

type AddOptionsFnParams = {
  app: Vue.App<Vue.Component>;
  basename: RenderFnParams['basename'];
  memoryRoute: RenderFnParams['memoryRoute'];
  request?: Request;
  signal?: AbortSignal;
  ssr: boolean;
  [key: string]: any;
};

export type ProviderFnParams = {
  rootComponent: Vue.Component;
  appOptions: (params: AddOptionsFnParams) => {
    router?: VueRouter.Router;
    afterRouterCreate?: (router: VueRouter.Router) => void;
  } | void;
  ssr?: BridgeSSRConfig<Record<string, unknown>>;
};

export type BridgeVueServerRenderer = (
  app: Vue.App,
  context: Record<string, unknown>,
) => string | Promise<string>;

type BridgeAppInfo = Omit<RenderFnParams, 'dom'> & {
  dom?: HTMLElement;
  request?: Request;
  url?: string;
};

async function setupBridgeApp(
  bridgeInfo: ProviderFnParams,
  info: BridgeAppInfo,
  props: Record<string, unknown>,
  mode: 'ssr' | 'hydrate' | 'csr',
) {
  if (info.signal?.aborted) throw info.signal.reason;
  const app = (mode === 'csr' ? Vue.createApp : Vue.createSSRApp)(
    bridgeInfo.rootComponent,
    props,
  );
  const options = bridgeInfo.appOptions({
    ...props,
    app,
    basename: info.basename,
    memoryRoute: info.memoryRoute,
    hashRoute: info.hashRoute,
    request: info.request,
    signal: info.signal,
    ssr: mode === 'ssr',
  });
  let router: VueRouter.Router | undefined;
  if (options?.router) {
    const effectiveMemoryRoute =
      mode === 'ssr' ? { entryPath: info.url ?? '/' } : info.memoryRoute;
    const processed = processRoutes({
      router: options.router,
      basename: info.basename,
      memoryRoute: effectiveMemoryRoute,
      hashRoute: info.hashRoute,
    });
    router = VueRouter.createRouter({
      ...options.router.options,
      history: processed.history,
      routes: processed.routes,
    });
    processed.patchRouter?.(router);
    options.afterRouterCreate?.(router);
    if (effectiveMemoryRoute) {
      await router.push(effectiveMemoryRoute.entryPath);
    }
    app.use(router);
    if (mode !== 'csr') await router.isReady();
  }
  if (info.signal?.aborted) throw info.signal.reason;
  return { app, router };
}

function serverLocation(request: Request, basename?: string) {
  const url = new URL(request.url);
  let pathname = url.pathname || '/';
  const base = (basename || '/').replace(/\/$/, '') || '/';
  if (base !== '/' && (pathname === base || pathname.startsWith(`${base}/`))) {
    pathname = pathname.slice(base.length) || '/';
  }
  return `${pathname}${url.search}`;
}

export function createBridgeComponentWithServerRenderer(
  bridgeInfo: ProviderFnParams,
  serverRenderer?: BridgeVueServerRenderer,
) {
  const roots = new Map<HTMLElement, Vue.App>();
  const runtime = getInstance();

  return () => {
    const config =
      typeof bridgeInfo.ssr === 'object' ? bridgeInfo.ssr : undefined;
    const provider: {
      __APP_VERSION__: string;
      render: (info: RenderFnParams) => Promise<void>;
      destroy: (info: { dom: HTMLElement }) => void;
      renderServer?: (
        context: BridgeServerRenderContext<Record<string, unknown>>,
      ) => Promise<BridgeSSRResult>;
    } = {
      __APP_VERSION__,
      async render(info) {
        if (info.signal?.aborted) return;
        const {
          moduleName,
          dom,
          basename,
          memoryRoute,
          hashRoute,
          instanceId,
          ssrState,
          signal,
          ...applicationProps
        } = info;
        const beforeBridgeRenderRes =
          await runtime?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(info);
        const extraProps =
          beforeBridgeRenderRes &&
          typeof beforeBridgeRenderRes === 'object' &&
          beforeBridgeRenderRes.extraProps
            ? beforeBridgeRenderRes.extraProps
            : {};
        const shouldHydrate = hasBridgeSSRMarkup(dom, {
          moduleName,
          instanceId,
        });
        const hydrated =
          shouldHydrate && config?.hydrate ? config.hydrate(ssrState) : {};
        const nextProps = { ...hydrated, ...applicationProps, ...extraProps };
        const { app } = await setupBridgeApp(
          bridgeInfo,
          { basename, memoryRoute, hashRoute, instanceId, signal },
          nextProps,
          shouldHydrate ? 'hydrate' : 'csr',
        );
        if (signal?.aborted) return;
        roots.set(dom, app);
        app.mount(dom, shouldHydrate);
        runtime?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(info);
        LoggerInstance.debug('createBridgeComponent rendered', { moduleName });
      },
      destroy({ dom }) {
        const info = { dom };
        LoggerInstance.debug('createBridgeComponent destroy Info', info);
        runtime?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(info);
        roots.get(dom)?.unmount();
        roots.delete(dom);
        runtime?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(info);
      },
    };

    if (serverRenderer && bridgeInfo.ssr) {
      provider.renderServer = async (context) => {
        if (context.signal.aborted) throw context.signal.reason;
        const preparedValue = await config?.prepare?.(context);
        const prepared = (preparedValue || {}) as BridgeSSRPrepareResult<
          Record<string, unknown>
        >;
        const renderInfo = prepared.props ?? context.props;
        const { basename, memoryRoute, hashRoute, ...applicationProps } =
          renderInfo;
        delete applicationProps.moduleName;
        const { app } = await setupBridgeApp(
          bridgeInfo,
          {
            moduleName: context.moduleName,
            basename: basename as string | undefined,
            memoryRoute: memoryRoute as RenderFnParams['memoryRoute'],
            hashRoute: Boolean(hashRoute),
            request: context.request,
            signal: context.signal,
            url: serverLocation(
              context.request,
              basename as string | undefined,
            ),
          },
          applicationProps,
          'ssr',
        );
        const ssrContext: Record<string, unknown> = {};
        const html = await serverRenderer(app, ssrContext);
        if (context.signal.aborted) throw context.signal.reason;
        return {
          protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
          moduleName: context.moduleName,
          instanceId: context.instanceId,
          html,
          dehydratedState: prepared.dehydratedState,
        };
      };
    }
    return provider;
  };
}

export function createBridgeComponent(bridgeInfo: ProviderFnParams) {
  return createBridgeComponentWithServerRenderer(bridgeInfo);
}
