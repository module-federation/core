import { createSSRApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createBridgeHydrationRegistry } from '@module-federation/bridge-shared';
import { provideBridgeHydrationRegistry } from '@module-federation/bridge-vue3';
import App from './App.vue';
import { readHostSSRContext } from './ssrContext';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: App }],
});
const app = createSSRApp(App, { ssrContext: readHostSSRContext() });
app.use(router);
provideBridgeHydrationRegistry(app, createBridgeHydrationRegistry(document));
await router.isReady();
app.mount('#root');
