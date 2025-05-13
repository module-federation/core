export type Data = {
  data: string;
};

export const fetchData = async (): Promise<Data> => {
  console.log('Content.data.client');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: `fetch data from provider ${new Date()}`,
      });
    }, 1000);
  });
};
