import dirTree from 'directory-tree';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { generateTypes, type RemoteOptions } from '../../src/core';

const TEST_DIT_DIR = 'dist-test';

describe('DTSManager', () => {
  const typesFolder = '@mf-types-dts-vue-test';
  const remoteOptions: RemoteOptions = {
    moduleFederationConfig: {
      name: 'vueTsc2',
      filename: 'remoteEntry.js',
      exposes: {
        './index': join(__dirname, './Button.vue'),
      },
    },
    compilerInstance: 'vue-tsc',
    tsConfigPath: join(__dirname, 'tsconfig.vue.json'),
    typesFolder: typesFolder,
    compiledTypesFolder: 'compiled-types',
    deleteTypesFolder: false,
    additionalFilesToCompile: [],
    context: __dirname,
  };

  it('generate types', async () => {
    const distFolder = join(
      remoteOptions.context!,
      TEST_DIT_DIR,
      remoteOptions.typesFolder!,
    );
    await generateTypes({ remote: remoteOptions });

    expect(
      dirTree(distFolder, {
        exclude: [
          /node_modules/,
          /dev-worker/,
          /plugins/,
          /server/,
          /tsconfig/,
        ],
      }),
    ).toMatchObject({
      children: [
        {
          children: [
            {
              name: 'Button.vue.d.ts',
            },
          ],
          name: 'compiled-types',
        },
        {
          name: 'index.d.ts',
        },
      ],
      name: '@mf-types-dts-vue-test',
    });
  });
});
