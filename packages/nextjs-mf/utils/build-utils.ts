import path from 'path';

/**
 * Computes the remote filename based on the server status and the provided filename.
 * If the server is active and a filename is provided, it returns the basename of the filename.
 * Otherwise, it returns the provided filename.
 *
 * @param {boolean} isServer - Indicates if the server is active.
 * @param {string} filename - The filename to compute.
 * @returns {string} The computed filename.
 */
export const computeRemoteFilename = (isServer: boolean, filename: string) => {
  if (isServer && filename) {
    return path.basename(filename);
  }
  return filename;
};
