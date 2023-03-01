import os from 'os';
import path from 'path';

export const correctImportPath = (context: string, entryFile: string) => {
  if (os.platform() !== 'win32') {
    return entryFile;
  }

  if (entryFile.match(/^\.?\.\\/) || !entryFile.match(/^[A-Z]:\\\\/i)) {
    return entryFile.replace(/\\/g, '/');
  }

  const joint = path.win32.relative(context, entryFile);
  const relative = joint.replace(/\\/g, '/');

  if (relative.includes('node_modules/')) {
    return relative.split('node_modules/')[1];
  }

  return `./${relative}`;
};
