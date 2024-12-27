import React from 'react';
import ComponentA from 'containerA/ComponentA';
// import ComponentB from 'containerB/ComponentB';
const ComponentB = ComponentA
export default () => {
  return `ComponentC rendered with [${React()}] and [${ComponentA()}] and [${ComponentB()}]`;
};
