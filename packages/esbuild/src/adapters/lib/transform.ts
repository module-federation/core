import * as esbuild from 'esbuild';
import * as path from 'path';

interface TransformInput {
  code: string;
  importMap?: string;
  filename: string;
  target?: string;
}

const targets: Record<string, esbuild.BuildOptions['target']> = {
  esnext: 'esnext',
  es2015: 'es2015',
  es2016: 'es2016',
  es2017: 'es2017',
  es2018: 'es2018',
  es2019: 'es2019',
  es2020: 'es2020',
  es2021: 'es2021',
  es2022: 'es2022',
};

export async function transform(input: TransformInput): Promise<string> {
  let target: esbuild.BuildOptions['target'] = 'esnext';
  if (input.target && targets[input.target]) {
    target = targets[input.target];
  } else if (input.target) {
    throw new Error('<400> invalid target');
  }

  let loader: esbuild.Loader = 'js';
  const extname = path.extname(input.filename);
  switch (extname) {
    case '.jsx':
      loader = 'jsx';
      break;
    case '.ts':
      loader = 'ts';
      break;
    case '.tsx':
      loader = 'tsx';
      break;
  }

  const imports: Record<string, string> = {};
  const trailingSlashImports: Record<string, string> = {};
  let jsxImportSource = '';

  if (input.importMap) {
    const im = JSON.parse(input.importMap);
    if (im.imports) {
      for (const [key, value] of Object.entries(im.imports)) {
        if (typeof value === 'string' && value !== '') {
          if (key.endsWith('/')) {
            trailingSlashImports[key] = value;
          } else {
            if (key === '@jsxImportSource') {
              jsxImportSource = value;
            }
            imports[key] = value;
          }
        }
      }
    }
  }

  const onResolver = (args: esbuild.OnResolveArgs): esbuild.OnResolveResult => {
    let resolvedPath = args.path;
    if (imports[resolvedPath]) {
      resolvedPath = imports[resolvedPath];
    } else {
      for (const [key, value] of Object.entries(trailingSlashImports)) {
        if (resolvedPath.startsWith(key)) {
          resolvedPath = value + resolvedPath.slice(key.length);
          break;
        }
      }
    }
    return { path: resolvedPath, external: true };
  };

  const stdin: esbuild.StdinOptions = {
    contents: input.code,
    resolveDir: '/',
    sourcefile: input.filename,
    loader: loader,
  };

  const jsx = jsxImportSource ? 'automatic' : 'transform';

  const opts: esbuild.BuildOptions = {
    outdir: '/esbuild',
    stdin: stdin,
    platform: 'browser',
    format: 'esm',
    target: target,
    jsx: jsx,
    jsxImportSource: jsxImportSource,
    bundle: true,
    treeShaking: false,
    minifyWhitespace: false,
    minifySyntax: false,
    write: false,
    plugins: [
      {
        name: 'resolver',
        setup(build) {
          build.onResolve({ filter: /.*/ }, onResolver);
        },
      },
    ],
  };

  const ret = await esbuild.build(opts);
  if (ret.errors.length > 0) {
    throw new Error('<400> failed to validate code: ' + ret.errors[0].text);
  }
  if (!ret.outputFiles || ret.outputFiles.length === 0) {
    throw new Error('<400> failed to validate code: no output files');
  }
  return ret.outputFiles[0].text;
}
