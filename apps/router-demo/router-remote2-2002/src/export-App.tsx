import App from './App';
import { createBridgeComponent } from '@module-federation/bridge-react';

export const provider = createBridgeComponent({
  rootComponent: App,
});
