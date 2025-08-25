import {withAsyncStartup} from '@module-federation/metro/bootstrap';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';

// create async boundry through withAsyncStartup helper
// and pass the getter function for the app component
// optionally a getter function for the fallback component
AppRegistry.registerComponent(
  appName,
  withAsyncStartup(
    () => require('./src/App'),
    () => require('./src/Fallback'),
  ),
);
