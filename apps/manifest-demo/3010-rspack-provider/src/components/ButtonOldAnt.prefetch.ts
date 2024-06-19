import { defer } from 'react-router-dom';

const defaultVal = {
  data: {
    id: 1,
    title: 'A Prefetch Title',
  },
};

export default (params = defaultVal) =>
  defer({
    userInfo: new Promise((resolve) => {
      setTimeout(() => {
        resolve(params);
      }, 2000);
    }),
  });
