import App from './RemoteVueApplication.vue';
import { createBridgeComponent } from '@module-federation/bridge-vue3';
import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Detail from './pages/Detail.vue';

export default createBridgeComponent({
  rootComponent: App,
  appOptions: () => ({
    router: createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: Home },
        { path: '/detail', component: Detail },
      ],
    }),
  }),
  ssr: {
    hydrate(state) {
      if (!state || Array.isArray(state) || typeof state !== 'object')
        return {};
      const test = (state as Record<string, unknown>).test;
      return typeof test === 'string' ? { test } : {};
    },
  },
});
