import path from 'path';
import finder from 'find-pkg';
import fs from 'fs';
import { MFModuleType } from '@module-federation/sdk';

export class PKGJsonManager {
  private _pkg?: Record<string, any>;
  pkgJsonPath?: string;

  setPKGJson(pkg: Record<string, any>): void {
    this._pkg = pkg;
  }

  readPKGJson(ctx = process.cwd()): Record<string, any> {
    if (this._pkg) {
      return this._pkg;
    }
    try {
      const pkgJsonPath = path.resolve(ctx, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      this._pkg = pkg;
      this.pkgJsonPath = pkgJsonPath;
      return pkg;
    } catch (_err) {
      try {
        const pkg = finder.sync(ctx);
        this._pkg = pkg;
        return pkg;
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
