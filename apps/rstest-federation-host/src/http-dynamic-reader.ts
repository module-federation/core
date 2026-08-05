export const readHttpDynamicRemote = async (): Promise<string> => {
  const remote = await import('rstestHttpRemote/dynamic-value');

  return remote.default();
};
