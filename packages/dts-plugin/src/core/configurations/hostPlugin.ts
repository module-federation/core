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
  timeout: 60000,
  typesOnBuild: false,
  family: 4,
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

  // for updated remote
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

  const remoteTypeUrls = hostOptions.remoteTypeUrls ?? {};
  if (typeof remoteTypeUrls !== 'object') {
    throw new Error('remoteTypeUrls must be consumed before resolveRemotes');
  }
  const remoteInfos = Object.keys(remoteTypeUrls).reduce(
    (sum, remoteName) => {
      const { zip, api, alias } = remoteTypeUrls[remoteName];
      sum[alias] = {
        name: remoteName,
        url: '',
        zipUrl: zip,
        apiTypeUrl: api,
        alias: alias || remoteName,
      };
      return sum;
    },
    {} as Record<string, RemoteInfo>,
  );

  return parsedOptions.reduce((accumulator, item) => {
    const { key, remote } = item[1];
    const res = retrieveRemoteInfo({
      hostOptions,
      remoteAlias: key,
      remote,
    });

    if (accumulator[key]) {
      accumulator[key] = {
        ...accumulator[key],
        name: res.name || accumulator[key].name,
        url: res.url,
        apiTypeUrl: accumulator[key].apiTypeUrl || res.apiTypeUrl,
      };
      return accumulator;
    }

    accumulator[key] = res;
    return accumulator;
  }, remoteInfos) as Record<string, RemoteInfo>;
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
