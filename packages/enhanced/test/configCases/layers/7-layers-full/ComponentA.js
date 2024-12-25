import * as React from 'react';

export default function ComponentA() {
  return `ComponentA rendered with React version: [${React.version}] with layer ${React.layeredComponentsReact()}`;
}
