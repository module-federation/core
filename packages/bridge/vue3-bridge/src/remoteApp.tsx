import {
  ref,
  onMounted,
  onBeforeUnmount,
  onActivated,
  onDeactivated,
  onUpdated,
  watch,
  defineComponent,
  useAttrs,
  nextTick,
  type PropType,
} from 'vue';
import {
  BRIDGE_SSR_PROTOCOL_VERSION,
  dispatchPopstateEnv,
  getBridgeSSRContainerAttrs,
  getBridgeSSRSlotAttrs,
  getMatchingBridgeSSRPayload,
  MF_BRIDGE_INSTANCE_ATTR,
  MF_BRIDGE_MODULE_ATTR,
  MF_BRIDGE_MOUNT_ATTR,
  MF_BRIDGE_SSR_ATTR,
  MF_BRIDGE_VERSION_ATTR,
  serializeBridgeSSRStateEnvelope,
  type BridgeSSRReference,
  type BridgeSSRResult,
} from '@module-federation/bridge-shared';
import { useRoute } from 'vue-router';
import { LoggerInstance } from './utils';
import { getInstance } from '@module-federation/runtime';
import { useBridgeHydrationRegistry } from './hydration';

function clearBridgeSSRMountAttrs(dom: HTMLElement) {
  dom.removeAttribute(MF_BRIDGE_SSR_ATTR);
  dom.removeAttribute(MF_BRIDGE_MOUNT_ATTR);
  dom.removeAttribute(MF_BRIDGE_VERSION_ATTR);
  dom.removeAttribute(MF_BRIDGE_MODULE_ATTR);
  dom.removeAttribute(MF_BRIDGE_INSTANCE_ATTR);
}

