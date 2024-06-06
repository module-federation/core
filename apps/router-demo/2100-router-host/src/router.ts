import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from 'vue-router';
import Home from '@/pages/Home.vue';
import Detail from '@/pages/Detail.vue';
import { loadRemote, init } from '@module-federation/enhanced/runtime';
import * as aaa from '@module-federation/bridge-vue3';

(loadRemote as any).test = true;

const Remote2 = aaa.createRemoteComponent(() =>
  loadRemote('remote1/export-app'),
);

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 在这里定义你的路由
    { path: '/', component: Home },
    { path: '/remote1/:pathMatch(.*)*', component: Remote2 },
    // 其他路由
  ],
});
export default router;
