import React from 'react';
import App from './App';
import { createBridgeComponent } from '@module-federation/bridge-react';

const provider = createBridgeComponent({
  rootComponent: App,
});

export default provider;
