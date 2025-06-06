export type Data = {
  data: string;
};

export const fetchData = async (): Promise<Data> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: `[ csr provider - server ] fetched data: ${new Date()}`,
      });
    }, 1000);
  });
};
