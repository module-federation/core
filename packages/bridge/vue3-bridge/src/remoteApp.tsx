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

    const renderComponent = () => {
      const host = getInstance();
      const providerReturn = props.providerInfo?.();
      providerInfoRef.value = providerReturn;
      const renderProps = {
        name: props.moduleName,
        dom: rootRef.value,
        basename: props.basename,
        memoryRoute: props.memoryRoute,
      };
      LoggerInstance.log(
        `createRemoteComponent LazyComponent render >>>`,
        renderProps,
      );

      if (host?.bridgeHook && host?.bridgeHook?.lifecycle?.beforeBridgeRender) {
        host?.bridgeHook?.lifecycle?.beforeBridgeRender.emit({
          ...renderProps,
        });
      }
      providerReturn.render(renderProps);
    };

    const watchStopHandle = watch(
      () => route.path,
      (newPath) => {
        if (newPath !== route.path) {
          renderComponent();
        }

        // dispatchPopstateEnv
        if (pathname.value !== '' && pathname.value !== newPath) {
          LoggerInstance.log(`createRemoteComponent dispatchPopstateEnv >>>`, {
            ...props,
            pathname: route.path,
          });
          dispatchPopstateEnv();
        }
        pathname.value = newPath;
      },
    );

    onMounted(() => {
      renderComponent();
    });

    onBeforeUnmount(() => {
      const host = getInstance();
      LoggerInstance.log(`createRemoteComponent LazyComponent destroy >>>`, {
        ...props,
      });
      watchStopHandle();

      (providerInfoRef.value as any)?.destroy({ dom: rootRef.value });
      if (host?.bridgeHook && host?.bridgeHook?.lifecycle?.afterBridgeDestroy) {
        host?.bridgeHook?.lifecycle?.afterBridgeDestroy.emit({
          name: props.moduleName,
          dom: rootRef.value,
          basename: props.basename,
          memoryRoute: props.memoryRoute,
        });
      }
    });

    return () => <div ref={rootRef}></div>;
  },
});
