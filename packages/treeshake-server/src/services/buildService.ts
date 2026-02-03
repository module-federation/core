import { createHash } from 'node:crypto';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { STATS_NAME } from '@/domain/build/constant';
import {
  type BuildType,
  type NormalizedConfig,
  parseNormalizedKey,
} from '@/domain/build/normalize-config';
import { markInstallEnd, markInstallStart } from '@/services/pnpmMaintenance';
import { runCommand } from '../utils/runCommand';
import type { SharedFilePath } from './uploadService';

export const createUniqueTempDirByKey = async (
  key: string,
): Promise<string> => {
  const base = path.join(os.tmpdir(), `re-shake-share-${key}`);
  let candidate = base;
  for (;;) {
    try {
      await fsPromises.mkdir(candidate, { recursive: false });
      return candidate;
    } catch {
      const rand = Math.floor(Math.random() * 1e9);
      candidate = `${base}-${rand}`;
    }
  }
};

const prepareProject = async (
  config: NormalizedConfig,
  excludeShared: Array<[sharedName: string, version: string]>,
): Promise<string> => {
  //copy template to tmp dir
  const key = createHash('sha256').update(JSON.stringify(config)).digest('hex');
  const dir = await createUniqueTempDirByKey(key);
  const templateDir = path.join(__dirname, '.', 'template', 're-shake-share');

  // Optimize: use fsPromises.cp which is efficient, but ensure we don't copy unnecessary files
  await fsPromises.cp(templateDir, dir, { recursive: true });

  // Parallelize file reads and writes where possible
  const pkgPath = path.join(dir, 'package.json');
  const indexPath = path.join(dir, 'index.ts');
  const rspackConfigPath = path.join(dir, 'rspack.config.ts');

  const [pkgContent, indexContent, rspackConfigContent] = await Promise.all([
    fsPromises.readFile(pkgPath, 'utf-8'),
    fsPromises.readFile(indexPath, 'utf-8'),
    fsPromises.readFile(rspackConfigPath, 'utf-8'),
  ]);

  const pkg = JSON.parse(pkgContent);
  const deps = { ...(pkg.dependencies || {}) };
  const shared: Record<
    string,
    {
      treeShaking?: {
        usedExports: string[];
        mode: 'runtime-infer' | 'server-calc';
      };
      version: string;
      requiredVersion: string;
    }
  > = {};
  const mfConfig = {
    name: 're_shake',
    library: { type: 'global' },
    manifest: true,
    shared,
  };
  let pluginImportStr = '';
  let pluginOptionStr = '[\n';
  let sharedImport = '';

  Object.entries(config).forEach(
    ([key, { plugins = [], libraryType, usedExports, hostName }], index) => {
      const { name, version } = parseNormalizedKey(key);
      deps[name] = version;
      // all plugins and library value are the same , only add once
      if (!index) {
        plugins.forEach(([pluginName, pluginVersion], pIndex) => {
          deps[pluginName] = pluginVersion ?? 'latest';
          const pluginImportName = `plugin_${pIndex}`;
          pluginImportStr += `import ${pluginImportName} from '${pluginName}';\n`;
          pluginOptionStr += `new ${pluginImportName}(),`;
        });
        mfConfig.library.type = libraryType;
        mfConfig.name = hostName;
      }
      shared[name] = {
        requiredVersion: version,
        version,
        treeShaking: !excludeShared.some(
          ([n, v]) => n === name && v === version,
        )
          ? {
              usedExports,
              mode: 'server-calc',
            }
          : undefined,
      };
      sharedImport += `import shared_${index} from '${name}';\n`;
    },
  );
  pluginOptionStr += '\n]';

  // Prepare file contents
  pkg.dependencies = deps;
  const newPkgContent = JSON.stringify(pkg, null, 2);

  const sharedImportPlaceholder = '${' + 'SHARED_IMPORT}';
  const newIndexContent = indexContent.replace(
    sharedImportPlaceholder,
    sharedImport,
  );

  const pluginsPlaceholder = '${' + ' PLUGINS }';
  const mfConfigPlaceholder = '${' + ' MF_CONFIG }';
  let cfg = rspackConfigContent;
  cfg += pluginImportStr;
  cfg = cfg.replace(pluginsPlaceholder, pluginOptionStr);
  cfg = cfg.replace(mfConfigPlaceholder, JSON.stringify(mfConfig, null, 2));

  // Write files in parallel
  await Promise.all([
    fsPromises.writeFile(pkgPath, newPkgContent),
    fsPromises.writeFile(indexPath, newIndexContent),
    fsPromises.writeFile(rspackConfigPath, cfg),
  ]);

  return dir;
};

