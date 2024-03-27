# @module-federation/dts-kit

- This kit provides utilities to support the implementation of Module Federation Types in your projects.

## Usage

```javascript
import { generateTypes, generateTypesInChildProcess, consumeTypes, } from '@module-federation/dts-kit';

// generate types for expose modules
generateTypes({ remote: RemoteOptions })
// generate types for expose modules in child process
generateTypesInChildProcess({ remote: RemoteOptions })

// consume remote types
consumeTypes({ host: HostOptions })
```

### Configuration

```typescript
interface DTSManagerOptions {
  remote?: RemoteOptions;
  host?: HostOptions;
  extraOptions?: Record<string, any>;
}
```

#### RemoteOptions

```typescript
interface RemoteOptions {
  tsConfigPath?: string; // path where the tsconfig file is located, default is ''./tsconfig.json'
  typesFolder?: string; // folder where all the files will be stored, default is '@mf-types',
  compiledTypesFolder?: string;  // folder where the federated modules types will be stored, default is 'compiled-types'
  deleteTypesFolder?: boolean; // indicate if the types folder will be deleted when the job completes, default is 'true'
  additionalFilesToCompile?: string[]; // The path of each additional file which should be emitted
  compileInChildProcess?: boolean; // indicate if the types will be compiled in child process, default is 'false'
  compilerInstance?: 'tsc' | 'vue-tsc'; // The compiler to use to emit files, default is 'tsc'
  generateAPITypes?: boolean; // indicate if generate runtime api types, default is 'false'
  abortOnError?: boolean; // indicate if the job will be aborted if an error occurs, default is 'true'
  moduleFederationConfig: moduleFederationPlugin.ModuleFederationPluginOptions; // the configuration same configuration provided to the module federation plugin, it is MANDATORY
  context?: string; // the context of the tsconfig file, default is 'process.cwd()'
  implementation?: string; // the implementation of DTSManager
  hostRemoteTypesFolder?: string; // the folder where the remote types pathname, default is `@mf-types`
}
```

#### HostOptions

```typescript

interface HostOptions{
  typesFolder?: string; // folder where all the files will be stored, default is '@mf-types',
  abortOnError?: boolean; // indicate if the job will be aborted if an error occurs, default is 'true'
  remoteTypesFolder?: string; // the folder where the remote types pathname, default is `@mf-types`
  deleteTypesFolder?: boolean; // indicate if the types folder will be deleted before the job starts, default is 'true'
  maxRetries?: number; // The number of times the plugin will try to download the types before failing, default is 3
  moduleFederationConfig: moduleFederationPlugin.ModuleFederationPluginOptions; // the configuration same configuration provided to the module federation plugin, it is MANDATORY
  context?: string; // the context of the tsconfig file, default is 'process.cwd()'
  implementation?: string; // the implementation of DTSManager
}

```
