import App from './App';
import { createBridgeComponent } from '@module-federation/bridge-react';

// Create the bridge component with React 19 createRoot support
const provider = createBridgeComponent({
  rootComponent: App,
});

export default provider;
