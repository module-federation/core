export const fetchData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: 'fetch data from provider',
      });
    }, 1000);
  });
};
