import fs from 'node:fs';
import path from 'node:path';
import type { ModuleFederationConfigNormalized, ShareObject } from '../types';

export function getRemoteModule(name: string) {
  const template = getModuleTemplate('remote-module.js');
  return template.replaceAll('__MODULE_ID__', `"${name}"`);
}

export function getHostEntryModule(
  _: ModuleFederationConfigNormalized,
  paths: { originalEntry: string; tmpDir: string },
) {
  const template = getModuleTemplate('host-entry.js');
  return template.replaceAll(
    '__ENTRYPOINT_IMPORT__',
    `import './${path.relative(paths.tmpDir, paths.originalEntry)}'`,
  );
}

export function getInitHostModule(options: ModuleFederationConfigNormalized) {
  const template = getModuleTemplate('init-host.js');
  return template
    .replaceAll('__NAME__', JSON.stringify(options.name))
    .replaceAll('__REMOTES__', generateRemotes(options.remotes))
    .replaceAll('__SHARED__', generateShared(options))
    .replaceAll('__SHARE_STRATEGY__', JSON.stringify(options.shareStrategy))
    .replaceAll('__PLUGINS__', generateRuntimePlugins(options.plugins));
}

export function getRemoteEntryModule(
  options: ModuleFederationConfigNormalized,
  paths: { tmpDir: string; projectDir: string },
) {
  const template = getModuleTemplate('remote-entry.js');
  return template
    .replaceAll('__NAME__', JSON.stringify(options.name))
    .replaceAll('__EXPOSES_MAP__', generateExposes(options.exposes, paths))
    .replaceAll('__REMOTES__', generateRemotes(options.remotes))
    .replaceAll('__SHARED__', generateShared(options))
    .replaceAll('__SHARE_STRATEGY__', JSON.stringify(options.shareStrategy))
    .replaceAll('__PLUGINS__', generateRuntimePlugins(options.plugins));
}

export function getRemoteModuleRegistryModule() {
  const template = getModuleTemplate('remote-module-registry.js');
  return template.replaceAll(
    '__EARLY_MODULE_TEST__',
    '/^react(-native(\\/|$)|$)/',
  );
}

export function getRemoteHMRSetupModule() {
  const template = getModuleTemplate('remote-hmr.js');
  return template;
}

function generateExposes(
  exposes: Record<string, string>,
  paths: { tmpDir: string; projectDir: string },
) {
  const exposesString = Object.keys(exposes).map((key) => {
    const importPath = path.join(paths.projectDir, exposes[key]);
    const relativeImportPath = path.relative(paths.tmpDir, importPath);
    return `"${key}": async () => import("${relativeImportPath}")`;
  });

  return `{${exposesString.join(',')}}`;
}

function generateRuntimePlugins(runtimePlugins: string[]) {
  const pluginNames: string[] = [];
  const pluginImports: string[] = [];

  runtimePlugins.forEach((plugin, index) => {
    const pluginName = `plugin${index}`;
    pluginNames.push(`${pluginName}()`);
    pluginImports.push(`import ${pluginName} from "${plugin}";`);
  });

  const imports = pluginImports.join('\n');
  const plugins = `const plugins = [${pluginNames.join(', ')}];`;

  return `${imports}\n${plugins}`;
}

function generateRemotes(remotes: Record<string, string> = {}) {
  const remotesEntries: string[] = [];
  for (const [remoteAlias, remoteEntry] of Object.entries(remotes)) {
    const remoteEntryParts = remoteEntry.split('@');
    const remoteName = remoteEntryParts[0];
    const remoteEntryUrl = remoteEntryParts.slice(1).join('@');

    remotesEntries.push(
      `{ 
          alias: "${remoteAlias}", 
          name: "${remoteName}", 
          entry: "${remoteEntryUrl}", 
          entryGlobalName: "${remoteName}", 
          type: "var" 
       }`,
    );
  }

  return `[${remotesEntries.join(',\n')}]`;
}

function generateShared(options: ModuleFederationConfigNormalized) {
  const shared = Object.keys(options.shared).reduce(
    (acc, name) => {
      acc[name] = `__SHARED_${name}__`;
      return acc;
    },
    {} as Record<string, string>,
  );

  let sharedString = JSON.stringify(shared);
  for (const name of Object.keys(options.shared)) {
    const sharedConfig = options.shared[name];
    const entry = getSharedModuleEntry(name, sharedConfig);
    sharedString = sharedString.replaceAll(`"__SHARED_${name}__"`, entry);
  }

  return sharedString;
}

function getSharedModuleEntry(name: string, options: ShareObject[string]) {
  const template = {
    version: options.version,
    scope: 'default',
    shareConfig: {
      singleton: options.singleton,
      eager: options.eager,
      requiredVersion: options.requiredVersion,
    },
    get: options.eager
      ? '__GET_SYNC_PLACEHOLDER__'
      : '__GET_ASYNC_PLACEHOLDER__',
  };

  const templateString = JSON.stringify(template);

  return templateString
    .replaceAll('"__GET_SYNC_PLACEHOLDER__"', `() => () => require("${name}")`)
    .replaceAll(
      '"__GET_ASYNC_PLACEHOLDER__"',
      `async () => import("${name}").then((m) => () => m)`,
    );
}

function resolveRuntimeModule(moduleName: string): string {
  return require.resolve(`../runtime/${moduleName}`);
}

function getModuleTemplate(moduleName: string) {
  const templatePath = resolveRuntimeModule(moduleName);
  return fs.readFileSync(templatePath, 'utf-8');
}
