const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/rsbuild-plugin/LICENSE',
          dest: 'packages/rsbuild-plugin/dist',
        },
      ],
    }),
  );
  rollupConfig.input = {
    index: 'packages/rsbuild-plugin/src/cli/index.ts',
    utils: 'packages/rsbuild-plugin/src/utils/index.ts',
    constant: 'packages/rsbuild-plugin/src/constant.ts',
  };

  rollupConfig.output.forEach((output) => {
    output.entryFileNames = `[name].${output.format === 'esm' ? 'esm' : 'cjs'}.${
      output.format === 'esm' ? 'mjs' : 'js'
    }`;
  });

  // Mark workspace dependencies as external to avoid bundling them
  const workspaceDependencies = [
    '@module-federation/sdk',
    '@module-federation/enhanced',
    '@module-federation/node',
  ];

  if (Array.isArray(rollupConfig.external)) {
    rollupConfig.external.push(...workspaceDependencies);
  } else if (typeof rollupConfig.external === 'function') {
    const originalExternal = rollupConfig.external;
    rollupConfig.external = (id, parentId, isResolved) => {
      if (workspaceDependencies.includes(id)) {
        return true;
      }
      return originalExternal(id, parentId, isResolved);
    };
  } else {
    rollupConfig.external = workspaceDependencies;
  }

  // rollupConfig
  return rollupConfig;
};
