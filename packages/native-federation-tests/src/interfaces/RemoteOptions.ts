import type { UserConfig } from 'tsdown';

export interface RemoteOptions {
  moduleFederationConfig: any;
  additionalBundlerConfig?: UserConfig;
  distFolder?: string;
  testsFolder?: string;
  deleteTestsFolder?: boolean;
}
