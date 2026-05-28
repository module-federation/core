import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  collectInstalledSharedPackageVersions,
  mergeShareRequestsMap,
} from '../../../../src/lib/sharing/tree-shaking/CollectSharedEntryPlugin';
import type { NormalizedSharedOptions } from '../../../../src/lib/sharing/SharePlugin';

const writePackageJson = (packageDir: string, version: string) => {
  fs.mkdirSync(packageDir, { recursive: true });
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify({ name: path.basename(packageDir), version }),
  );
};

describe('CollectSharedEntryPlugin tree-shaking helpers', () => {
  it('collects duplicate pnpm package versions for shared fallback generation', () => {
    const context = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mf-shared-versions-'),
    );
    try {
      writePackageJson(
        path.join(
          context,
          'node_modules',
          '.pnpm',
          'nanoid@3.3.11',
          'node_modules',
          'nanoid',
        ),
        '3.3.11',
      );
      writePackageJson(
        path.join(
          context,
          'node_modules',
          '.pnpm',
          'nanoid@5.1.6',
          'node_modules',
          'nanoid',
        ),
        '5.1.6',
      );

      const sharedOptions: NormalizedSharedOptions = [
        [
          'nanoid',
          { import: 'nanoid', treeShaking: { mode: 'runtime-infer' } },
        ],
      ];

      const collected = collectInstalledSharedPackageVersions(
        context,
        sharedOptions,
      );

      expect(collected.nanoid.requests).toEqual(
        expect.arrayContaining([
          [expect.stringContaining('nanoid@3.3.11'), '3.3.11'],
          [expect.stringContaining('nanoid@5.1.6'), '5.1.6'],
        ]),
      );
    } finally {
      fs.rmSync(context, { recursive: true, force: true });
    }
  });

  it('deduplicates merged shared requests by request and version', () => {
    const target = {
      nanoid: {
        requests: [['/node_modules/nanoid', '5.1.6'] as [string, string]],
      },
    };

    mergeShareRequestsMap(target, {
      nanoid: {
        requests: [
          ['/node_modules/nanoid', '5.1.6'],
          ['/node_modules/.pnpm/nanoid@3.3.11/node_modules/nanoid', '3.3.11'],
        ],
      },
    });

    expect(target.nanoid.requests).toEqual([
      ['/node_modules/nanoid', '5.1.6'],
      ['/node_modules/.pnpm/nanoid@3.3.11/node_modules/nanoid', '3.3.11'],
    ]);
  });
});
