import findPkg from 'find-pkg';
import fs from 'fs-extra';
import path from 'path';
import resolve from 'resolve';
import { getTypedName } from './utils';

class ThirdPartyExtractor {
  pkgs: Record<string, string>;
  pattern: RegExp;
  context: string;
  destDir: string;

  constructor(destDir: string, context = process.cwd()) {
    this.destDir = destDir;
    this.context = context;
    this.pkgs = {};
    this.pattern = /(from|import\()\s*['"]([^'"]+)['"]/g;
  }

  collectPkgs(str: string) {
    const { pattern } = this;
    let match;
    const imports: Set<string> = new Set();

    while ((match = pattern.exec(str)) !== null) {
      imports.add(match[2]);
    }

    [...imports].forEach((importPath) => {
      if (this.pkgs[importPath]) {
        return;
      }
      if (path.isAbsolute(importPath)) {
        return;
      }
      if (importPath.startsWith('.')) {
        return;
      }

      try {
        const pkgJsonPath = findPkg.sync(
          require.resolve(importPath, { paths: [this.context] }),
        ) as string;
        const dir = path.dirname(pkgJsonPath);
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8')) as Record<
          string,
          any
        >;
        const types = pkg.types || pkg.typings;
        if (dir === this.context) {
          return;
        }

        if (types) {
          this.pkgs[pkg.name] = dir;
        } else if (fs.existsSync(path.resolve(dir, 'index.d.ts'))) {
          this.pkgs[pkg.name] = dir;
        } else {
          const typedPkgName = getTypedName(pkg.name);
          const typedPkgJsonPath = findPkg.sync(
            resolve.sync(`${typedPkgName}/package.json`, {
              basedir: this.context,
            }),
          ) as string;
          const typedDir = path.dirname(typedPkgJsonPath);
          fs.readFileSync(typedPkgJsonPath, 'utf-8');
          this.pkgs[typedPkgName] = typedDir;
        }
      } catch (_err) {
        return;
      }
    });
  }

  copyDts() {
    if (!Object.keys(this.pkgs).length) {
      return;
    }
    fs.ensureDirSync(this.destDir);
    const copyFiles = (srcDir: string, destDir: string) => {
      if (srcDir.startsWith('.')) {
        return;
      }
      fs.readdirSync(srcDir).forEach((file) => {
        const fullPath = path.join(srcDir, file);
        // exclude node_modules
        if (['node_modules', 'bin'].includes(file)) {
          return;
        }

        if (fs.lstatSync(fullPath).isDirectory()) {
          // create target dir
          const destFullPath = path.join(destDir, file);
          try {
            if (!fs.existsSync(destFullPath)) {
              fs.mkdirSync(destFullPath);
            }
          } catch (_err) {
            // noop
          }
          //copy child dir
          copyFiles(fullPath, destFullPath);
        } else {
          // only copy .d.ts
          if (fullPath.endsWith('.d.ts') || fullPath.endsWith('package.json')) {
            fs.copyFileSync(fullPath, path.join(destDir, file));
          }
        }
      });
    };
    Object.keys(this.pkgs).forEach((pkgName) => {
      const pkgDir = this.pkgs[pkgName];
      const destDir = path.resolve(this.destDir, pkgName);
      fs.ensureDirSync(destDir);
      copyFiles(pkgDir, destDir);
    });
  }
}

export { ThirdPartyExtractor };
