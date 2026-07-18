import { createApp } from 'vue';
import App from './RemoteVueApplication.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Detail from './pages/Detail.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/detail', component: Detail },
  ],
});

createApp(App).use(router).mount('#root');
