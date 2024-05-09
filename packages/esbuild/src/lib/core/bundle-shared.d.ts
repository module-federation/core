import { NormalizedFederationConfig } from '../config/federation-config';
import { SharedInfo } from '@softarc/native-federation-runtime';
import { FederationOptions } from './federation-options';
export declare function bundleShared(
  config: NormalizedFederationConfig,
  fedOptions: FederationOptions,
  externals: string[],
): Promise<Array<SharedInfo>>;
