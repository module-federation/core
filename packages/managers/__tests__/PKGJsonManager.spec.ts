import { MFModuleType } from '@module-federation/sdk';
import { PKGJsonManager } from '../src/PKGJsonManager';

describe('PKGJsonManager', () => {
  it('return "app" type by default', () => {
    const pkgManager = new PKGJsonManager();
    expect(pkgManager.getExposeGarfishModuleType()).toEqual(MFModuleType.APP);
  });

  it('return "npm" type if pkg.mf.type===npm', () => {
    const pkgManager = new PKGJsonManager();
    pkgManager.setPKGJson({
      mf: {
        type: MFModuleType.NPM,
      },
    });
    expect(pkgManager.getExposeGarfishModuleType()).toEqual(MFModuleType.NPM);
  });
});
