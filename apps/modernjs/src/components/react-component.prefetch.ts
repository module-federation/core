import { defer } from '@modern-js/runtime/router';
import React from 'react';

console.log(React);
const defaultVal = {
  data: {
    id: 1,
    title: 'A Prefetch Title',
  },
};

export default (params = defaultVal) =>
  defer({
    userInfo: new Promise(resolve => {
      setTimeout(() => {
        resolve(params);
      }, 2000);
    }),
  });
