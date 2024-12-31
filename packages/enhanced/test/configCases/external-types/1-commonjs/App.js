import React from 'react';
import ComponentB from 'cjscontainerB/ComponentB';
import LocalComponentB from './ComponentB';

export default () => {
  return `App rendered with [${React()}] and [${ComponentB()}]`;
};
