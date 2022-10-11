export const isObjectEmpty = <T extends object>(obj: T) => {
  for (const x in obj) {
    return false;
  }
  return true;
};
