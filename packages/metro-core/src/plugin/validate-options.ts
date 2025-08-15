import type { ModuleFederationConfig, Shared } from '../types';
import { ConfigError } from '../utils';

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

function validateShared(shared: Shared | undefined) {
  if (!shared) {
    throw new ConfigError('Shared configuration is required.');
  }

  if (typeof shared !== 'object') {
    throw new ConfigError('Shared must be an object.');
  }

  if (Array.isArray(shared)) {
    throw new ConfigError('Array format is not supported for shared.');
  }

  // validate react & react-native present
  if (!('react' in shared)) {
    throw new ConfigError("Dependency 'react' must be present in shared.");
  }

  if (!('react-native' in shared)) {
    throw new ConfigError(
      "Dependency 'react-native' must be present in shared.",
    );
  }

  // validate shared module names
  for (const sharedName of Object.keys(shared)) {
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
  }
}

export function validateOptions(options: ModuleFederationConfig) {
  // validate filename
  validateFilename(options.filename);

  // validate shared
  validateShared(options.shared);
}
