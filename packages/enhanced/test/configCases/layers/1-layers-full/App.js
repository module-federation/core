import React, { layeredComponentsReact } from 'react';
import ComponentA from 'containerA/ComponentA';
import ComponentALayers from 'containerA/ComponentALayers';

export default () => {
  return `App rendered with [${React()}] ${layeredComponentsReact()}, [${ComponentA()}] and [${ComponentALayers()}]`;
};
