import { ref, onMounted, onBeforeUnmount, watch, defineComponent } from 'vue';
import { dispatchPopstateEnv } from '@module-federation/bridge-shared';
import { useRoute } from 'vue-router';

import hook from './lifecycle';
import { LoggerInstance } from './utils';

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
      hook.lifecycle.beforeBridgeRender.emit({
        ...renderProps,
      });
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
      LoggerInstance.log(`createRemoteComponent LazyComponent destroy >>>`, {
        ...props,
      });
      watchStopHandle();
      hook.lifecycle.beforeBridgeDestroy.emit({
        name: props.moduleName,
        dom: rootRef.value,
        basename: props.basename,
        memoryRoute: props.memoryRoute,
      });
      (providerInfoRef.value as any)?.destroy({ dom: rootRef.value });
    });

    return () => <div ref={rootRef}></div>;
  },
});
