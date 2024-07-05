import path from 'path';
import finder from 'find-pkg';
import fs from 'fs';
import { MFModuleType } from '@module-federation/sdk';

export class PKGJsonManager {
  private _pkg?: Record<string, any>;

  setPKGJson(pkg: Record<string, any>): void {
    this._pkg = pkg;
  }

  readPKGJson(ctx = process.cwd()): Record<string, any> {
    if (this._pkg) {
      return this._pkg;
    }
    try {
      // eslint-disable-next-line no-restricted-globals
      const pkg = JSON.parse(
        fs.readFileSync(path.resolve(ctx, 'package.json'), 'utf8'),
      );
      this._pkg = pkg;
      return pkg;
    } catch (_err) {
      try {
        const pkgPath = finder.sync(ctx);

        const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        this._pkg = pkgJson;
        return pkgJson;
      } catch (err) {
        console.error(err);
        return {};
      }
    }
  }

  getExposeGarfishModuleType(ctx = process.cwd()): string {
    const pkg = this.readPKGJson(ctx);
    return pkg?.['mf']?.type === MFModuleType.NPM
      ? MFModuleType.NPM
      : MFModuleType.APP;
  }
}
