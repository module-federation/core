import { MANIFEST_EXT, parseEntry } from '@module-federation/sdk';
import { utils } from '@module-federation/managers';
import { HostOptions, RemoteInfo } from '../interfaces/HostOptions';
import { validateOptions } from '../lib/utils';

const defaultOptions = {
  typesFolder: '@mf-types',
  remoteTypesFolder: '@mf-types',
  deleteTypesFolder: true,
  maxRetries: 3,
  implementation: '',
  context: process.cwd(),
  abortOnError: true,
  consumeAPITypes: false,
} satisfies Partial<HostOptions>;

const buildZipUrl = (hostOptions: Required<HostOptions>, url: string) => {
  const remoteUrl = new URL(url, 'file:');

  const pathnameWithoutEntry = remoteUrl.pathname
    .split('/')
    .slice(0, -1)
    .join('/');
  remoteUrl.pathname = `${pathnameWithoutEntry}/${hostOptions.remoteTypesFolder}.zip`;

  return remoteUrl.protocol === 'file:' ? remoteUrl.pathname : remoteUrl.href;
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

  const parsedInfo = parseEntry(remote, undefined, '@');

  const url =
    'entry' in parsedInfo
      ? parsedInfo.entry
      : parsedInfo.name === remote
      ? remote
      : '';

  const zipUrl = url ? buildZipUrl(hostOptions, url) : '';

  return {
    name: parsedInfo.name || remoteAlias,
    url: url,
    zipUrl,
    apiTypeUrl: buildApiTypeUrl(zipUrl),
    alias: remoteAlias,
  };
};

const resolveRemotes = (hostOptions: Required<HostOptions>) => {
  const parsedOptions = utils.parseOptions(
    hostOptions.moduleFederationConfig.remotes || {},
    (item, key) => ({
      remote: Array.isArray(item) ? item[0] : item,
      key,
    }),
    (item, key) => ({
      remote: Array.isArray(item.external) ? item.external[0] : item.external,
      key,
    }),
  );

  return parsedOptions.reduce(
    (accumulator, item) => {
      const { key, remote } = item[1];
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
