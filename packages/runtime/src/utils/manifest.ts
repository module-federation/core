import { ModuleInfo } from '@module-federation/sdk';
import { Remote } from '../type';

export function getResourceUrl(module: ModuleInfo, sourceUrl: string): string {
  if ('getPublicPath' in module) {
    const publicPath = new Function(module.getPublicPath)();
    return `${publicPath}${sourceUrl}`;
  } else if ('publicPath' in module) {
    return `${module.publicPath}${sourceUrl}`;
  } else {
    console.warn(
      'Cannot get resource URL. If in debug mode, please ignore.',
      module,
      sourceUrl,
    );
    return '';
  }
}

// id: pkgName(@federation/app1) + expose(button) = @federation/app1/button
// id: alias(app1) + expose(button) = app1/button
// id: alias(app1/utils) + expose(loadash/sort) = app1/utils/loadash/sort
export function matchRemoteWithNameAndExpose(
  remotes: Array<Remote>,
  id: string,
):
  | {
      pkgNameOrAlias: string;
      expose: string;
      remote: Remote;
    }
  | undefined {
  for (const remote of remotes) {
    // match pkgName
    const matchNameSuccess = id.startsWith(remote.name);
    let expose = id.replace(remote.name, '');
    if (matchNameSuccess) {
      if (expose.startsWith('/')) {
        const pkgNameOrAlias = remote.name;
        expose = `.${expose}`;
        return {
          pkgNameOrAlias,
          expose,
          remote,
        };
      } else if (expose === '') {
        return {
          pkgNameOrAlias: remote.name,
          expose: '.',
          remote,
        };
      }
    }

    // match alias
    const matchAliasSuccess = remote.alias && id.startsWith(remote.alias);
    let exposeWithAlias = remote.alias && id.replace(remote.alias, '');
    if (remote.alias && matchAliasSuccess) {
      if (exposeWithAlias && exposeWithAlias.startsWith('/')) {
        const pkgNameOrAlias = remote.alias;
        exposeWithAlias = `.${exposeWithAlias}`;
        return {
          pkgNameOrAlias,
          expose: exposeWithAlias,
          remote,
        };
      } else if (exposeWithAlias === '') {
        return {
          pkgNameOrAlias: remote.alias,
          expose: '.',
          remote,
        };
      }
    }
  }

  return;
}

export function matchRemote(
  remotes: Array<Remote>,
  nameOrAlias: string,
): Remote | undefined {
  for (const remote of remotes) {
    const matchNameSuccess = nameOrAlias === remote.name;
    if (matchNameSuccess) {
      return remote;
    }

    const matchAliasSuccess = remote.alias && nameOrAlias === remote.alias;
    if (matchAliasSuccess) {
      return remote;
    }
  }
  return;
}
