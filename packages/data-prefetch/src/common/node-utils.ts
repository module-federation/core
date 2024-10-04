import path from 'path';
import fs from 'fs-extra';

export const fileExistsWithCaseSync = (filepath: string): boolean => {
  const dir = path.dirname(filepath);
  if (filepath === '/' || filepath === '.') {
    return true;
  }
  const filenames = fs.readdirSync(dir);
  if (filenames.indexOf(path.basename(filepath)) === -1) {
    return false;
  }
  return fileExistsWithCaseSync(dir);
};

export const fixPrefetchPath = (exposePath: string): Array<string> => {
  const pathExt = ['.js', '.ts'];
  const extReg = /\.(ts|js|tsx|jsx)$/;
  if (extReg.test(exposePath)) {
    return pathExt.map((ext) => exposePath.replace(extReg, `.prefetch${ext}`));
  } else {
    return pathExt.map((ext) => exposePath + `.prefetch${ext}`);
  }
};
