import {
  parseEntry,
  ENCODE_NAME_PREFIX,
  decodeName,
} from '@module-federation/sdk';
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
  runtimePkgs: [],
  remoteTypeUrls: {},
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

export const retrieveRemoteInfo = (options: {
  hostOptions: Required<HostOptions>;
  remoteAlias: string;
  remote: string;
}): RemoteInfo => {
  const { hostOptions, remoteAlias, remote } = options;
  const { remoteTypeUrls } = hostOptions;
  let decodedRemote = remote;
  if (decodedRemote.startsWith(ENCODE_NAME_PREFIX)) {
    decodedRemote = decodeName(decodedRemote, ENCODE_NAME_PREFIX);
  }

  const parsedInfo = parseEntry(decodedRemote, undefined, '@');

  const url =
    'entry' in parsedInfo
      ? parsedInfo.entry
      : parsedInfo.name === decodedRemote
        ? decodedRemote
        : '';

  let zipUrl = '';
  let apiTypeUrl = '';
  const name = parsedInfo.name || remoteAlias;
  if (typeof remoteTypeUrls === 'object' && remoteTypeUrls[name]) {
    zipUrl = remoteTypeUrls[name].zip;
    apiTypeUrl = remoteTypeUrls[name].api;
  }
  if (!zipUrl && url) {
    zipUrl = buildZipUrl(hostOptions, url);
  }

  if (!apiTypeUrl && zipUrl) {
    apiTypeUrl = buildApiTypeUrl(zipUrl);
  }

  return {
    name,
    url: url,
    zipUrl,
    apiTypeUrl,
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
