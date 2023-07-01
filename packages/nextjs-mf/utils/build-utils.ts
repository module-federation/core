import path from 'path';

export const computeRemoteFilename = (isServer: boolean, filename: string) => {
  if (isServer && filename) {
    return path.basename(filename);
  }
  return filename;
};
