import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { getFederationGlobalScope } from './utils';
import type RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import { NormalizedRuntimeInitOptionsWithOutShared } from '../../../types/runtime';
import type { RemoteInfos } from '@module-federation/webpack-bundler-runtime';

const { Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

function getFederationGlobal(
  template: typeof Template,
  runtimeGlobals: typeof RuntimeGlobals,
  matcher: string | boolean,
  rootOutputDir: string | undefined,
  initOptionsWithoutShared: NormalizedRuntimeInitOptionsWithOutShared,
): string {
  const federationGlobal = getFederationGlobalScope(runtimeGlobals);
  const initOptionsStrWithoutShared = JSON.stringify({
    ...initOptionsWithoutShared,
    remotes: initOptionsWithoutShared.remotes.filter(
      (remote) => remote.externalType === 'script',
    ),
  });
  const remoteInfos = JSON.stringify(
    initOptionsWithoutShared.remotes.reduce((acc, remote) => {
      const item: RemoteInfos[string][0] = {
        alias: remote.alias || '',
        name: remote.name,
        // @ts-ignore
        entry: remote.entry || '',
        // @ts-ignore
        shareScope: remote.shareScope,
        externalType: remote.externalType,
      };
      const key = remote.name || remote.alias || '';
      acc[key] ||= [];
      acc[key].push(item);
      return acc;
    }, {} as RemoteInfos),
  );

  return template.asString([
    `if(!${federationGlobal}){`,
    template.indent([
      `${federationGlobal} = {`,
      template.indent([
        `initOptions: ${initOptionsStrWithoutShared},`,
        `chunkMatcher: function(chunkId) {return ${matcher}},`,
        `rootOutputDir: ${JSON.stringify(rootOutputDir || '')},`,
        `bundlerRuntimeOptions: { remotes: { remoteInfos: ${remoteInfos}, webpackRequire: ${runtimeGlobals.require},idToRemoteMap: {}, chunkMapping: {},idToExternalAndNameMapping: {} } }`,
      ]),
      '};',
    ]),
    `${runtimeGlobals.require}.consumesLoadingData = {}`,
    `${runtimeGlobals.require}.remotesLoadingData = {}`,
    '}',
  ]);
}

export default getFederationGlobal;
