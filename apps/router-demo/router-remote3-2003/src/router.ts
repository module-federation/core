import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from 'vue-router';
import Home from '@/pages/Home.vue';
import Detail from '@/pages/Detail.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 在这里定义你的路由
    { path: '/', component: Home },
    { path: '/detail', component: Detail },
    // 其他路由
  ],
});
export default router;
