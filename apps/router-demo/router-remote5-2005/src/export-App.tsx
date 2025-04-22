import App from './App';
import { createBridgeComponent } from '@module-federation/bridge-react/v19';

const provider = createBridgeComponent({
  rootComponent: App,
  defaultRootOptions: {
    identifierPrefix: 'remote5-app-',
    onRecoverableError: (error: unknown) => {
      console.log('[Remote5] React 19 recoverable rendering error:', error);
      // You can add custom error reporting or analytics here
    },
  },
});

export default provider;

// Note: Example 2 would be in the consumer application (router-host-2000)
// when rendering this remote component:
/*
<RemoteApp 
  props={{ message: 'Hello' }} 
  rootOptions={{
    identifierPrefix: 'instance-specific-',
    onRecoverableError: (error: Error) => {
      console.error('Recoverable error for this specific instance:', error);
    }
  }}
/>
*/
