import React from 'react';
import ComponentA from 'containerA/ComponentA';
import ComponentALayers from 'containerA/ComponentALayers';
// import ComponentB from 'containerB/ComponentB';
import ComponentC from './ComponentC';
import LocalComponentB from './ComponentB';
import LocalComponentALayers from './ComponentALayers';
const ComponentB = LocalComponentB;
export default () => {
  return `App rendered with [${React()}] and [${ComponentA()}] and [${ComponentALayers()}] and [${ComponentB()}] and [${ComponentC()}] and [${LocalComponentB()}] and [${LocalComponentALayers()}]`;
};

