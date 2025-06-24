export type Data = {
  data: string;
};

export const fetchData = async (): Promise<Data> => {
  throw new Error('force downgrade!');

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: `fetch data from provider \n${new Date()}`,
      });
    }, 1000);
  });
};
