import { moduleFederationPlugin } from '@module-federation/sdk';

export interface RemoteOptions {
  moduleFederationConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  context?: string;
  tsConfigPath?: string;
  typesFolder?: string;
  compiledTypesFolder?: string;
  deleteTypesFolder?: boolean;
  additionalFilesToCompile?: string[];
  compilerInstance?: 'tsc' | 'vue-tsc';
  compileInChildProcess?: boolean;
  implementation?: string;
  generateAPITypes?: boolean;
}
