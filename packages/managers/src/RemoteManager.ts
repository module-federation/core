import {
  parseEntry,
  RemoteEntryInfo,
  StatsRemote,
  composeKeyWithSeparator,
  containerReferencePlugin,
  moduleFederationPlugin,
} from '@module-federation/sdk';
import { BasicPluginOptionsManager } from './BasicPluginOptionsManager';
import { PKGJsonManager } from './PKGJsonManager';

interface NormalizedRemote {
  [remoteName: string]: RemoteEntryInfo & {
    alias: string;
    shareScope: string;
  };
}

function getEntry(
  remoteObj:
    | containerReferencePlugin.RemotesConfig
    | containerReferencePlugin.RemotesItem,
): string {
  if (typeof remoteObj === 'string') {
    return remoteObj;
  }
  if (typeof remoteObj.external === 'string') {
    return remoteObj.external;
  }
  throw new Error('Not support "array" remote value yet!');
}

class RemoteManager extends BasicPluginOptionsManager<moduleFederationPlugin.ModuleFederationPluginOptions> {
  private _normalizedOptions: NormalizedRemote = {};
  private _pkgJsonManager: PKGJsonManager = new PKGJsonManager();

  override get enable(): boolean {
    return Boolean(
      this.remotes &&
        (Array.isArray(this.remotes)
          ? this.remotes.length > 0
          : Object.keys(this.remotes).length > 0),
    );
  }

  get normalizedOptions(): NormalizedRemote {
    return this._normalizedOptions;
  }

  get statsRemoteWithEmptyUsedIn(): StatsRemote[] {
    const { name } = this.options;
    return Object.keys(this._normalizedOptions).reduce((sum, cur) => {
      const normalizedOption = this._normalizedOptions[cur];
      let curObj: StatsRemote;
      if ('entry' in normalizedOption) {
        curObj = {
          entry: normalizedOption.entry,
          alias: normalizedOption.alias,
          moduleName: normalizedOption.name,
          federationContainerName: normalizedOption.name,
          consumingFederationContainerName: name!,
          usedIn: [],
        };
      } else {
        curObj = {
          alias: normalizedOption.alias,
          moduleName: normalizedOption.name,
          version: normalizedOption.version,
          federationContainerName: normalizedOption.name,
          consumingFederationContainerName: name!,
          usedIn: [],
        };
      }
      sum.push(curObj);
      return sum;
    }, [] as StatsRemote[]);
  }

  // 'micro-app-sub3': 'app:@garfish/micro-app-sub3:0.0.4',
  // ↓↓↓
  //  {
  //   'micro-app-sub3': @garfish/micro-app-sub3:0.0.4
  // }
  get dtsRemotes(): Record<string, string> {
    return Object.keys(this._normalizedOptions).reduce((sum, remoteAlias) => {
      const remoteInfo = this._normalizedOptions[remoteAlias];
      sum[remoteAlias] = composeKeyWithSeparator(
        remoteInfo.name,
        'entry' in remoteInfo ? remoteInfo.entry : remoteInfo.version,
      );
      return sum;
    }, {});
  }

  get remotes(): moduleFederationPlugin.ModuleFederationPluginOptions['remotes'] {
    return this.options.remotes;
  }

  // only support remoteType: script now
  normalizeOptions(
    options: containerReferencePlugin.ContainerReferencePluginOptions['remotes'] = {},
  ): void {
    const type = this._pkgJsonManager.getExposeGarfishModuleType();

    this._normalizedOptions = Object.keys(options).reduce(
      (sum, remoteAlias: string) => {
        if (Array.isArray(options)) {
          return sum;
        }
        const remoteInfo = options[remoteAlias];
        if (Array.isArray(remoteInfo)) {
          return sum;
        }
        let parsedOptions;
        try {
          parsedOptions = parseEntry(
            typeof remoteInfo === 'string' ? remoteInfo : getEntry(remoteInfo),
          );
        } catch (e) {
          // noop
        }

        if (!parsedOptions) {
          return sum;
        }

        sum[remoteAlias] = {
          ...parsedOptions,
          alias: remoteAlias,
          shareScope:
            typeof remoteInfo === 'object'
              ? remoteInfo.shareScope || 'default'
              : 'default',
        };
        return sum;
      },
      {} as NormalizedRemote,
    );
  }

  override init(
    options: moduleFederationPlugin.ModuleFederationPluginOptions,
  ): void {
    this.setOptions(options);
    this.normalizeOptions(options.remotes);
  }
}

export { RemoteManager };
