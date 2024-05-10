import { NormalizedFederationConfig } from '../config/federation-config';
import { FederationInfo } from '@module-federation/native-federation-runtime';
import { FederationOptions } from './federation-options';
export interface BuildParams {
  skipMappingsAndExposed: boolean;
}
export declare const defaultBuildParams: BuildParams;
export declare function buildForFederation(
  config: NormalizedFederationConfig,
  fedOptions: FederationOptions,
  externals: string[],
  buildParams?: BuildParams,
): Promise<FederationInfo>;
