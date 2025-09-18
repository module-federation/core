import { withAsyncStartup } from '@module-federation/metro/bootstrap';
import { registerRootComponent } from 'expo';

// create async boundry through withAsyncStartup helper
// and pass the getter function for the app component
// optionally a getter function for the fallback component
registerRootComponent(
  withAsyncStartup(
    () => require('./src/App'),
    () => require('./src/Fallback')
  )()
);
