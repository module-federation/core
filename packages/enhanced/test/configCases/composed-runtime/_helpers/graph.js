const RUNTIME_FILE =
  /(?:@module-federation[\\/]|packages[\\/])(runtime-core|runtime|sdk|webpack-bundler-runtime)[\\/]dist[\\/](.+)$/;

function collect(modules, files) {
  for (const module of modules || []) {
    if (module.orphan) continue;
    const match = RUNTIME_FILE.exec(module.nameForCondition || '');
    if (match) files.add(`${match[1]}/${match[2].replace(/\\/g, '/')}`);
    collect(module.modules, files);
  }
}

// Runtime package files, as <package>/<path in dist>, that are in a chunk of the compilation.
exports.runtimeFiles = (stats) => {
  const files = new Set();
  collect(stats.modules, files);
  return [...files].sort();
};

// Capability and adapter parts, matched by path in each package's dist.
exports.PARTS = {
  compose: /^webpack-bundler-runtime\/compose\./,
  remotes: /^webpack-bundler-runtime\/adapters\/remotes\./,
  consumes: /^webpack-bundler-runtime\/adapters\/consumes\./,
  container: /^webpack-bundler-runtime\/adapters\/container\./,
  shareScope: /^webpack-bundler-runtime\/adapters\/share-scope\./,
  bundlerRuntimeIndex: /^webpack-bundler-runtime\/index\./,
  shared: /^runtime-core\/shared\/capability\./,
  remote: /^runtime-core\/remote\/capability\./,
  snapshot: /^runtime-core\/plugins\/snapshot\/capability\./,
  platform: /^runtime-core\/platform\/(web|node|universal)\./,
  platformNode: /^runtime-core\/platform\/(node|universal)\./,
  runtimeCoreIndex: /^runtime-core\/index\./,
  sdkNode: /^sdk\/node\./,
};

exports.hasPart = (files, part) =>
  files.some((file) => exports.PARTS[part].test(file));
