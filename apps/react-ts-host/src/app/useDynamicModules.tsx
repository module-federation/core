import {
  loadAndInitializeRemote,
  getModules,
} from '@module-federation/utilities';
import React from 'react';
import { useEffect, useState } from 'react';

// TODO - figure out types here, maybe an object input of modulePath + type instead of just path.
const useDynamicModules = <T,>(): Promise<T> => {
  return new Promise((resolve, reject) => {
    loadAndInitializeRemote({
      global: 'react_ts_remote',
      url: 'http://localhost:3004/remoteEntry.js',
    }).then((remoteContainer) => {
      getModules({
        remoteContainer,
        modulePaths: ['./Module'],
      }).then((modules) => {
        console.log(modules);
        resolve(modules as T);
      });
    });
  });
};

export default useDynamicModules;
