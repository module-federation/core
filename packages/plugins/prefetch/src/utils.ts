export const getScope = (id: string): string => {
  const idArray = id.split('/');
  if (idArray.length >= 3) {
    idArray.pop();
  }
  const name = idArray.join('/');
  return name;
};

export const nativeGlobal: typeof global = new Function('return this')();