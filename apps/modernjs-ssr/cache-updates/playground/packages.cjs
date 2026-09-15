// Materialize workspace MF build outputs under node_modules, like a consumer
// installation. Otherwise the static graph correctly treats linked package
// sources outside node_modules as application code with dynamic runtime calls.
const fs = require('node:fs/promises');
const path = require('node:path');
const { createRequire } = require('node:module');
module.exports = async (installed, root) => {
  if (process.env.SSR_CACHE_PACKAGES_ROOT) return installed;
  const target = path.join(root, 'packages');
  const modules = path.join(target, 'node_modules');
  await fs.mkdir(modules, { recursive: true });
  await fs.writeFile(path.join(target, 'package.json'), '{"private":true}');
  const copied = new Map();
  async function link(from, to) {
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.symlink(from, to).catch((e) => {
      if (e.code !== 'EEXIST') throw e;
    });
  }
  async function copy(name, source) {
    if (copied.has(name)) return copied.get(name);
    const output = path.join(modules, name);
    copied.set(name, output);
    await fs.cp(source, output, {
      recursive: true,
      filter: (file) =>
        !path.relative(source, file).split(path.sep).includes('node_modules'),
    });
    const metadata = JSON.parse(
      await fs.readFile(path.join(source, 'package.json')),
    );
    const resolve = createRequire(path.join(source, 'package.json'));
    for (const dependency of Object.keys({
      ...metadata.dependencies,
      ...metadata.peerDependencies,
    })) {
      const candidate = (resolve.resolve.paths(dependency) || [])
        .map((base) => path.join(base, dependency))
        .find((base) =>
          require('node:fs').existsSync(path.join(base, 'package.json')),
        );
      if (!candidate) continue;
      const sourceDir = await fs.realpath(candidate);
      const depTarget = dependency.startsWith('@module-federation/')
        ? await copy(dependency, sourceDir)
        : sourceDir;
      await link(depTarget, path.join(output, 'node_modules', dependency));
    }
    return output;
  }
  for (const scope of await fs.readdir(path.join(installed, 'node_modules'))) {
    if (scope.startsWith('.')) continue;
    const names = scope.startsWith('@')
      ? (await fs.readdir(path.join(installed, 'node_modules', scope))).map(
          (n) => scope + '/' + n,
        )
      : [scope];
    for (const name of names) {
      const source = await fs.realpath(
        path.join(installed, 'node_modules', name),
      );
      if (name.startsWith('@module-federation/')) await copy(name, source);
      else await link(source, path.join(modules, name));
    }
  }
  await fs.writeFile(
    path.join(target, 'workspace-packages.json'),
    JSON.stringify([...copied.keys()], null, 2),
  );
  return target;
};
