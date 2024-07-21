import fs from 'fs-extra';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { ThirdPartyExtractor } from './ThirdPartyExtractor';

describe('ThirdPartyExtractor', () => {
  const projectRoot = join(__dirname, '..', '..', '..');
  const destDir = join(projectRoot, 'dist', 'third-party-extractor');
  const thirdPartyExtractor = new ThirdPartyExtractor(destDir, projectRoot);

  it('should correctly infer pkg dir with types field in package.json', () => {
    const tsupDir = thirdPartyExtractor.inferPkgDir('tsup');
    const pkgJson = fs.readJSONSync(`${tsupDir}/package.json`);

    expect(pkgJson.name).toBe('tsup');
    expect(Boolean(pkgJson.types || pkgJson.typings)).toEqual(true);
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
});
