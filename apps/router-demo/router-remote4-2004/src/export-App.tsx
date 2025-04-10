import App from './App';
import { createBridgeComponent } from '@module-federation/bridge-react/v18';

const provider = createBridgeComponent({
  rootComponent: App,
});

export default provider;
