export type Data = {
  data: string;
};

export const fetchData = async (): Promise<Data> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: 'fetch data from provider',
      });
    }, 1000);
  });
};
