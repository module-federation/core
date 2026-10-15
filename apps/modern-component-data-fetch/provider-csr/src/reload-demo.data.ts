export type ReloadDemoData = {
  requestCount: number;
  fetchedAt: string;
};

let requestCount = 0;

export const fetchData = async (): Promise<ReloadDemoData> => {
  requestCount += 1;
  const data = {
    requestCount,
    fetchedAt: new Date().toISOString(),
  };
  return data;
};
