import { createSSRApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import { readHostSSRContext } from './ssrContext';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: App }],
});
const app = createSSRApp(App, { ssrContext: readHostSSRContext() });
app.use(router);
await router.isReady();
app.mount('#root');
