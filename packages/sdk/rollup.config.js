const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, _projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [{ src: 'packages/sdk/LICENSE', dest: 'packages/sdk/dist' }],
    }),
  );
  console.log(rollupConfig);
  rollupConfig.plugins.push({
    name: 'custom-dynamic-import',
    renderDynamicImport({ moduleId }) {
      console.log(moduleId);
      if (moduleId.endsWith('loadConfigFile.ts')) {
        return { left: 'import(', right: ')' };
      }
    },
  });

  return rollupConfig;
};
