import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, realpathSync, rmSync, writeFileSync } from 'fs';
import {
  dirname,
  join,
  resolve,
  extname,
  isAbsolute,
  normalize,
  relative,
  sep,
} from 'path';
import { utils } from '@module-federation/managers';
import { TEMP_DIR } from '@module-federation/sdk';

import { RemoteOptions } from '../interfaces/RemoteOptions';
import { validateOptions } from '../lib/utils';
import {
  TsConfigCompilerOptions,
  TsConfigJson,
} from '../interfaces/TsConfigJson';
import {
  getTypeScriptPackageInfo,
  requireTypeScript,
} from '../lib/typeScriptResolver';
import { logger } from '../../server';

interface ProjectReference {
  path: string;
  originalPath?: string;
}

interface ParsedConfigContent {
  options: TsConfigCompilerOptions;
  fileNames: string[];
  projectReferences: ProjectReference[];
}

interface LegacyTypeScriptApi {
  sys: {
    readFile: (path: string) => string | undefined;
  };
  readConfigFile: (
    fileName: string,
    readFile: (path: string) => string | undefined,
  ) => {
    config?: TsConfigJson;
    error?: {
      messageText: string | { toString(): string };
    };
  };
  parseJsonConfigFileContent: (
    json: TsConfigJson,
    host: LegacyTypeScriptApi['sys'],
    basePath: string,
  ) => ParsedConfigContent;
  createProgram: (
    rootNames: string[],
    options: TsConfigCompilerOptions,
  ) => {
    getSourceFiles: () => Array<{ fileName: string }>;
  };
}

const defaultOptions = {
  tsConfigPath: './tsconfig.json',
  typesFolder: '@mf-types',
  compiledTypesFolder: 'compiled-types',
  hostRemoteTypesFolder: '@mf-types',
  deleteTypesFolder: true,
  additionalFilesToCompile: [],
  compilerInstance: 'tsc' as const,
  compileInChildProcess: false,
  implementation: '',
  generateAPITypes: false,
  context: process.cwd(),
  abortOnError: true,
  extractRemoteTypes: false,
  extractThirdParty: false,
  outputDir: '',
  deleteTsConfig: true,
} satisfies Partial<RemoteOptions>;

function getEffectiveRootDir(parsedCommandLine: ParsedConfigContent): string {
  const compilerOptions = parsedCommandLine.options;

  if (compilerOptions.rootDir) {
    return compilerOptions.rootDir;
  }

  // if no set rootDir , infer the commonRoot
  const files = parsedCommandLine.fileNames;
  if (files.length > 0) {
    const commonRoot = files
      .map((file) => dirname(file))
      .reduce((commonPath, fileDir) => {
        while (!fileDir.startsWith(commonPath)) {
          commonPath = dirname(commonPath);
        }
        return commonPath;
      }, files[0]);
    return commonRoot;
  }

  // if there are project references, infer the commonRoot from references
  if (parsedCommandLine.projectReferences.length) {
    const relativeReferences = parsedCommandLine.projectReferences.filter(
      (reference) => !isAbsolute(reference.originalPath ?? reference.path),
    );
    const referencesForRoot = relativeReferences.length
      ? relativeReferences
      : parsedCommandLine.projectReferences;

    const commonRoot = referencesForRoot
      .map((reference) => dirname(reference.path))
      .reduce((commonPath, filePath) => {
        while (!filePath.startsWith(commonPath)) {
          commonPath = dirname(commonPath);
        }
        return commonPath;
      }, dirname(referencesForRoot[0].path));
    return commonRoot;
  }

  throw new Error(
    'Can not get effective rootDir, please set compilerOptions.rootDir !',
  );
}

const getDependentFiles = (
  rootFiles: string[],
  configContent: ParsedConfigContent,
  rootDir: string,
  typescript: LegacyTypeScriptApi,
): string[] => {
  const program = typescript.createProgram(rootFiles, configContent.options);
  const sourceFiles = program.getSourceFiles();
  const dependentFiles = sourceFiles
    .map((file) => file.fileName)
    .filter(
      (file) => !file.endsWith('.d.ts') && isFileWithinRootDir(file, rootDir),
    )
    .map((file) => normalizeFileToRootDir(file, rootDir));
  return dependentFiles.length ? dependentFiles : rootFiles;
};

const normalizeForComparison = (value: string) => {
  try {
    return normalize(realpathSync.native(value));
  } catch {
    return normalize(value);
  }
};

