import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import router from './router';
import { createBridgeComponent } from '@module-federation/bridge-vue3';

export default createBridgeComponent({
  rootComponent: App,
  appOptions: () => ({
    router,
  }),
});
