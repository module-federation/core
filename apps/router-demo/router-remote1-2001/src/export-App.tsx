import React from 'react';
import { getInstance } from '@module-federation/enhanced/runtime';
import App from './App';

const hostInstance = getInstance();

// @ts-ignore
const provider = hostInstance.createBridgeComponent({
  rootComponent: App,
});

export default provider;
