import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from 'vue-router';
import Home from '@/pages/Home.vue';
import Detail from '@/pages/Detail.vue';
import Settings from '@/pages/Settings.vue';
import Profile from '@/pages/Profile.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 在这里定义你的路由
    {
      path: '/',
      component: Home,
      children: [
        {
          path: 'profile',
          component: Profile,
          children: [{ path: 'settings', component: Settings }],
        },
      ],
    },
    {
      path: '/detail',
      component: Detail,
    },
    // 其他路由
  ],
});
export default router;
