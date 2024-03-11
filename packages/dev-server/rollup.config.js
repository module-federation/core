const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');

module.exports = (rollupConfig, projectOptions) => {
  const project = projectOptions.project;
  const pkg = require(project);
  rollupConfig.plugins.push(
    replace({
      preventAssignment: true,
      __VERSION__: JSON.stringify(pkg.version),
    }),
    copy({
      targets: [
        {
          src: 'packages/dev-server/LICENSE',
          dest: 'packages/dev-server/dist',
        },
      ],
    }),
  );

  return rollupConfig;
};
