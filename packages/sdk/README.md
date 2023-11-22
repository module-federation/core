# `@module-federation/sdk` Documentation

- This SDK provides utilities and tools to support the implementation of Module Federation in your projects.
- It contains utility functions for parsing, encoding, and decoding module names, as well as generating filenames for exposed modules and shared packages.

## Usage
```javascript
// The SDK can be used to parse entry strings, encode and decode module names, and generate filenames for exposed modules and shared packages.
import { parseEntry, encodeName, decodeName, generateExposeFilename, generateShareFilename } from '@module-federation/sdk';

// Parse an entry string into a RemoteEntryInfo object
parseEntry('entryString');

// Encode a module name with a prefix and optional extension
encodeName('moduleName', 'prefix');

// Decode a module name with a prefix and optional extension
decodeName('encodedModuleName', 'prefix');

// Generate a filename for an exposed module
generateExposeFilename('exposeName', true);

// Generate a filename for a shared package
generateShareFilename('packageName', true);
```

### parseEntry

- Type: `parseEntry(str: string, devVerOrUrl?: string)`
- Parses a string into a RemoteEntryInfo object.

### encodeName

- Type: `encodeName(name: string, prefix = '', withExt = false)`
- Encodes a name with a prefix and optional extension.

### decodeName

- Type: `decodeName(name: string, prefix?: string, withExt?: boolean)`
- Decodes a name with a prefix and optional extension.

### generateExposeFilename

- Type: `generateExposeFilename(exposeName: string, withExt: boolean)`
- Generates a filename for an expose.

### generateShareFilename

- Type: `generateShareFilename(pkgName: string, withExt: boolean)`
- Generates a filename for a shared package.

## Testing

The SDK uses Jest for testing. The configuration can be found in `jest.config.js`. The tests are located in the __tests__ directory.
