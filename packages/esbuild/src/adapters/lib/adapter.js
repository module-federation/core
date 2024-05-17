import esbuild from 'esbuild';
import { rollup } from 'rollup';
import pluginNodeResolve from '@rollup/plugin-node-resolve';
import { externals as rollupPluginNodeExternals } from 'rollup-plugin-node-externals';
import fs from 'fs';
import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
export { getExports, resolve } from './collect-exports';
export { moduleFederationPlugin } from './plugin';
import { createVirtualShareModule } from './plugin';

export function createEsBuildAdapter(config) {
  if (!config.compensateExports) {
    config.compensateExports = [new RegExp('/react/')];
  }
  return async (options) => {
    const {
      entryPoints,
      external,
      outdir,
      hash,
      packageInfos,
      name,
      plugins = [],
    } = options;
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
          name,
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
      entryNames: '[name]',
      external,
      loader: config.loader,
      bundle: true,
      splitting: true,
      sourcemap: options.dev,
      minify: !options.dev,
      format: 'esm',
      target: ['esnext'],
      plugins: [...config.plugins, ...plugins],
      metafile: true,
      define: {
        MF_CURRENT_HOST: JSON.stringify(name),
      },
    });

    const result = await ctx.rebuild();

    result.outputFiles = result.outputFiles.reduce((acc, file, index) => {
      const sharedPack = packageInfos ? packageInfos[index] : null;
      if (!sharedPack) {
        acc.push(file);
        return acc;
      }
      const fileName = path.basename(file.path);
      const filePath = path.join(outdir, fileName);
      const relative = path.relative(process.cwd(), file.path);
      const metadata = result.metafile.outputs[relative];

      const replc = filePath.replace(filePath, 'mf_' + fileName);
      acc.push({ ...file, path: replc });

      const vm = createVirtualShareModule(
        name,
        sharedPack.packageName,
        metadata.exports,
      );
      acc.push({ ...file, contents: vm });

      return acc;
    }, []);

    const writtenFiles = writeResult(result, outdir);
    ctx.dispose();
    return writtenFiles.map((fileName) => ({ fileName }));
  };
}

function writeResult(result, outdir) {
  const outputFiles = result.outputFiles || [];
  const writtenFiles = [];
  for (const outFile of outputFiles) {
    const fileName = path.basename(outFile.path);
    const filePath = path.join(outdir, fileName);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, outFile.contents);
    writtenFiles.push(filePath);
  }
  return writtenFiles;
}

async function prepareNodePackage(
  entryPoint,
  external,
  tmpFolder,
  config,
  dev,
  name,
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
          MF_CURRENT_HOST: JSON.stringify(name),
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
