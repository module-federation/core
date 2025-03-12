import React from 'react';
import Button from './button';
import { createBridgeComponent } from '@module-federation/bridge-react';

const provider = createBridgeComponent({
  rootComponent: Button,
});

export default provider;
