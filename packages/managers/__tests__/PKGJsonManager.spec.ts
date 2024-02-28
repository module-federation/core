import { ModuleType } from '@module-federation/sdk';
import { PKGJsonManager } from '../src/PKGJsonManager';

describe('PKGJsonManager', () => {
  it('return "app" type by default', () => {
    const pkgManager = new PKGJsonManager();
    expect(pkgManager.getExposeGarfishModuleType()).toEqual(ModuleType.APP);
  });

  it('return "npm" type if pkg.mf.type===npm', () => {
    const pkgManager = new PKGJsonManager();
    pkgManager.setPKGJson({
      mf: {
        type: ModuleType.NPM,
      },
    });
    expect(pkgManager.getExposeGarfishModuleType()).toEqual(ModuleType.NPM);
  });
});
