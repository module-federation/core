import { FederationInfo } from '@softarc/native-federation-runtime';
import { NormalizedFederationConfig } from '../config/federation-config';
import { BuildAdapter } from './build-adapter';
import { FederationOptions } from './federation-options';
export interface BuildHelperParams {
  options: FederationOptions;
  adapter: BuildAdapter;
}
declare function init(params: BuildHelperParams): Promise<void>;
declare function build(
  buildParams?: import('./build-for-federation').BuildParams,
): Promise<void>;
export declare const federationBuilder: {
  init: typeof init;
  build: typeof build;
  readonly federationInfo: FederationInfo;
  readonly externals: string[];
  readonly config: NormalizedFederationConfig;
};
export {};
