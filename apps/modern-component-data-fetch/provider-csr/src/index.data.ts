import { cache } from '@module-federation/bridge-react';
export type Data = {
  data: string;
};

export const fetchData = cache(async (): Promise<Data> => {
  console.log(`[ csr provider - server ] fetch data: ${new Date()}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: `[ csr provider - server ] fetched data: ${new Date()}`,
      });
    }, 1000);
  });
});
