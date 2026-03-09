import { cache } from '@module-federation/modern-js-v3/react';

export type Data = {
  data: string;
};

export const fetchData = cache(async (): Promise<Data> => {
  console.log('provder-server called');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: `[ provider - server ] fetched data: ${new Date()}`,
      });
    }, 1000);
  });
});
