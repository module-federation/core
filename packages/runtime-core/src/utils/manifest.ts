import { Remote } from '../type';

export function composeRemoteRequestId(
  remoteName: string,
  expose?: string,
): string {
  if (!expose || expose === '.') {
    return remoteName;
  }

  return `${remoteName}/${expose.replace(/^\.\//, '')}`;
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
    const { name } = remote;
    // Only materialize the expose after a complete name or alias matches.
    // Keep reading the live list: plugins can update remote options directly.
    if (
      id.startsWith(name) &&
      (id.length === name.length || id.charCodeAt(name.length) === 47)
    ) {
      return {
        pkgNameOrAlias: name,
        expose: `.${id.slice(name.length)}`,
        remote,
      };
    }

    const { alias } = remote;
    if (
      alias &&
      id.startsWith(alias) &&
      (id.length === alias.length || id.charCodeAt(alias.length) === 47)
    ) {
      return {
        pkgNameOrAlias: alias,
        expose: `.${id.slice(alias.length)}`,
        remote,
      };
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
