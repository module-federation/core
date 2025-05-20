import React from 'react';
import Basic from '../BasicComponent';
import type { Data } from './index.data';

console.log('ServerDowngrade');
const Content = (props: { mfData?: Data }): JSX.Element => {
  return (
    <Basic
      {...props}
      providerName="ServerDowngrade"
      backgroundColor="#ff0eef"
    />
  );
};

export default Content;
