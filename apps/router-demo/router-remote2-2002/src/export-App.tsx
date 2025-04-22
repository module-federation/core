import App from './App';
import { createBridgeComponent } from '@module-federation/bridge-react/v18';

// @ts-ignore
export const provider = createBridgeComponent({
  rootComponent: App,
  defaultRootOptions: {
    identifierPrefix: 'remote2-app-',
    onRecoverableError: (error: unknown) => {
      console.log('[Remote2] React 18 recoverable rendering error:', error);
      // You can add custom error reporting or analytics here
    },
  },
});

// Note: In the host application, you can pass instance-specific options:
/*
<Remote2App 
  props={{ someData: 'value' }} 
  rootOptions={{
    identifierPrefix: 'remote2-instance-',
    onRecoverableError: (error: Error) => {
      console.error('[Host] Remote2 specific error:', error);
    }
  }}
/>
*/
