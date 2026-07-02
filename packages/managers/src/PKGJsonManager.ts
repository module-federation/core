import path from 'path';
import { up as findPkgUp } from 'empathic/package';
import fs from 'fs';
import { MFModuleType, logger } from '@module-federation/sdk';

export class PKGJsonManager {
  private _pkg?: Record<string, any>;

  setPKGJson(pkg: Record<string, any>): void {
    this._pkg = pkg;
  }

  readPKGJson(root = process.cwd()): Record<string, any> {
    if (this._pkg) {
      return this._pkg;
    }
    try {
      // eslint-disable-next-line no-restricted-globals
      const pkg = JSON.parse(
        fs.readFileSync(path.resolve(root, 'package.json'), 'utf8'),
      );
      this._pkg = pkg;
      return pkg;
    } catch (_err) {
      try {
        const pkgPath = findPkgUp({ cwd: root });
        if (!pkgPath) {
          return {};
        }
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        this._pkg = pkg;
        return pkg;
      } catch (err) {
        logger.error(err);
        return {};
      }
    }
  }

  getExposeGarfishModuleType(root = process.cwd()): string {
    const pkg = this.readPKGJson(root);
    return pkg?.['mf']?.type === MFModuleType.NPM
      ? MFModuleType.NPM
      : MFModuleType.APP;
  }
}
