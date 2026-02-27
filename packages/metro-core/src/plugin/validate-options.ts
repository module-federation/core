import type { ModuleFederationConfig, ShareObject } from '../types';
import logger from '../logger';
import { ConfigError } from '../utils';

const unsupportedTopLevelOptions: (keyof ModuleFederationConfig)[] = [
  'library',
  'remoteType',
  'runtime',
  'shareScope',
  'getPublicPath',
  'implementation',
  'manifest',
  'dev',
  'dataPrefetch',
  'virtualRuntimeEntry',
  'experiments',
  'bridge',
  'async',
  'treeShakingDir',
  'injectTreeShakingUsedExports',
  'treeShakingSharedExcludePlugins',
  'treeShakingSharedPlugins',
];

const unsupportedSharedFields = [
  'packageName',
  'shareKey',
  'shareScope',
  'strictVersion',
  'treeShaking',
  'shareStrategy',
];

const warningSet = new Set<string>();

function validateName(name: string | undefined) {
  if (!name || typeof name !== 'string') {
    throw new ConfigError("Option 'name' is required.");
  }

  const validEcmaIdentifierRegex =
    // biome-ignore lint/suspicious/noMisleadingCharacterClass: works
    /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;

  if (!validEcmaIdentifierRegex.test(name)) {
    throw new ConfigError(
      `Invalid 'name': ${name}. The 'name' must be a valid JavaScript identifier.`,
    );
  }
}

function validateFilename(filename: string | undefined) {
  // filename is optional
  if (!filename) {
    return;
  }

  if (!filename.endsWith('.bundle')) {
    throw new ConfigError(
      `Invalid filename: ${filename}. ` +
        'Filename must end with .bundle extension.',
    );
  }
}

function validateShared(shared: ModuleFederationConfig['shared']) {
  if (!shared) {
    throw new ConfigError('Shared configuration is required.');
  }

  if (typeof shared !== 'object') {
    throw new ConfigError('Shared must be an object.');
  }

  if (Array.isArray(shared)) {
    throw new ConfigError('Array format is not supported for shared.');
  }

  if (!isPlainObject(shared)) {
    throw new ConfigError('Shared must be an object.');
  }

  const sharedObject = shared as ShareObject;

  // validate react & react-native present
  if (!('react' in sharedObject)) {
    throw new ConfigError("Dependency 'react' must be present in shared.");
  }

  if (!('react-native' in sharedObject)) {
    throw new ConfigError(
      "Dependency 'react-native' must be present in shared.",
    );
  }

  // validate shared module names
  for (const sharedName of Object.keys(sharedObject)) {
    const sharedConfig = sharedObject[sharedName] as unknown;

    // disallow relative paths
    if (sharedName.startsWith('./') || sharedName.startsWith('../')) {
      throw new ConfigError(
        'Relative paths are not supported as shared module names.',
      );
    }

    // disallow absolute paths
    if (sharedName.startsWith('/')) {
      throw new ConfigError(
        'Absolute paths are not supported as shared module names.',
      );
    }

    // disallow deep import wildcards (containing /)
    if (sharedName.endsWith('/')) {
      throw new ConfigError(
        'Deep import wildcards are not supported as shared module names. ' +
          'You need to list all deep imports explicitly.',
      );
    }

    if (!isPlainObject(sharedConfig)) {
      throw new ConfigError(
        `Unsupported shared format for '${sharedName}'. Metro only supports object notation for shared modules.`,
      );
    }

    if (
      'import' in sharedConfig &&
      sharedConfig.import !== false &&
      typeof sharedConfig.import !== 'string'
    ) {
      throw new ConfigError(
        `Unsupported shared.import value for '${sharedName}'. Only string and false are supported in Metro.`,
      );
    }

    for (const unsupportedField of unsupportedSharedFields) {
      if (unsupportedField in sharedConfig) {
        warnUnsupported(
          `shared.${sharedName}.${unsupportedField}`,
          `Option 'shared.${sharedName}.${unsupportedField}' is not supported in Metro and will have no effect.`,
        );
      }
    }
  }
}