export default defineComponent({
  name: 'RemoteApp',
  props: {
    moduleName: String,
    basename: String,
    memoryRoute: Object,
    hashRoute: Boolean,
    providerInfo: Function,
    rootAttrs: Object,
    ssr: Object as PropType<BridgeSSRResult | BridgeSSRReference>,
    instanceId: String,
  },
  inheritAttrs: false,
  setup(props) {
    const rootRef = ref(null);
    const providerInfoRef = ref(null);
    const pathname = ref('');
    const isRendered = ref(false);
    const isActive = ref(false);
    const wasDeactivated = ref(false);
    const renderError = ref<unknown>();
    const controller = new AbortController();
    let renderQueue = Promise.resolve();
    let consumedSnapshot = false;
    let hydratedOnce = false;
    let csrOnly = false;
    let providerGeneration = 0;
    const route = useRoute();
    const hostInstance = getInstance();
    const componentAttrs = useAttrs();
    let lastComponentAttrs = { ...componentAttrs };
    const ssrPayload = getMatchingBridgeSSRPayload(props.ssr, {
      moduleName: props.moduleName,
      instanceId: props.instanceId,
    });
    const instanceId = props.instanceId || ssrPayload?.instanceId;
    const serverPayload =
      ssrPayload && 'html' in ssrPayload
        ? (ssrPayload as BridgeSSRResult)
        : undefined;
    const reference =
      ssrPayload && !('html' in ssrPayload)
        ? (ssrPayload as BridgeSSRReference)
        : undefined;
    const registry = useBridgeHydrationRegistry();
    if (reference && !registry) {
      throw new Error(
        'Bridge SSR references require provideBridgeHydrationRegistry before mount',
      );
    }
    const snapshot =
      reference && instanceId
        ? registry!.peek(reference.moduleName, instanceId)
        : undefined;
    const hasSSRPayload = Boolean((serverPayload || snapshot) && instanceId);
    const registryModuleName =
      props.moduleName || reference?.moduleName || ssrPayload?.moduleName || '';

    const releaseUnclaimedSnapshot = () => {
      if (!snapshot || !instanceId || consumedSnapshot || !registry) return;
      registry.fail(registryModuleName, instanceId);
      consumedSnapshot = true;
    };

    const getBridgeRenderProps = () => ({
      moduleName: props.moduleName,
      dom: rootRef.value,
      basename: props.basename,
      memoryRoute: props.memoryRoute,
      hashRoute: props.hashRoute,
    });

    const renderComponent = () => {
      const pending = renderQueue.then(async () => {
        const generation = providerGeneration;
        const dom = rootRef.value as HTMLElement | null;
        if (
          !dom ||
          !dom.isConnected ||
          !props.providerInfo ||
          controller.signal.aborted
        ) {
          return;
        }
        const providerReturn = providerInfoRef.value || props.providerInfo?.();
        providerInfoRef.value = providerReturn;
        const wasRendered = isRendered.value;

        // Claim before any await so cancel cannot leave a peekable snapshot.
        // After a claim (even if render aborts), never hydrate again — CSR only.
        let ssrState =
          wasRendered || hydratedOnce || consumedSnapshot
            ? undefined
            : serverPayload?.dehydratedState;
        if (
          !wasRendered &&
          !hydratedOnce &&
          !consumedSnapshot &&
          snapshot &&
          instanceId &&
          registry
        ) {
          const claimed = registry.consume(registryModuleName, instanceId);
          if (Object.is(claimed, snapshot)) {
            consumedSnapshot = true;
            ssrState = snapshot.state;
          } else {
            consumedSnapshot = true;
            hydratedOnce = true;
            ssrState = undefined;
            clearBridgeSSRMountAttrs(dom);
          }
        }

        let renderProps = {
          ...componentAttrs,
          moduleName: props.moduleName,
          dom,
          basename: props.basename,
          memoryRoute: props.memoryRoute,
          hashRoute: props.hashRoute,
          instanceId,
          ssrState,
          signal: controller.signal,
        };
        LoggerInstance.debug(
          `createRemoteAppComponent LazyComponent render >>>`,
          renderProps,
        );

        const beforeBridgeRenderRes =
          (await hostInstance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
            renderProps,
          )) || {};
        renderProps = { ...renderProps, ...beforeBridgeRenderRes.extraProps };
        await providerReturn.render(renderProps);
        if (
          generation !== providerGeneration ||
          controller.signal.aborted ||
          wasDeactivated.value ||
          !dom.isConnected
        ) {
          // Only destroy if this provider is still the active one. A newer
          // providerInfo watch may already have destroyed and replaced it.
          if (providerInfoRef.value === providerReturn) {
            providerReturn.destroy?.({ dom });
            providerInfoRef.value = null;
            isRendered.value = false;
          }
          return;
        }
        isRendered.value = true;
        // One-shot hydrate for this instance. Keep SSR markers in the DOM so
        // hosts/tests can observe them; strip only on KeepAlive deactivate.
        if (snapshot || serverPayload) {
          hydratedOnce = true;
        }
        hostInstance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(
          renderProps,
        );
      });
      renderQueue = pending.catch((error) => {
        if (controller.signal.aborted || wasDeactivated.value) return;
        if (snapshot && instanceId && !consumedSnapshot) {
          registry?.fail(registryModuleName, instanceId);
          consumedSnapshot = true;
        }
        renderError.value = error;
      });
      return renderQueue;
    };

    const destroyComponent = () => {
      const providerReturn = providerInfoRef.value as any;
      // Destroy whenever a provider was obtained. A failed/aborted render may
      // still have mounted an app before rejecting, so do not gate on isRendered.
      if (!providerReturn) {
        return;
      }
      LoggerInstance.debug(
        `createRemoteAppComponent LazyComponent destroy >>>`,
        {
          ...props,
        },
      );

      const bridgeRenderProps = getBridgeRenderProps();
      hostInstance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
        bridgeRenderProps,
      );

      providerReturn.destroy({ dom: rootRef.value });
      providerInfoRef.value = null;
      isRendered.value = false;

      hostInstance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(
        bridgeRenderProps,
      );
    };

    const watchStopHandle = watch(
      () => route?.path,
      (newPath) => {
        // dispatchPopstateEnv
        if (
          isActive.value &&
          pathname.value !== '' &&
          pathname.value !== newPath
        ) {
          LoggerInstance.debug(
            `createRemoteAppComponent dispatchPopstateEnv >>>`,
            {
              ...props,
              pathname: route.path,
            },
          );
          dispatchPopstateEnv();
        }
        pathname.value = newPath;
      },
    );

    onMounted(() => {
      isActive.value = true;
      void renderComponent();
    });

    watch(
      () => props.providerInfo,
      () => {
        providerGeneration += 1;
        destroyComponent();
        providerInfoRef.value = null;
        void renderComponent();
      },
      { flush: 'post' },
    );

    watch(
      () => [props.basename, props.memoryRoute, props.hashRoute],
      () => {
        if (isRendered.value) void renderComponent();
      },
      { deep: true, flush: 'post' },
    );

    onUpdated(() => {
      const nextComponentAttrs = { ...componentAttrs };
      const keys = Object.keys(nextComponentAttrs);
      const attrsChanged =
        keys.length !== Object.keys(lastComponentAttrs).length ||
        keys.some(
          (key) => !Object.is(nextComponentAttrs[key], lastComponentAttrs[key]),
        );
      if (!attrsChanged) return;
      lastComponentAttrs = nextComponentAttrs;
      if (isRendered.value) void renderComponent();
    });

    onActivated(async () => {
      isActive.value = true;
      if (!wasDeactivated.value) {
        return;
      }
      wasDeactivated.value = false;
      await nextTick();
      await renderComponent();
    });

    onDeactivated(() => {
      isActive.value = false;
      wasDeactivated.value = true;
      releaseUnclaimedSnapshot();
      if (consumedSnapshot) hydratedOnce = true;
      csrOnly = true;
      const dom = rootRef.value as HTMLElement | null;
      if (dom) clearBridgeSSRMountAttrs(dom);
      destroyComponent();
    });

    onBeforeUnmount(() => {
      controller.abort();
      watchStopHandle();
      releaseUnclaimedSnapshot();
      destroyComponent();
    });

    return () => {
      if (renderError.value) throw renderError.value;
      const mount = (
        <div
          {...(props.rootAttrs || {})}
          {...(hasSSRPayload && instanceId && !csrOnly
            ? getBridgeSSRContainerAttrs({
                moduleName: props.moduleName || ssrPayload!.moduleName,
                instanceId,
              })
            : {})}
          ref={rootRef}
          innerHTML={
            csrOnly ? undefined : (serverPayload?.html ?? snapshot?.html)
          }
        />
      );
      if (!hasSSRPayload || !instanceId || csrOnly) return mount;
      const moduleName = props.moduleName || ssrPayload!.moduleName;
      return (
        <div {...getBridgeSSRSlotAttrs({ moduleName, instanceId })}>
          {mount}
          <script
            type="application/json"
            data-mf-bridge-state="true"
            innerHTML={serializeBridgeSSRStateEnvelope({
              protocolVersion: BRIDGE_SSR_PROTOCOL_VERSION,
              moduleName,
              instanceId,
              ...((serverPayload?.dehydratedState ?? snapshot?.state) ===
              undefined
                ? {}
                : {
                    state: serverPayload?.dehydratedState ?? snapshot?.state,
                  }),
            })}
          />
        </div>
      );
    };
  },
});
