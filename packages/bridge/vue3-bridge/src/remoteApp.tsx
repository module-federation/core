import { ref, onMounted, onBeforeUnmount, watch, defineComponent } from 'vue';
import { dispatchPopstateEnv } from '@module-federation/bridge-shared';
import { useRoute } from 'vue-router';

import { LoggerInstance } from './utils';
import hook from './lifecycle';

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

    onMounted(async () => {
      renderComponent();
      await hook.lifecycle.afterBridgeRender.emit({});
    });

    onBeforeUnmount(async () => {
      await hook.lifecycle.beforeBridgeDestroy.emit({});
      LoggerInstance.log(`createRemoteComponent LazyComponent destroy >>>`, {
        ...props,
      });
      watchStopHandle();
      (providerInfoRef.value as any)?.destroy({ dom: rootRef.value });
      await hook.lifecycle.afterBridgeDestroy.emit({});
    });

    return () => <div ref={rootRef}></div>;
  },
});
