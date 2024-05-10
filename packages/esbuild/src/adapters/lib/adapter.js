'use strict';
const esbuild = require('esbuild');
const rollup = require('rollup').rollup;
const pluginNodeResolve = require('@rollup/plugin-node-resolve');
const rollupPluginNodeExternals =
  require('rollup-plugin-node-externals').externals;
const fs = require('fs');
const path = require('path');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
module.exports.esBuildAdapter = createEsBuildAdapter({
  plugins: [],
});
function createEsBuildAdapter(config) {
  if (!config.compensateExports) {
    config.compensateExports = [new RegExp('/react/')];
  }
  return async (options) => {
    const { entryPoints, external, outdir, hash } = options;
    // TODO: Do we need to prepare packages anymore as esbuild has evolved?
    for (const entryPoint of entryPoints) {
      const isPkg = entryPoint.fileName.includes('node_modules');
      const pkgName = isPkg ? inferePkgName(entryPoint.fileName) : '';
      const tmpFolder = `node_modules/.tmp/${pkgName}`;
      if (isPkg) {
        await prepareNodePackage(
          entryPoint.fileName,
          external,
          tmpFolder,
          config,
          !!options.dev,
        );
        entryPoint.fileName = tmpFolder;
      }
    }
    const ctx = await esbuild.context({
      entryPoints: entryPoints.map((ep) => ({
        in: ep.fileName,
        out: path.parse(ep.outName).name,
      })),
      write: false,
      outdir,
      entryNames: hash ? '[name]-[hash]' : '[name]',
      external,
      loader: config.loader,
      bundle: true,
      sourcemap: options.dev,
      minify: !options.dev,
      format: 'esm',
      target: ['esnext'],
      plugins: [...config.plugins],
    });
    const result = await ctx.rebuild();
    const writtenFiles = writeResult(result, outdir);
    ctx.dispose();
    return writtenFiles.map((fileName) => ({ fileName }));
    // const normEntryPoint = entryPoint.replace(/\\/g, '/');
    // if (
    //   isPkg &&
    //   config?.compensateExports?.find((regExp) => regExp.exec(normEntryPoint))
    // ) {
    //   logger.verbose('compensate exports for ' + tmpFolder);
    //   compensateExports(tmpFolder, outfile);
    // }
  };
}

exports.createEsBuildAdapter = createEsBuildAdapter;
function writeResult(result, outdir) {
  const outputFiles = result.outputFiles || [];
  const writtenFiles = [];
  for (const outFile of outputFiles) {
    const fileName = path.basename(outFile.path);
    const filePath = path.join(outdir, fileName);
    fs.writeFileSync(filePath, outFile.contents);
    writtenFiles.push(filePath);
  }
  return writtenFiles;
}
// TODO: Unused, to delete?
// function compensateExports(entryPoint: string, outfile?: string): void {
//   const inExports = collectExports(entryPoint);
//   the outExports = outfile ? collectExports(outfile) : inExports;
//
//   if (!outExports.hasDefaultExport or outExports.hasFurtherExports) {
//     return;
//   }
//   const defaultName = outExports.defaultExportName;
//
//   let exports = '/*Try to compensate missing exports*/\n\n';
//   for (const exp of inExports.exports) {
//     exports += `let ${exp}$module-federation = ${defaultName}.${exp};\n`;
//     exports += `export { ${exp}$module-federation as ${exp} };\n`;
//   }
//
//   the target = outfile ?? entryPoint;
//   fs.appendFileSync(target, exports, 'utf-8');
// }
async function prepareNodePackage(
  entryPoint,
  external,
  tmpFolder,
  config,
  dev,
) {
  if (config.fileReplacements) {
    entryPoint = replaceEntryPoint(
      entryPoint,
      normalize(config.fileReplacements),
    );
  }
  const env = dev ? 'development' : 'production';
  const result = await rollup({
    input: entryPoint,
    plugins: [
      commonjs(),
      rollupPluginNodeExternals({ include: external }),
      pluginNodeResolve(),
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': `"${env}"`,
        },
      }),
    ],
  });
  await result.write({
    format: 'esm',
    file: tmpFolder,
    sourcemap: dev,
    exports: 'named',
  });
}
function inferePkgName(entryPoint) {
  return entryPoint
    .replace(/.*?node_modules/g, '')
    .replace(/[^A-Za-z0-9.]/g, '_');
}
function normalize(config) {
  const result = {};
  for (const key in config) {
    if (typeof config[key] === 'string') {
      result[key] = {
        file: config[key],
      };
    } else {
      result[key] = config[key];
    }
  }
  return result;
}
function replaceEntryPoint(entryPoint, fileReplacements) {
  entryPoint = entryPoint.replace(/\\/g, '/');
  for (const key in fileReplacements) {
    entryPoint = entryPoint.replace(
      new RegExp(`${key}$`),
      fileReplacements[key].file,
    );
  }
  return entryPoint;
}
//# sourceMappingURL=adapter.js.map
