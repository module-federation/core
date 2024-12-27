import * as React from 'react';

console.log('React import in ComponentALayers:', React);

export default () => {
  debugger;
  console.log('Calling layeredComponentsReact:', React.layeredComponentsReact);
  const result = `ComponentALayers rendered with [${React.layeredComponentsReact()}]`;
  console.log('ComponentALayers result:', result);
  return result;
};
