import { createHash } from 'node:crypto';
import fs from 'node:fs';
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

export const createUniqueTempDirByKey = (key: string): string => {
  const base = path.join(os.tmpdir(), `re-shake-share-${key}`);
  let candidate = base;
  for (;;) {
    try {
      fs.mkdirSync(candidate, { recursive: false });
      return candidate;
    } catch {
      const rand = Math.floor(Math.random() * 1e9);
      candidate = `${base}-${rand}`;
    }
  }
};

const prepareProject = (
  config: NormalizedConfig,
  excludeShared: Array<[sharedName: string, version: string]>,
): string => {
  //copy template to tmp dir
  const key = createHash('sha256').update(JSON.stringify(config)).digest('hex');
  const dir = createUniqueTempDirByKey(key);
  const templateDir = path.join(__dirname, '..', 'template', 're-shake-share');
  fs.cpSync(templateDir, dir, { recursive: true });

  const pkgPath = path.join(dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
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

  // update package.json
  pkg.dependencies = deps;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  const sharedImportPlaceholder = '${' + 'SHARED_IMPORT}';
  const pluginsPlaceholder = '${' + ' PLUGINS }';
  const mfConfigPlaceholder = '${' + ' MF_CONFIG }';

  // update shared import
  const indexPath = path.join(dir, 'index.ts');
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  fs.writeFileSync(
    indexPath,
    // Keep the placeholder as a literal string; it is not a template placeholder.
    indexContent.replace(sharedImportPlaceholder, sharedImport),
  );

  const rspackConfigPath = path.join(dir, 'rspack.config.ts');
  let cfg = fs.readFileSync(rspackConfigPath, 'utf-8');

  // update plugins
  cfg += pluginImportStr;
  cfg = cfg.replace(pluginsPlaceholder, pluginOptionStr);

  // update mfConfig
  cfg = cfg.replace(mfConfigPlaceholder, JSON.stringify(mfConfig, null, 2));

  // update rspack.config.ts
  fs.writeFileSync(rspackConfigPath, cfg);
  return dir;
};

const installDependencies = async (cwd: string): Promise<void> => {
  markInstallStart();
  try {
    await runCommand('pnpm i', {
      cwd,
      env: {
        npm_config_registry: 'https://registry.npmjs.org/',
      },
    });
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

const retrieveSharedFilepaths = (
  projectDir: string,
  type: BuildType,
): Array<SharedFilePath> => {
  const sharedFilepaths: Array<SharedFilePath> = [];

  const collectSharedFilepaths = (t: BuildType) => {
    const dir = t === 'full' ? 'full-shared' : 'dist';
    const distDir = path.join(projectDir, dir);
    const stats = JSON.parse(
      fs.readFileSync(path.join(distDir, STATS_NAME), 'utf-8'),
    ) as {
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

  collectSharedFilepaths(type);
  return sharedFilepaths;
};

export const runBuild = async (
  normalizedConfig: NormalizedConfig,
  excludeShared: Array<[string, string]>,
  type: BuildType,
) => {
  const tmpDir = prepareProject(normalizedConfig, excludeShared);
  await installDependencies(tmpDir);
  await buildProject(tmpDir, type);
  const sharedFilePaths = retrieveSharedFilepaths(tmpDir, type);

  return {
    sharedFilePaths,
    dir: tmpDir,
  };
};

export function cleanUp(tmpDir?: string) {
  if (!tmpDir) {
    return;
  }
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
