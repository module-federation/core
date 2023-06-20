import { Options } from 'tsup';

interface HostOptions {
    moduleFederationConfig: any;
    testsFolder?: string;
    mocksFolder?: string;
    deleteTestsFolder?: boolean;
}

interface RemoteOptions {
    moduleFederationConfig: any;
    additionalBundlerConfig?: Options;
    distFolder?: string;
    testsFolder?: string;
    deleteTestsFolder?: boolean;
}

export { HostOptions as H, RemoteOptions as R };