function validateRemotes(remotes: ModuleFederationConfig['remotes']) {
  if (typeof remotes === 'undefined') {
    return;
  }

  if (!isPlainObject(remotes)) {
    throw new ConfigError(
      'Unsupported remotes format. Metro only supports remotes as Record<string, string>.',
    );
  }

  for (const remoteConfig of Object.values(remotes)) {
    if (typeof remoteConfig !== 'string') {
      throw new ConfigError(
        'Unsupported remotes format. Metro only supports remotes as Record<string, string>.',
      );
    }
  }
}

function validateExposes(exposes: ModuleFederationConfig['exposes']) {
  if (typeof exposes === 'undefined') {
    return;
  }

  if (!isPlainObject(exposes)) {
    throw new ConfigError(
      'Unsupported exposes format. Metro only supports exposes as Record<string, string>.',
    );
  }

  for (const exposeConfig of Object.values(exposes)) {
    if (typeof exposeConfig !== 'string') {
      throw new ConfigError(
        'Unsupported exposes format. Metro only supports exposes as Record<string, string>.',
      );
    }
  }
}

function validateRuntimePlugins(
  runtimePlugins: ModuleFederationConfig['runtimePlugins'],
) {
  if (typeof runtimePlugins === 'undefined') {
    return;
  }

  if (!Array.isArray(runtimePlugins)) {
    throw new ConfigError('runtimePlugins must be an array.');
  }

  runtimePlugins.forEach((runtimePlugin, index) => {
    if (typeof runtimePlugin === 'string') {
      return;
    }

    if (!Array.isArray(runtimePlugin)) {
      throw new ConfigError(
        'runtimePlugins entries must be either a string or a tuple of [path, params].',
      );
    }

    const [pluginPath, pluginParams] = runtimePlugin;
    if (typeof pluginPath !== 'string') {
      throw new ConfigError(
        `Invalid runtimePlugins[${index}] path. Expected a string path.`,
      );
    }

    if (typeof pluginParams !== 'undefined') {
      warnUnsupported(
        `runtimePlugins[${index}][1]`,
        `Option 'runtimePlugins[${index}][1]' is not supported in Metro and will have no effect.`,
      );
    }
  });
}

function validateDts(dts: ModuleFederationConfig['dts']) {
  if (typeof dts === 'undefined' || typeof dts === 'boolean') {
    return;
  }

  if (!isPlainObject(dts)) {
    throw new ConfigError("Option 'dts' must be a boolean or a plain object.");
  }
}

function validateUnsupportedTopLevelOptions(options: ModuleFederationConfig) {
  unsupportedTopLevelOptions.forEach((unsupportedOption) => {
    if (typeof options[unsupportedOption] !== 'undefined') {
      warnUnsupported(
        String(unsupportedOption),
        `Option '${String(unsupportedOption)}' is not supported in Metro and will have no effect.`,
      );
    }
  });
}

function validateDeprecatedOptions(options: ModuleFederationConfig) {
  if (options.plugins && options.plugins.length > 0) {
    warnUnsupported(
      'deprecated.plugins',
      "The 'plugins' option is deprecated. Use 'runtimePlugins' instead. " +
        "Support for 'plugins' will be removed in the next major version.",
    );
  }
}

function warnUnsupported(key: string, message: string) {
  if (warningSet.has(key)) {
    return;
  }

  warningSet.add(key);
  logger.warn(message);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateOptions(options: ModuleFederationConfig) {
  // warn for known but unsupported options
  validateUnsupportedTopLevelOptions(options);
  validateDeprecatedOptions(options);

  // validate name
  validateName(options.name);

  // validate filename
  validateFilename(options.filename);

  // validate remotes / exposes subset support
  validateRemotes(options.remotes);
  validateExposes(options.exposes);

  // validate runtime plugins subset support
  validateRuntimePlugins(options.runtimePlugins);

  // validate dts
  validateDts(options.dts);

  // validate shared
  validateShared(options.shared);
}
