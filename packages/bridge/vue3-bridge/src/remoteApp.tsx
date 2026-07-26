import {
  ref,
  onMounted,
  onBeforeUnmount,
  onActivated,
  onDeactivated,
  watch,
  defineComponent,
  useAttrs,
  nextTick,
} from 'vue';
import {
  dispatchPopstateEnv,
  emitBridgeLifecycle,
  type BridgeOperationContext,
} from '@module-federation/bridge-shared';
import { useRoute } from 'vue-router';
import { LoggerInstance } from './utils';
import { getInstance } from '@module-federation/runtime';

export default defineComponent({
  name: 'RemoteApp',
  props: {
    moduleName: String,
    basename: String,
    memoryRoute: Object,
    hashRoute: Boolean,
    providerInfo: Function,
    rootAttrs: Object,
  },
  inheritAttrs: false,
  setup(props) {
    const rootRef = ref(null);
    const providerInfoRef = ref(null);
    const pathname = ref('');
    const isRendered = ref(false);
    const hasEverRendered = ref(false);
    const isActive = ref(false);
    const wasDeactivated = ref(false);
    const route = useRoute();
    const hostInstance = getInstance();
    const componentAttrs = useAttrs();

    const getBridgeRenderProps = () => ({
      name: props.moduleName,
      dom: rootRef.value,
      basename: props.basename,
      memoryRoute: props.memoryRoute,
      hashRoute: props.hashRoute,
    });

    const renderComponent = async (
      reason: 'mount' | 'keep-alive-activate' = 'mount',
    ) => {
      if (!rootRef.value || isRendered.value) {
        return;
      }
      const providerReturn = props.providerInfo?.();
      providerInfoRef.value = providerReturn;

      let renderProps = {
        ...componentAttrs,
        moduleName: props.moduleName,
        dom: rootRef.value,
        basename: props.basename,
        memoryRoute: props.memoryRoute,
        hashRoute: props.hashRoute,
      };
      LoggerInstance.debug(
        `createRemoteAppComponent LazyComponent render >>>`,
        renderProps,
      );
      const operationContext: BridgeOperationContext = {
        side: 'consumer',
        framework: 'vue',
        operation: hasEverRendered.value ? 'update' : 'render',
        target: rootRef.value,
        moduleName: props.moduleName,
        reason,
      };

      let resultReported = false;
      try {
        const beforeBridgeRenderRes =
          (await hostInstance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
            renderProps,
            operationContext,
          )) || {};

        renderProps = { ...renderProps, ...beforeBridgeRenderRes.extraProps };
        const result = providerReturn.render(renderProps);
        isRendered.value = true;
        hasEverRendered.value = true;
        resultReported = true;
        hostInstance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(
          renderProps,
          {
            context: operationContext,
            result,
          },
        );
        await result;
      } catch (error) {
        if (!resultReported) {
          try {
            hostInstance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(
              renderProps,
              {
                context: operationContext,
                error,
              },
            );
          } catch {
            // Preserve the original Bridge render error.
          }
        }
        throw error;
      }
    };

    const destroyComponent = (
      reason: 'keep-alive-deactivate' | 'unmount' = 'unmount',
    ) => {
      const providerReturn = providerInfoRef.value as any;
      if (!providerReturn || !isRendered.value) {
        return;
      }
      LoggerInstance.debug(
        `createRemoteAppComponent LazyComponent destroy >>>`,
        {
          ...props,
        },
      );

      const bridgeRenderProps = getBridgeRenderProps();
      const operationContext: BridgeOperationContext = {
        side: 'consumer',
        framework: 'vue',
        operation: 'destroy',
        target: rootRef.value || undefined,
        moduleName: props.moduleName,
        reason,
      };
      try {
        hostInstance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit(
          bridgeRenderProps,
          operationContext,
        );

        const result = providerReturn.destroy({ dom: rootRef.value });
        providerInfoRef.value = null;
        isRendered.value = false;

        hostInstance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(
          bridgeRenderProps,
          {
            context: operationContext,
            result,
          },
        );
      } catch (error) {
        try {
          hostInstance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit(
            bridgeRenderProps,
            {
              context: operationContext,
              error,
            },
          );
        } catch {
          // Preserve the original Bridge destroy error.
        }
        throw error;
      }
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
          const routeInfo = {
            action: 'host-to-remote' as const,
            mechanism: 'popstate' as const,
            from: pathname.value,
            to: newPath,
            basename: props.basename,
          };
          const operationContext: BridgeOperationContext = {
            side: 'consumer',
            framework: 'vue',
            operation: 'route-sync',
            moduleName: props.moduleName,
            route: routeInfo,
          };
          try {
            const result = dispatchPopstateEnv();
            emitBridgeLifecycle(hostInstance, 'afterBridgeRouteSync', {
              context: operationContext,
              result,
            });
          } catch (error) {
            emitBridgeLifecycle(hostInstance, 'afterBridgeRouteSync', {
              context: operationContext,
              error,
            });
            throw error;
          }
        }
        pathname.value = newPath;
      },
    );

    onMounted(() => {
      isActive.value = true;
      void renderComponent('mount');
    });

    onActivated(async () => {
      isActive.value = true;
      if (!wasDeactivated.value) {
        return;
      }
      wasDeactivated.value = false;
      await nextTick();
      void renderComponent('keep-alive-activate');
    });

    onDeactivated(() => {
      isActive.value = false;
      wasDeactivated.value = true;
      destroyComponent('keep-alive-deactivate');
    });

    onBeforeUnmount(() => {
      watchStopHandle();
      destroyComponent('unmount');
    });

    return () => <div {...(props.rootAttrs || {})} ref={rootRef}></div>;
  },
});
