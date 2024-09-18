import {
  MANIFEST_EXT,
  parseEntry,
  ENCODE_NAME_PREFIX,
  decodeName,
} from '@module-federation/sdk';
import { utils } from '@module-federation/managers';
import { HostOptions, RemoteInfo } from '../interfaces/HostOptions';
import { validateOptions } from '../lib/utils';

const fileBase = 'file:';

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
  remoteBasePath: fileBase,
} satisfies Partial<HostOptions>;

const resolveRelativeUrl = (
  hostOptions: Required<HostOptions>,
  entryUrl: string,
  relativeFile?: string,
) => {
  let remoteUrl = new URL(entryUrl, hostOptions.remoteBasePath);
  if (relativeFile) {
    const pathnameWithoutEntry = remoteUrl.pathname
      .split('/')
      .slice(0, -1)
      .join('/');
    remoteUrl.pathname = `${pathnameWithoutEntry}/${relativeFile}`;
  }
  return remoteUrl.protocol === fileBase ? remoteUrl.pathname : remoteUrl.href;
};

const buildZipUrl = (hostOptions: Required<HostOptions>, url: string) => {
  return resolveRelativeUrl(
    hostOptions,
    url,
    `${hostOptions.remoteTypesFolder}.zip`,
  );
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

  const zipUrl = url ? buildZipUrl(hostOptions, url) : '';

  return {
    name: parsedInfo.name || remoteAlias,
    url: resolveRelativeUrl(hostOptions, url),
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
