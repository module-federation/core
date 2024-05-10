import { NormalizedFederationConfig } from '../config/federation-config';
import { FederationOptions } from './federation-options';
export declare function loadFederationConfig(
  fedOptions: FederationOptions,
): Promise<NormalizedFederationConfig>;
