import { ensureDirSync, writeFileSync, existsSync } from 'fs-extra';
import crypto from 'crypto';
import { stat, readdir, writeFile, rm, readFile } from 'fs/promises';
import {
  dirname,
  join,
  normalize,
  relative,
  resolve,
  sep,
  extname,
  isAbsolute,
} from 'path';
import {
  getShortErrorMsg,
  TYPE_001,
  typeDescMap,
} from '@module-federation/error-codes';
import { ThirdPartyExtractor } from '@module-federation/third-party-dts-extractor';
import { exec } from 'child_process';
import util from 'util';
import { TEMP_DIR } from '@module-federation/sdk';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import { TsConfigJson } from '../interfaces/TsConfigJson';

const STARTS_WITH_SLASH = /^\//;

const DEFINITION_FILE_EXTENSION = '.d.ts';

export const retrieveMfTypesPath = (
  tsConfig: TsConfigJson,
  remoteOptions: Required<RemoteOptions>,
) =>
  normalize(
    tsConfig.compilerOptions.outDir!.replace(
      remoteOptions.compiledTypesFolder,
      '',
    ),
  );

export const retrieveOriginalOutDir = (
  tsConfig: TsConfigJson,
  remoteOptions: Required<RemoteOptions>,
) =>
  normalize(
    tsConfig.compilerOptions
      .outDir!.replace(remoteOptions.compiledTypesFolder, '')
      .replace(remoteOptions.typesFolder, ''),
  );

export const retrieveMfAPITypesPath = (
  tsConfig: TsConfigJson,
  remoteOptions: Required<RemoteOptions>,
) =>
  join(
    retrieveOriginalOutDir(tsConfig, remoteOptions),
    `${remoteOptions.typesFolder}.d.ts`,
  );

function writeTempTsConfig(
  tsConfig: TsConfigJson,
  context: string,
  name: string,
) {
  const createHash = (contents: string) => {
    return crypto.createHash('md5').update(contents).digest('hex');
  };
  const hash = createHash(`${JSON.stringify(tsConfig)}${name}${Date.now()}`);
  const tempTsConfigJsonPath = resolve(
    context,
    'node_modules',
    TEMP_DIR,
    `tsconfig.${hash}.json`,
  );
  ensureDirSync(dirname(tempTsConfigJsonPath));
  writeFileSync(tempTsConfigJsonPath, JSON.stringify(tsConfig, null, 2));
  return tempTsConfigJsonPath;
}

const removeExt = (f: string): string => {
  const vueExt = '.vue';
  const ext = extname(f);
  if (ext === vueExt) {
    return f;
  }
  const regexPattern = new RegExp(`\\${ext}$`);
  return f.replace(regexPattern, '');
};

function getExposeKey(options: {
  filePath: string;
  rootDir: string;
  outDir: string;
  mapExposeToEntry: Record<string, string>;
}) {
  const { filePath, rootDir, outDir, mapExposeToEntry } = options;
  const relativeFilePath = relative(
    outDir,
    filePath.replace(new RegExp(`\\.d.ts$`), ''),
  );
  return mapExposeToEntry[relativeFilePath];
}

const processTypesFile = async (options: {
  outDir: string;
  filePath: string;
  rootDir: string;
  mfTypePath: string;
  cb: (dts: string) => void;
  mapExposeToEntry: Record<string, string>;
}) => {
  const { outDir, filePath, rootDir, cb, mapExposeToEntry, mfTypePath } =
    options;
  if (!existsSync(filePath)) {
    return;
  }
  const stats = await stat(filePath);

  if (stats.isDirectory()) {
    const files = await readdir(filePath);
    await Promise.all(
      files.map((file) =>
        processTypesFile({
          ...options,
          filePath: join(filePath, file),
        }),
      ),
    );
  } else if (filePath.endsWith('.d.ts')) {
    const exposeKey = getExposeKey({
      filePath,
      rootDir,
      outDir,
      mapExposeToEntry,
    });
    if (exposeKey) {
      const sourceEntry = exposeKey === '.' ? 'index' : exposeKey;
      const mfeTypeEntry = join(
        mfTypePath,
        `${sourceEntry}${DEFINITION_FILE_EXTENSION}`,
      );
      const mfeTypeEntryDirectory = dirname(mfeTypeEntry);
      const relativePathToOutput = relative(mfeTypeEntryDirectory, filePath)
        .replace(DEFINITION_FILE_EXTENSION, '')
        .replace(STARTS_WITH_SLASH, '')
        .split(sep) // Windows platform-specific file system path fix
        .join('/');
      ensureDirSync(mfeTypeEntryDirectory);
      await writeFile(
        mfeTypeEntry,
        `export * from './${relativePathToOutput}';\nexport { default } from './${relativePathToOutput}';`,
      );
    }
    const content = await readFile(filePath, 'utf8');
    cb(content);
  }
};

export const compileTs = async (
  mapComponentsToExpose: Record<string, string>,
  tsConfig: TsConfigJson,
  remoteOptions: Required<RemoteOptions>,
) => {
  if (!Object.keys(mapComponentsToExpose).length) {
    return;
  }
  const { compilerOptions } = tsConfig;
  const tempTsConfigJsonPath = writeTempTsConfig(
    tsConfig,
    remoteOptions.context,
    remoteOptions.moduleFederationConfig.name || 'mf',
  );
  try {
    const mfTypePath = retrieveMfTypesPath(tsConfig, remoteOptions);
    const thirdPartyExtractor = new ThirdPartyExtractor(
      resolve(mfTypePath, 'node_modules'),
      remoteOptions.context,
    );
    const execPromise = util.promisify(exec);
    const cmd = `npx ${remoteOptions.compilerInstance} --project ${tempTsConfigJsonPath}`;
    try {
      await execPromise(cmd, {
        cwd:
          typeof remoteOptions.moduleFederationConfig.dts !== 'boolean'
            ? (remoteOptions.moduleFederationConfig.dts?.cwd ?? undefined)
            : undefined,
      });
    } catch (err) {
      throw new Error(
        getShortErrorMsg(TYPE_001, typeDescMap, {
          cmd,
        }),
      );
    }

    const mapExposeToEntry = Object.fromEntries(
      Object.entries(mapComponentsToExpose).map(([exposed, filename]) => {
        const normalizedFileName = normalize(filename);
        let relativeFileName = '';
        if (isAbsolute(normalizedFileName)) {
          relativeFileName = relative(
            tsConfig.compilerOptions.rootDir,
            normalizedFileName,
          );
        } else {
          relativeFileName = relative(
            tsConfig.compilerOptions.rootDir,
            resolve(remoteOptions.context, normalizedFileName),
          );
        }
        return [removeExt(relativeFileName), exposed];
      }),
    );

    const cb = remoteOptions.extractThirdParty
      ? thirdPartyExtractor.collectPkgs.bind(thirdPartyExtractor)
      : () => undefined;

    await processTypesFile({
      outDir: compilerOptions.outDir,
      filePath: compilerOptions.outDir,
      rootDir: compilerOptions.rootDir,
      mfTypePath,
      cb,
      mapExposeToEntry,
    });

    if (remoteOptions.extractThirdParty) {
      await thirdPartyExtractor.copyDts();
    }

    await rm(tempTsConfigJsonPath);
  } catch (err) {
    throw err;
  }
};
