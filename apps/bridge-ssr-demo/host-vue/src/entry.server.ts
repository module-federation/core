import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from './App.vue';
import {
  prepareSSRContext,
  type PrepareSSRContextOptions,
} from './prepareSSRContext';

async function createHostApp(url: string, options: PrepareSSRContextOptions) {
  const ssrContext = await prepareSSRContext(url, options);
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: App }],
  });
  await router.push(url);
  await router.isReady();
  const app = createSSRApp(App, { ssrContext });
  app.use(router);
  return { app, ssrContext };
}

export async function render(
  url: string,
  options: PrepareSSRContextOptions = {},
) {
  const { app, ssrContext } = await createHostApp(url, options);
  return { html: await renderToString(app), ssrContext };
}
