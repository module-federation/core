import { ModuleInfo } from '@module-federation/sdk';
import { Remote } from '../type';

// Function to get the URL of a resource
export function getResourceUrl(module: ModuleInfo, sourceUrl: string): string {
  if ('getPublicPath' in module) {
    const publicPath = new Function(module.getPublicPath)();
    return `${publicPath}${sourceUrl}`;
  } else if ('publicPath' in module) {
    return `${module.publicPath}${sourceUrl}`;
  } else {
    console.warn(
      'Unable to retrieve resource URL. If in debug mode, this warning can be disregarded.',
      module,
      sourceUrl,
    );
    return '';
  }
}

// Function to match a remote with its name and expose
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
    const isNameMatched = id.startsWith(remote.name);
    let expose = id.replace(remote.name, '');
    if (isNameMatched) {
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
    const isAliasMatched = remote.alias && id.startsWith(remote.alias);
    let exposeWithAlias = remote.alias && id.replace(remote.alias, '');
    if (remote.alias && isAliasMatched) {
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

// Function to match a remote with its name or alias
export function matchRemote(
  remotes: Array<Remote>,
  nameOrAlias: string,
): Remote | undefined {
  for (const remote of remotes) {
    const isNameMatched = nameOrAlias === remote.name;
    if (isNameMatched) {
      return remote;
    }

    const isAliasMatched = remote.alias && nameOrAlias === remote.alias;
    if (isAliasMatched) {
      return remote;
    }
  }
  return;
}
