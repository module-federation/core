const copy = require('rollup-plugin-copy');
const { rollup } = require('rollup');
const swc = require('@rollup/plugin-swc');
const cleanup = require('rollup-plugin-cleanup');
const fs = require('fs');
module.exports = (rollupConfig, projectOptions) => {
  rollupConfig.plugins.push(
    copy({
      targets: [
        {
          src: 'packages/webpack-bundler-runtime/LICENSE',
          dest: 'packages/webpack-bundler-runtime/dist',
        },
      ],
    }),
  );

  const currentPlugins = Array.from(
    rollupConfig.plugins.filter(
      (p) =>
        p.name !== 'nx-swc' &&
        p.name !== 'dts-bundle' &&
        p.name !== 'peer-deps-external',
    ),
  );
  currentPlugins.push(
    swc({
      swc: {
        jsc: {
          parser: {
            syntax: 'typescript',
            jsx: false,
            dynamicImport: true,
            privateMethod: false,
            functionBind: false,
            exportDefaultFrom: false,
            exportNamespaceFrom: false,
            decorators: false,
            decoratorsBeforeExport: false,
            topLevelAwait: false,
            importMeta: false,
            preserveAllComments: false,
          },
          transform: null,
          target: rollupConfig.output.format === 'cjs' ? 'es5' : 'es2020',
          loose: false,
          externalHelpers: true,
          // Requires v1.2.50 or upper and requires target to be es2016 or upper.
          keepClassNames: false,
          minify: {
            compress: false,
            format: {
              comments: false,
            },
          },
        },
        env: null,
        minify: false,
      },
    }),
  );
  // Custom plugin to add a new child compile
  rollupConfig.plugins.push({
    name: 'child-compile',
    buildEnd: async () => {
      const childConfig = {
        ...rollupConfig,
        input: projectOptions.main,
        output: {
          file:
            projectOptions.outputPath +
            `/vendored.${rollupConfig.output.format}.js`,
          format: rollupConfig.output.format,
        },
        plugins: currentPlugins,
        external: [/@swc/],
      };
      const bundle = await rollup(childConfig);
      await bundle.write(childConfig.output);
      let content = fs.readFileSync(
        projectOptions.outputPath +
          `/vendored.${rollupConfig.output.format}.js`,
        'utf-8',
      );
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');
      fs.writeFileSync(projectOptions.outputPath + '/vendored.js', content);
    },
  });

  return rollupConfig;
};
