import crypto from 'crypto';
import type { NormalizeOptions } from './normalizeOptions';

export const generateTypesStats = (
  filesMap: Record<string, string>,
  normalizeOptions: NormalizeOptions
) => {
  return Object.entries(filesMap).reduce((acc, [path, contents]) => {
    const filename = path.slice(`${normalizeOptions.distDir}/`.length);

    return {
      ...acc,
      [filename]: crypto.createHash('md5').update(contents).digest('hex'),
    };
  }, {} as Record<string, string>);
};
