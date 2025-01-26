import App from './App.vue';
import router from './router';
import { createBridgeComponent } from '@module-federation/bridge-vue3';
import './index.css';

export default createBridgeComponent({
  rootComponent: App,
  appOptions: ({ app }) => {
    // Optional: adding a plugin to the new Vue instance on the host application side
    // app.use(customPlugin);
    return { router };
  },
});
