import React from 'react';
import ComponentB from 'containerB/ComponentB';

export default () => {
  return `ComponentC rendered with [${React()}] and [${ComponentB()}]`;
};
