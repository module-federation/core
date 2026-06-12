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
import { dispatchPopstateEnv } from '@module-federation/bridge-shared';
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

    const renderComponent = async () => {
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

      const beforeBridgeRenderRes =
        (await hostInstance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
          renderProps,
        )) || {};

      renderProps = { ...renderProps, ...beforeBridgeRenderRes.extraProps };
      providerReturn.render(renderProps);
      isRendered.value = true;
      hostInstance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(renderProps);
    };

    const destroyComponent = () => {
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
      renderComponent();
    });

    onActivated(async () => {
      isActive.value = true;
      if (!wasDeactivated.value) {
        return;
      }
      wasDeactivated.value = false;
      await nextTick();
      renderComponent();
    });

    onDeactivated(() => {
      isActive.value = false;
      wasDeactivated.value = true;
      destroyComponent();
    });

    onBeforeUnmount(() => {
      watchStopHandle();
      destroyComponent();
    });

    return () => <div {...(props.rootAttrs || {})} ref={rootRef}></div>;
  },
});
