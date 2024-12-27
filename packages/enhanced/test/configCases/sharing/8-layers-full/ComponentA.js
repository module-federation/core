import React, { layeredComponentsReact } from 'react';

export default function ComponentA() {
  return `LocalComponentA  ${React()}, layered with ${layeredComponentsReact()}`;
}
