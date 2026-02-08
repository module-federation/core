import type { DataFetchParams } from '@module-federation/modern-js-v3/react';
export type Data = {
  data: string;
};

export const fetchData = async (params: DataFetchParams): Promise<Data> => {
  if (!params.isDowngrade) {
    throw new Error('force downgrade!');
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: `[ provider - server - ServerDowngrade] ${new Date()}`,
      });
    }, 1000);
  });
};
