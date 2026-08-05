import getStaticValue from 'rstestRemote/static-value';

export const readStaticRemote = (): string => getStaticValue();

export const readDynamicRemote = async (): Promise<string> => {
  const remote = await import('rstestRemote/dynamic-value');

  return remote.default();
};
