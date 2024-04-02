import path from 'path';
import fs from 'fs';

export const isTSProject = (tsConfigPath?: string, context = process.cwd()) => {
  try {
    let filepath = tsConfigPath
      ? tsConfigPath
      : path.resolve(context, './tsconfig.json');
    if (!path.isAbsolute(filepath)) {
      filepath = path.resolve(context, filepath);
    }
    return fs.existsSync(filepath);
  } catch (err) {
    return false;
  }
};