const installDependencies = async (cwd: string): Promise<void> => {
  markInstallStart();
  try {
    // Check if node_modules already exists (e.g. from a cache or pre-warm)
    // For now, we optimize pnpm install as much as possible
    await runCommand(
      'pnpm i --ignore-scripts --no-frozen-lockfile --prefer-offline --reporter=silent --shamefully-hoist',
      {
        cwd,
        env: {
          npm_config_registry: 'https://registry.npmjs.org/',
        },
      },
    );
  } finally {
    markInstallEnd();
  }
};

const buildProject = async (cwd: string, type: BuildType): Promise<void> => {
  const scripts: string[] = [];
  if (type === 're-shake') {
    scripts.push('pnpm build');
  } else {
    scripts.push('pnpm build:full');
  }
  await Promise.all(scripts.map((script) => runCommand(script, { cwd })));
};

const retrieveSharedFilepaths = async (
  projectDir: string,
  type: BuildType,
): Promise<Array<SharedFilePath>> => {
  const sharedFilepaths: Array<SharedFilePath> = [];

  const collectSharedFilepaths = async (t: BuildType) => {
    const dir = t === 'full' ? 'full-shared' : 'dist';
    const distDir = path.join(projectDir, dir);
    const statsContent = await fsPromises.readFile(
      path.join(distDir, STATS_NAME),
      'utf-8',
    );
    const stats = JSON.parse(statsContent) as {
      shared: Array<{
        name: string;
        version: string;
        fallback?: string;
        fallbackName?: string;
        // only appears when type is 'full'
        usedExports?: string[];
        canTreeShaking?: boolean;
      }>;
    };

    stats.shared.forEach((s) => {
      const { name, version, fallback, fallbackName } = s;
      if (fallback && fallbackName) {
        const filepath = path.join(distDir, fallback);
        sharedFilepaths.push({
          name,
          version,
          filepath,
          globalName: fallbackName,
          type: t,
          modules: s.usedExports,
          canTreeShaking: s.canTreeShaking ?? s.usedExports?.length !== 0,
        });
      }
    });
  };

  await collectSharedFilepaths(type);
  return sharedFilepaths;
};

import { logger } from '@/infra/logger';

export const runBuild = async (
  normalizedConfig: NormalizedConfig,
  excludeShared: Array<[string, string]>,
  type: BuildType,
) => {
  const tStart = Date.now();

  const tmpDir = await prepareProject(normalizedConfig, excludeShared);
  const tPrepare = Date.now();
  logger.info(`prepareProject took ${tPrepare - tStart}ms`);

  await installDependencies(tmpDir);
  const tInstall = Date.now();
  logger.info(`installDependencies took ${tInstall - tPrepare}ms`);

  await buildProject(tmpDir, type);
  const tBuild = Date.now();
  logger.info(`buildProject took ${tBuild - tInstall}ms`);

  const sharedFilePaths = await retrieveSharedFilepaths(tmpDir, type);
  const tRetrieve = Date.now();
  logger.info(`retrieveSharedFilepaths took ${tRetrieve - tBuild}ms`);

  return {
    sharedFilePaths,
    dir: tmpDir,
  };
};

export async function cleanUp(tmpDir?: string) {
  if (!tmpDir) {
    return;
  }
  await fsPromises.rm(tmpDir, { recursive: true, force: true });
}
