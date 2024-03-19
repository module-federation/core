import { MANIFEST_EXT } from '@module-federation/sdk';
import { HostOptions, RemoteInfo } from '../interfaces/HostOptions';
import { validateOptions } from '../lib/utils';

const defaultOptions = {
  typesFolder: '@mf-types',
  remoteTypesFolder: '@mf-types',
  deleteTypesFolder: true,
  maxRetries: 3,
  implementation: '',
  context: process.cwd(),
  devServer: {
    typesReload: true,
  },
} satisfies Partial<HostOptions>;

const buildZipUrl = (hostOptions: Required<HostOptions>, url: string) => {
  const remoteUrl = new URL(url);

  if (remoteUrl.href.includes(MANIFEST_EXT)) {
    return undefined;
  }
  const pathnameWithoutEntry = remoteUrl.pathname
    .split('/')
    .slice(0, -1)
    .join('/');
  remoteUrl.pathname = `${pathnameWithoutEntry}/${hostOptions.remoteTypesFolder}.zip`;

  return remoteUrl.href;
};

const buildApiTypeUrl = (zipUrl?: string) => {
  if (!zipUrl) {
    return undefined;
  }
  return zipUrl.replace('.zip', '.d.ts');
};

const retrieveRemoteInfo = (options: {
  hostOptions: Required<HostOptions>;
  remoteAlias: string;
  remote: string;
}): RemoteInfo => {
  const { hostOptions, remoteAlias, remote } = options;

  const splittedRemote = remote.split('@');

  const url = splittedRemote[splittedRemote.length - 1];
  const zipUrl = buildZipUrl(hostOptions, url);

  return {
    name: splittedRemote[0] || remoteAlias,
    url: url,
    zipUrl,
    apiTypeUrl: buildApiTypeUrl(zipUrl),
    alias: remoteAlias,
  };
};

const resolveRemotes = (hostOptions: Required<HostOptions>) => {
  return Object.entries(
    hostOptions.moduleFederationConfig.remotes as Record<string, string>,
  ).reduce(
    (accumulator, [key, remote]) => {
      accumulator[key] = retrieveRemoteInfo({
        hostOptions,
        remoteAlias: key,
        remote,
      });
      return accumulator;
    },
    {} as Record<string, RemoteInfo>,
  );
};

export const retrieveHostConfig = (options: HostOptions) => {
  validateOptions(options);

  const hostOptions: Required<HostOptions> = { ...defaultOptions, ...options };
  const mapRemotesToDownload = resolveRemotes(hostOptions);

  return {
    hostOptions,
    mapRemotesToDownload,
  };
};
