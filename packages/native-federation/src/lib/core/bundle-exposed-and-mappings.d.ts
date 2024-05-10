import { NormalizedFederationConfig } from '../config/federation-config';
import { FederationOptions } from './federation-options';
import {
  ExposesInfo,
  SharedInfo,
} from '@module-federation/native-federation-runtime';
export interface ArtefactInfo {
  mappings: SharedInfo[];
  exposes: ExposesInfo[];
}
export declare function bundleExposedAndMappings(
  config: NormalizedFederationConfig,
  fedOptions: FederationOptions,
  externals: string[],
): Promise<ArtefactInfo>;
export declare function describeExposed(
  config: NormalizedFederationConfig,
  options: FederationOptions,
): Array<ExposesInfo>;
export declare function describeSharedMappings(
  config: NormalizedFederationConfig,
  fedOptions: FederationOptions,
): Array<SharedInfo>;
