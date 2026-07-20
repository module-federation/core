import App from './RemoteVueApplication.vue';
import { createBridgeComponent } from '@module-federation/bridge-vue3';
import { createMemoryHistory, createRouter } from 'vue-router';
import Home from './pages/Home.vue';
import Detail from './pages/Detail.vue';

export default createBridgeComponent({
  rootComponent: App,
  appOptions: () => ({
    router: createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: Home },
        { path: '/detail', component: Detail },
      ],
    }),
  }),
  ssr: {
    prepare(context) {
      const props = context.props as { test?: string; basename?: string };
      return {
        props: {
          ...(typeof props.test === 'string' ? { test: props.test } : {}),
          ...(typeof props.basename === 'string'
            ? { basename: props.basename }
            : {}),
        },
        dehydratedState: { test: props.test ?? null },
      };
    },
  },
});
