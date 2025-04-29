import fs from 'fs-extra';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { ThirdPartyExtractor } from './ThirdPartyExtractor';

describe('ThirdPartyExtractor', () => {
  const projectRoot = join(__dirname, '..', '..', '..');
  const destDir = join(projectRoot, 'dist', 'third-party-extractor');
  const thirdPartyExtractor = new ThirdPartyExtractor({
    destDir,
    context: projectRoot,
    exclude: ['ignore-pkg', /ignore-pkg2-/, /ignore-pkg3/.toString()],
  });

  it("should correctly infer pkg's types dir with types/typings field in package.json", () => {
    const tsupDir = thirdPartyExtractor.inferPkgDir('tsup');

    if (!tsupDir) {
      throw new Error('tsup dir not found');
    }

    const dirContent = fs.readdirSync(tsupDir);
    const dtsFiles = dirContent.filter((file) => file.endsWith('.d.ts'));

    expect(dtsFiles.length).toBeGreaterThan(0);
  });

  it('should correctly infer pkg types dir without types field in package.json', () => {
    const typedReactDir = thirdPartyExtractor.inferPkgDir('react');
    const pkgJson = fs.readJSONSync(`${typedReactDir}/package.json`);

    expect(pkgJson.name).toBe('@types/react');
  });

  it('should correctly collect third party pkg types dir while passing dts file', () => {
    thirdPartyExtractor.pkgs = {};
    thirdPartyExtractor.collectPkgs(`
    export declare function NxWelcome({ title }: {
      title: string;
  }): import("react/jsx-runtime").JSX.Element;
  export default NxWelcome;
    `);
    thirdPartyExtractor.collectPkgs(`
    import { defineConfig } from 'tsup';
    export { defineConfig }
    `);

    const targetPkg = ['tsup', '@types/react'];
    expect(Object.keys(thirdPartyExtractor.pkgs).length).toEqual(
      targetPkg.length,
    );
    expect(
      Object.keys(thirdPartyExtractor.pkgs).every((pkg) =>
        targetPkg.includes(pkg),
      ),
    ).toEqual(true);
  });

  it('copyDts to dest dir', async () => {
    await thirdPartyExtractor.copyDts();
    expect(fs.existsSync(join(destDir, 'tsup'))).toEqual(true);
    expect(fs.existsSync(join(destDir, '@types/react'))).toEqual(true);
  });

  it('exclude pkg', async () => {
    const excludePkg = ['ignore-pkg', 'ignore-pkg2-subpath', 'ignore-pkg3'];
    excludePkg.forEach((pkg) => {
      thirdPartyExtractor.addPkgs(pkg, `${pkg}-dir`);
    });
    expect(
      Object.keys(thirdPartyExtractor.pkgs).some((p) => excludePkg.includes(p)),
    ).toEqual(false);
  });
});
