/** Check to see if WebPack is available. */
export const isWebpackAvailable = () => {
  return typeof __webpack_require__ !== 'undefined';
};

/** Not Available Yet: Check to see if RsPack is available. */
export const isRsPackAvailable = () => {
  return false;
};

/** Not Available Yet: Check to see if EsBuild is available. */
export const isEsBuildAvailable = () => {
  return false;
};

/** Not Available Yet: Check to see if Vite is available. */
export const isViteAvailable = () => {
  return false;
};

/** In our hooks, we want to ensure at least one compat bundler is available */
export const isBundlerAvailable = () => {
  return (
    isWebpackAvailable() ||
    isRsPackAvailable() ||
    isViteAvailable() ||
    isEsBuildAvailable()
  );
};