const isFileWithinRootDir = (file: string, rootDir: string) => {
  const normalizedFile = normalizeForComparison(file);
  const normalizedRootDir = normalizeForComparison(rootDir);
  return (
    normalizedFile === normalizedRootDir ||
    normalizedFile.startsWith(
      normalizedRootDir.endsWith(sep)
        ? normalizedRootDir
        : `${normalizedRootDir}${sep}`,
    )
  );
};

const normalizeFileToRootDir = (file: string, rootDir: string) => {
  const normalizedFile = normalizeForComparison(file);
  const normalizedRootDir = normalizeForComparison(rootDir);
  if (
    normalizedFile === normalizedRootDir ||
    normalizedFile.startsWith(
      normalizedRootDir.endsWith(sep)
        ? normalizedRootDir
        : `${normalizedRootDir}${sep}`,
    )
  ) {
    return normalize(
      join(rootDir, relative(normalizedRootDir, normalizedFile)),
    );
  }
  return normalize(file);
};

const getTypeScriptContext = ({
  context,
  moduleFederationConfig,
}: Required<RemoteOptions>) => {
  const dtsOptions = moduleFederationConfig.dts;
  return typeof dtsOptions !== 'boolean' && dtsOptions?.cwd
    ? dtsOptions.cwd
    : context;
};

const resolveFromConfigDir = (value: unknown, configDir: string) => {
  if (typeof value !== 'string') {
    return value;
  }
  return isAbsolute(value) ? normalize(value) : resolve(configDir, value);
};

const normalizeCompilerOptions = (
  compilerOptions: TsConfigCompilerOptions = {},
  configDir: string,
): TsConfigCompilerOptions => {
  const normalizedOptions = { ...compilerOptions };
  for (const pathOption of [
    'rootDir',
    'outDir',
    'declarationDir',
    'tsBuildInfoFile',
  ]) {
    if (typeof normalizedOptions[pathOption] === 'string') {
      normalizedOptions[pathOption] = resolveFromConfigDir(
        normalizedOptions[pathOption],
        configDir,
      );
    }
  }
  if (
    normalizedOptions['moduleResolution'] === 'node' ||
    normalizedOptions['moduleResolution'] === 'node10'
  ) {
    // TS 7 still prints legacy node resolution from --showConfig, but rejects it for --project.
    normalizedOptions['moduleResolution'] = 'bundler';
  }
  return normalizedOptions;
};

const parseShowConfigOutput = (
  stdout: string,
  resolvedTsConfigPath: string,
): {
  rawTsConfigJson: TsConfigJson;
  configContent: ParsedConfigContent;
} => {
  const configDir = dirname(resolvedTsConfigPath);
  const shownConfig = JSON.parse(stdout) as TsConfigJson;
  const compilerOptions = normalizeCompilerOptions(
    shownConfig.compilerOptions,
    configDir,
  );
  const fileNames = (shownConfig.files || []).map((file) =>
    resolveFromConfigDir(file, configDir),
  ) as string[];
  const projectReferences = (shownConfig.references || []).map((reference) => ({
    ...reference,
    path: resolveFromConfigDir(reference.path, configDir) as string,
    originalPath: reference.path,
  }));

  return {
    rawTsConfigJson: {
      ...shownConfig,
      compilerOptions,
    },
    configContent: {
      options: compilerOptions,
      fileNames,
      projectReferences,
    },
  };
};

