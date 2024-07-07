const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [{ src: 'packages/sdk/LICENSE', dest: 'packages/sdk/dist' }],
    }),
  );
  rollupConfig.plugins.push({
    name: 'custom-dynamic-import',
    renderDynamicImport({ moduleId }) {
      if (moduleId.endsWith('node.ts')) {
        return { left: 'import(', right: ')' };
      }
    },
  });

  return rollupConfig;
};
