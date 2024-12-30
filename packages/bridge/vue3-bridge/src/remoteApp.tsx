import { ref, onMounted, onBeforeUnmount, watch, defineComponent } from 'vue';
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
    providerInfo: Function,
  },
  setup(props) {
    const rootRef = ref(null);
    const providerInfoRef = ref(null);
    const pathname = ref('');
    const route = useRoute();
    const hostInstance = getInstance();

    const renderComponent = () => {
      const providerReturn = props.providerInfo?.();
      providerInfoRef.value = providerReturn;

      let renderProps = {
        name: props.moduleName,
        dom: rootRef.value,
        basename: props.basename,
        memoryRoute: props.memoryRoute,
      };
      LoggerInstance.debug(
        `createRemoteComponent LazyComponent render >>>`,
        renderProps,
      );

      const beforeBridgeRenderRes =
        hostInstance?.bridgeHook?.lifecycle?.beforeBridgeRender?.emit(
          renderProps,
        ) || {};

      renderProps = { ...renderProps, ...beforeBridgeRenderRes.extraProps };
      providerReturn.render(renderProps);
      hostInstance?.bridgeHook?.lifecycle?.afterBridgeRender?.emit(renderProps);
    };

    const watchStopHandle = watch(
      () => route.path,
      (newPath) => {
        if (newPath !== route.path) {
          renderComponent();
        }

        // dispatchPopstateEnv
        if (pathname.value !== '' && pathname.value !== newPath) {
          LoggerInstance.debug(
            `createRemoteComponent dispatchPopstateEnv >>>`,
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
      renderComponent();
    });

    onBeforeUnmount(() => {
      LoggerInstance.debug(`createRemoteComponent LazyComponent destroy >>>`, {
        ...props,
      });
      watchStopHandle();

      hostInstance?.bridgeHook?.lifecycle?.beforeBridgeDestroy?.emit({
        name: props.moduleName,
        dom: rootRef.value,
        basename: props.basename,
        memoryRoute: props.memoryRoute,
      });

      (providerInfoRef.value as any)?.destroy({ dom: rootRef.value });
      hostInstance?.bridgeHook?.lifecycle?.afterBridgeDestroy?.emit({
        name: props.moduleName,
        dom: rootRef.value,
        basename: props.basename,
        memoryRoute: props.memoryRoute,
      });
    });

    return () => <div ref={rootRef}></div>;
  },
});