const readTsConfigWithTsc = (
  resolvedTsConfigPath: string,
  typeScriptContext: string,
) => {
  const typeScriptPackageInfo = getTypeScriptPackageInfo(typeScriptContext);
  const stdout = execFileSync(
    process.execPath,
    [
      typeScriptPackageInfo.tscBinPath,
      '--showConfig',
      '--project',
      resolvedTsConfigPath,
    ],
    {
      cwd: typeScriptContext,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  return parseShowConfigOutput(stdout, resolvedTsConfigPath);
};

const writeListFilesTsConfig = (
  rootFiles: string[],
  resolvedTsConfigPath: string,
  context: string,
  compilerOptions?: TsConfigCompilerOptions,
) => {
  const hash = crypto
    .createHash('md5')
    .update(`${JSON.stringify(rootFiles)}${resolvedTsConfigPath}${Date.now()}`)
    .digest('hex');
  const tempTsConfigJsonPath = resolve(
    context,
    'node_modules',
    TEMP_DIR,
    `tsconfig.list-files.${hash}.json`,
  );
  mkdirSync(dirname(tempTsConfigJsonPath), { recursive: true });
  const listFilesConfig: TsConfigJson = compilerOptions
    ? {
        compilerOptions,
        files: rootFiles.map((file) =>
          isAbsolute(file) ? file : resolve(context, file),
        ),
      }
    : {
        extends: resolvedTsConfigPath,
        files: rootFiles.map((file) =>
          isAbsolute(file) ? file : resolve(context, file),
        ),
      };
  writeFileSync(tempTsConfigJsonPath, JSON.stringify(listFilesConfig, null, 2));
  return tempTsConfigJsonPath;
};

const formatCompilerError = (error: unknown) => {
  const readOutput = (value: unknown) => {
    if (Buffer.isBuffer(value)) {
      return value.toString('utf8');
    }
    return typeof value === 'string' ? value : '';
  };

  if (typeof error === 'object' && error !== null) {
    const processError = error as {
      stderr?: unknown;
      stdout?: unknown;
      message?: unknown;
    };
    const stderr = readOutput(processError.stderr).trim();
    if (stderr) {
      return stderr.split(/\r?\n/)[0];
    }
    const stdout = readOutput(processError.stdout).trim();
    if (stdout) {
      return stdout.split(/\r?\n/)[0];
    }
    if (typeof processError.message === 'string') {
      return processError.message;
    }
  }

  return String(error);
};

const getDependentFilesWithTsc = (
  rootFiles: string[],
  rootDir: string,
  resolvedTsConfigPath: string,
  compilerOptions: TsConfigCompilerOptions,
  context: string,
  typeScriptContext: string,
): string[] => {
  if (!rootFiles.length) {
    return [];
  }

  const typeScriptPackageInfo = getTypeScriptPackageInfo(typeScriptContext);
  const listFilesTsConfigPath = writeListFilesTsConfig(
    rootFiles,
    resolvedTsConfigPath,
    context,
    compilerOptions,
  );
  try {
    const stdout = execFileSync(
      process.execPath,
      [
        typeScriptPackageInfo.tscBinPath,
        '--listFilesOnly',
        '--project',
        listFilesTsConfigPath,
      ],
      {
        cwd: typeScriptContext,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    const dependentFiles = stdout
      .split(/\r?\n/)
      .map((file) => file.trim())
      .filter(Boolean)
      .map((file) => (isAbsolute(file) ? file : resolve(context, file)))
      .filter(
        (file) => !file.endsWith('.d.ts') && isFileWithinRootDir(file, rootDir),
      )
      .map((file) => normalizeFileToRootDir(file, rootDir));
    return dependentFiles.length ? dependentFiles : rootFiles;
  } catch (error) {
    logger.warn(
      `Failed to collect TypeScript dependency files with "tsc --listFilesOnly"; falling back to exposed files only. ${formatCompilerError(
        error,
      )}`,
    );
    return rootFiles;
  } finally {
    rmSync(listFilesTsConfigPath, { force: true });
  }
};

const readTsConfig = (
  remoteOptions: Required<RemoteOptions>,
  mapComponentsToExpose: Record<string, string>,
): TsConfigJson => {
  const {
    tsConfigPath,
    typesFolder,
    compiledTypesFolder,
    context,
    additionalFilesToCompile,
    outputDir,
  } = remoteOptions;
  const resolvedTsConfigPath = resolve(context, tsConfigPath);
  const typeScriptContext = getTypeScriptContext(remoteOptions);
  const typeScriptPackageInfo = getTypeScriptPackageInfo(typeScriptContext);

  let rawTsConfigJson: TsConfigJson;
  let configContent: ParsedConfigContent;
  let typescript: LegacyTypeScriptApi | undefined;

  if (typeScriptPackageInfo.majorVersion === 7) {
    ({ rawTsConfigJson, configContent } = readTsConfigWithTsc(
      resolvedTsConfigPath,
      typeScriptContext,
    ));
  } else {
    typescript = requireTypeScript<LegacyTypeScriptApi>(typeScriptContext);
    const readResult = typescript.readConfigFile(
      resolvedTsConfigPath,
      typescript.sys.readFile,
    );

    if (readResult.error) {
      throw new Error(readResult.error.messageText.toString());
    }

    rawTsConfigJson = readResult.config || {};
    configContent = typescript.parseJsonConfigFileContent(
      rawTsConfigJson,
      typescript.sys,
      dirname(resolvedTsConfigPath),
    );
    configContent.projectReferences = configContent.projectReferences || [];
  }
  const rootDir = getEffectiveRootDir(configContent);

  const outDir = resolve(
    context,
    outputDir || configContent.options.outDir || 'dist',
    typesFolder,
    compiledTypesFolder,
  );

  const defaultCompilerOptions: TsConfigCompilerOptions = {
    rootDir,
    emitDeclarationOnly: true,
    noEmit: false,
    declaration: true,
    outDir,
  };

  rawTsConfigJson.compilerOptions = rawTsConfigJson.compilerOptions || {};

  rawTsConfigJson.compilerOptions = {
    incremental: true,
    tsBuildInfoFile: resolve(
      context,
      'node_modules/.cache/mf-types/.tsbuildinfo',
    ),
    ...rawTsConfigJson.compilerOptions,
    ...defaultCompilerOptions,
  };

  const { paths, baseUrl, ...restCompilerOptions } =
    rawTsConfigJson.compilerOptions || {};
  rawTsConfigJson.compilerOptions = restCompilerOptions;

  const outDirWithoutTypesFolder = resolve(
    context,
    outputDir || configContent.options.outDir || 'dist',
  );

  const excludeExtensions = ['.mdx', '.md'];
  const rootFiles = [
    ...Object.values(mapComponentsToExpose),
    ...additionalFilesToCompile,
  ].filter(
    (filename) => !excludeExtensions.some((ext) => filename.endsWith(ext)),
  );

  const filesToCompile = [
    ...(typescript
      ? getDependentFiles(rootFiles, configContent, rootDir, typescript)
      : getDependentFilesWithTsc(
          rootFiles,
          rootDir,
          resolvedTsConfigPath,
          configContent.options,
          context,
          typeScriptContext,
        )),
    ...configContent.fileNames.filter(
      (filename) =>
        filename.endsWith('.d.ts') &&
        !filename.startsWith(outDirWithoutTypesFolder),
    ),
  ];

  rawTsConfigJson.include = [];
  rawTsConfigJson.files = [...new Set(filesToCompile)];
  rawTsConfigJson.exclude = [];
  'references' in rawTsConfigJson && delete rawTsConfigJson.references;

  rawTsConfigJson.extends = resolvedTsConfigPath;

  // Force override inherited declarationDir
  rawTsConfigJson.compilerOptions.declarationDir = outDir;

  return rawTsConfigJson;
};

const TS_EXTENSIONS = ['.ts', '.tsx', '.vue', '.svelte', '.js', '.jsx'];

const resolveWithExtension = (exposedPath: string, context: string) => {
  const explicitExtension = extname(exposedPath);

  if (TS_EXTENSIONS.includes(explicitExtension)) {
    return resolve(context, exposedPath);
  }

  for (const extension of TS_EXTENSIONS) {
    const exposedPathWithExtension = resolve(
      context,
      `${exposedPath}${extension}`,
    );
    if (existsSync(exposedPathWithExtension)) {
      return exposedPathWithExtension;
    }
  }
  return undefined;
};

const resolveExposes = (remoteOptions: Required<RemoteOptions>) => {
  const parsedOptions = utils.parseOptions(
    remoteOptions.moduleFederationConfig.exposes || {},
    (item, key) => ({
      exposePath: Array.isArray(item) ? item[0] : item,
      key,
    }),
    (item, key) => ({
      exposePath: Array.isArray(item.import) ? item.import[0] : item.import[0],
      key,
    }),
  );
  return parsedOptions.reduce(
    (accumulator, item) => {
      const { exposePath, key } = item[1];
      accumulator[key] =
        resolveWithExtension(exposePath, remoteOptions.context) ||
        resolveWithExtension(
          join(exposePath, 'index'),
          remoteOptions.context,
        ) ||
        exposePath;
      return accumulator;
    },
    {} as Record<string, string>,
  );
};

export const retrieveRemoteConfig = (options: RemoteOptions) => {
  validateOptions(options);

  const remoteOptions = {
    ...defaultOptions,
    ...options,
  } as Required<RemoteOptions>;
  const mapComponentsToExpose = resolveExposes(remoteOptions);
  const tsConfig = readTsConfig(remoteOptions, mapComponentsToExpose);

  if (
    tsConfig.compilerOptions.incremental &&
    tsConfig.compilerOptions.tsBuildInfoFile &&
    options.deleteTypesFolder !== true
  ) {
    remoteOptions.deleteTypesFolder = false;
  }

  return {
    tsConfig,
    mapComponentsToExpose,
    remoteOptions,
  };
};
