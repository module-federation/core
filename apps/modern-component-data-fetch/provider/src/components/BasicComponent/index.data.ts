import { cache } from '@module-federation/modern-js/react';

export type Data = {
  data: string;
};

export const fetchData = cache(async (): Promise<Data> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: `[ provider - server ] fetched data: ${new Date()}`,
      });
    }, 1000);
  });
});
