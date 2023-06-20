import { Configuration } from 'webpack';
import type { ModuleFederationConfig } from '@nx/devkit';
declare const withModuleFederation: (options: ModuleFederationConfig) => Promise<(config: Configuration) => Configuration>;
export default withModuleFederation;
