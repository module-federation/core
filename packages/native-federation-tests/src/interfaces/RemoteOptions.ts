import type { Options } from 'tsup';

export interface RemoteOptions {
  moduleFederationConfig: any;
  additionalBundlerConfig?: Options;
  distFolder?: string;
  testsFolder?: string;
  deleteTestsFolder?: boolean;
}
