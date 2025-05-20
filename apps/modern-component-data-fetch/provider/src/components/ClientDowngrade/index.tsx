import React from 'react';
import Basic from '../BasicComponent';
import type { Data } from './index.data';

const Content = (props: { mfData?: Data }): JSX.Element => {
  return (
    <Basic
      {...props}
      providerName="ServerDowngrade"
      backgroundColor="#0effdb"
    />
  );
};

export default Content;
