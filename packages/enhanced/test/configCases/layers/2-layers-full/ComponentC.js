import React, { layeredComponentsReact } from 'react';
import ComponentA from 'containerA/ComponentA';
import ComponentB from 'containerB/ComponentB';

export default () => {
  return `ComponentC rendered with [${React()}] ${layeredComponentsReact()} and [${ComponentA()}] and [${ComponentB()}]`;
};
