import { Remote } from '../type';

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
    const { name, alias } = remote;
    // match pkgName
    const isNameMatched = id.startsWith(name);
    let expose = id.replace(name, '');
    if (isNameMatched) {
      expose = normalizeExpose(expose);

      return {
        pkgNameOrAlias: name,
        expose,
        remote,
      };
    }

    // match alias
    const isAliasMatched = alias && id.startsWith(alias);
    let exposeWithAlias = alias && id.replace(alias, '');
    if (alias && isAliasMatched) {
      exposeWithAlias = normalizeExpose(exposeWithAlias || '');

      return {
        pkgNameOrAlias: alias,
        expose: exposeWithAlias,
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
  // Use shared function
  return findRemoteByNameOrAlias(remotes, nameOrAlias);
}

// Function to normalize the expose string (from Candidates 19, 66)
function normalizeExpose(expose: string): string {
  if (expose.startsWith('/')) {
    expose = `.${expose}`;
  } else if (expose === '') {
    expose = '.';
  }
  return expose;
}

// Shared function to find a remote by name or alias (from Candidate 5)
function findRemoteByNameOrAlias(
  remotes: Remote[],
  nameOrAlias: string,
): Remote | undefined {
  for (const remote of remotes) {
    if (remote.name === nameOrAlias || remote.alias === nameOrAlias) {
      return remote;
    }
  }
  return undefined;
}
