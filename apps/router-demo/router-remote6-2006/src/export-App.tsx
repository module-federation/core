import App from './App';
import { createBridgeComponent } from '@module-federation/bridge-react/v18';

// @ts-ignore
export const provider = createBridgeComponent({
  rootComponent: App,
  defaultRootOptions: {
    identifierPrefix: 'remote6-app-',
    onRecoverableError: (error: unknown) => {
      console.log(
        '[Remote6] React 18 recoverable rendering error with React Router v7:',
        error,
      );
      // You can add custom error reporting or analytics here
    },
  },
});

export default provider;

// Note: In the host application, you can pass instance-specific options:
/*
<Remote6App 
  props={{ someData: 'value' }} 
  rootOptions={{
    identifierPrefix: 'remote6-instance-',
    onRecoverableError: (error: Error) => {
      console.error('[Host] Remote6 specific error:', error);
    }
  }}
/>
*/
