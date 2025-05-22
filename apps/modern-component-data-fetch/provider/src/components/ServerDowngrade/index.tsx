import React from 'react';
import Basic from '../BasicComponent';
import type { Data } from './index.data';

console.log('server-downgrade');
const Content = (props: { mfData?: Data }): JSX.Element => {
  return (
    <Basic
      {...props}
      providerName="server-downgrade"
      backgroundColor="#ff0eef"
    />
  );
};

export default Content;
