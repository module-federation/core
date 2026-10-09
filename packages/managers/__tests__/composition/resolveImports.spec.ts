/**
 * @jest-environment node
 */
import { resolveRuntimeFamily } from '../../src/composition/family';
import { planComposition } from '../../src/composition/plan';
import { resolveImports } from '../../src/composition/resolveImports';
import {
  composableFamily,
  dualExports,
  packageDir,
  tempDir,
  writePackage,
} from './fixtures';

const WBR = '@module-federation/webpack-bundler-runtime';
const CORE = '@module-federation/runtime-core';

describe('resolveImports', () => {
  it('resolves every bootstrap import to the ESM file of its family member', () => {
    const root = composableFamily(tempDir());
    const plan = planComposition(
      [{ kind: 'needs', needs: ['remotes', 'consumes'] }],
      'node',
    );

    const imports = resolveImports(plan, resolveRuntimeFamily(root));

    const wbr = packageDir(root, WBR);
    const core = packageDir(root, CORE);
    expect(imports).toEqual({
      [`${WBR}/compose`]: `${wbr}/dist/compose.js`,
      [`${WBR}/adapters/remotes`]: `${wbr}/dist/adapters/remotes.js`,
      [`${WBR}/adapters/consumes`]: `${wbr}/dist/adapters/consumes.js`,
      [`${WBR}/adapters/share-scope`]: `${wbr}/dist/adapters/share-scope.js`,
      [`${CORE}/shared`]: `${core}/dist/shared.js`,
      [`${CORE}/remote`]: `${core}/dist/remote.js`,
      [`${CORE}/snapshot`]: `${core}/dist/snapshot.js`,
      [`${CORE}/platform/node`]: `${core}/dist/platform/node.js`,
    });
  });

  it('imports nothing from runtime-core for a remote that only exposes', () => {
    const root = composableFamily(tempDir());
    const plan = planComposition(
      [
        {
          kind: 'options',
          disable: { remote: true, shared: true },
          needs: ['container'],
        },
      ],
      'web',
    );

    expect(
      Object.keys(resolveImports(plan, resolveRuntimeFamily(root))),
    ).toEqual([
      `${WBR}/compose`,
      `${WBR}/adapters/container`,
      `${WBR}/adapters/share-scope`,
    ]);
  });

  it('resolves capabilities from the runtime-core copy the family chose', () => {
    const root = composableFamily(tempDir());
    const nested = writePackage(
      packageDir(packageDir(root, '@module-federation/runtime'), CORE),
      CORE,
      dualExports([
        './kernel',
        './shared',
        './remote',
        './snapshot',
        './platform/web',
        './platform/node',
        './platform/universal',
      ]),
    );
    const plan = planComposition([], 'web');

    const imports = resolveImports(plan, resolveRuntimeFamily(root));

    expect(imports[`${CORE}/remote`]).toBe(`${nested}/dist/remote.js`);
    expect(imports[`${CORE}/platform/web`]).toBe(
      `${nested}/dist/platform/web.js`,
    );
  });
});
