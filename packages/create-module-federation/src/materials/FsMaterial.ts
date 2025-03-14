import path from 'path';
import glob from 'glob';
import { FsResource } from './FsResource';

const promisifyGlob = (
  pattern: string,
  options: glob.IOptions,
): Promise<string[]> =>
  new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) =>
      err === null ? resolve(files) : reject(err),
    );
  });

export class FsMaterial {
  basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  get(resourceKey: string) {
    return new FsResource(
      path.resolve(this.basePath, resourceKey),
      resourceKey,
    );
  }

  async find(
    globStr: string,
    options?: {
      nodir?: boolean;
      dot?: boolean;
      ignore?: string | readonly string[];
    },
  ): Promise<Record<string, FsResource>> {
    const matches = await promisifyGlob(globStr, {
      cwd: path.resolve(this.basePath),
      nodir: options?.nodir,
      dot: options?.dot,
      ignore: options?.ignore,
    });
    return matches.reduce<Record<string, FsResource>>((pre, cur) => {
      pre[cur] = new FsResource(path.resolve(this.basePath, cur), cur);
      return pre;
    }, {});
  }
}
