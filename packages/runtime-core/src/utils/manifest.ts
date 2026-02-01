import { Remote } from '../type';

function tryMatch(
  id: string,
  prefix: string,
  remote: Remote,
): { pkgNameOrAlias: string; expose: string; remote: Remote } | undefined {
  if (!id.startsWith(prefix)) return;
  const rest = id.slice(prefix.length);
  if (rest === '') return { pkgNameOrAlias: prefix, expose: '.', remote };
  if (rest.startsWith('/'))
    return { pkgNameOrAlias: prefix, expose: `.${rest}`, remote };
  return undefined;
}

export function matchRemoteWithNameAndExpose(
  remotes: Array<Remote>,
  id: string,
): { pkgNameOrAlias: string; expose: string; remote: Remote } | undefined {
  for (const remote of remotes) {
    const byName = tryMatch(id, remote.name, remote);
    if (byName) return byName;
    if (remote.alias) {
      const byAlias = tryMatch(id, remote.alias, remote);
      if (byAlias) return byAlias;
    }
  }
  return undefined;
}

export function matchRemote(
  remotes: Array<Remote>,
  nameOrAlias: string,
): Remote | undefined {
  return remotes.find((r) => r.name === nameOrAlias || r.alias === nameOrAlias);
}
