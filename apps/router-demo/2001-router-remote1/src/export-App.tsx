import React from 'react';
import App from './App';
import { createBridgeComponent } from '@module-federation/bridge-react';

export const provider = createBridgeComponent(App);

export default provider;
