export type Data = {
  data: string;
};

export const fetchData = async (): Promise<Data> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: `[ provider - client ] fetched data: ${new Date()}`,
      });
    }, 1000);
  });
};
