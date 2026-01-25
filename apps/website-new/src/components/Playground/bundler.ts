import * as rspackAPI from '@rspack/browser';
import {
  builtinMemFs,
  experiments,
  type RspackOptions,
  rspack,
} from '@rspack/browser';
import { format } from './format';

export interface SourceFile {
  filename: string;
  text: string;
}

export interface BundleResult {
  success: boolean;
  output: SourceFile[];
  formattedOutput: SourceFile[];
  duration: number;
  errors: string[];
  warnings: string[];
}

export const RSPACK_CONFIG = 'rspack.config.js';

async function loadConfig(content: string): Promise<RspackOptions> {
  function requireRspack(name: string) {
    if (name === '@rspack/core' || name === '@rspack/browser') {
      return rspackAPI;
    }
    throw new Error(
      "Only support importing '@rspack/core' or '@rspack/browser'",
    );
  }

  const module: { exports: { default: RspackOptions } } = {
    exports: { default: {} as RspackOptions },
  };
  const exports = module.exports;

  const cjsContent = await experiments.swc.transform(content, {
    module: { type: 'commonjs' },
  });

  const wrapper = new Function('module', 'exports', 'require', cjsContent.code);
  wrapper(module, exports, requireRspack);

  const options = (exports.default || {}) as RspackOptions;

  const plugins = Array.isArray(options.plugins) ? [...options.plugins] : [];

  plugins.push(
    new rspackAPI.BrowserHttpImportEsmPlugin({
      domain: 'https://esm.sh',
      dependencyVersions: {
        react: '19.1.1',
        'react-dom': '19.1.1',
      },
      postprocess(request) {
        if (
          request.packageName ===
            '@module-federation/webpack-bundler-runtime' ||
          request.packageName === 'react-dom'
        ) {
          request.url.searchParams.set('dev', '');
        }
        request.url.searchParams.set('external', 'react');
      },
    }),
    new rspackAPI.HtmlRspackPlugin({
      template: './index.html',
    }),
  );

  options.plugins = plugins;

  const originalExperiments = options.experiments || {};
  options.experiments = {
    ...originalExperiments,
    buildHttp: {
      allowedUris: ['https://', 'http://'],
      ...(typeof originalExperiments.buildHttp === 'object'
        ? originalExperiments.buildHttp
        : {}),
    },
  };

  return options;
}

export async function bundle(files: SourceFile[]): Promise<BundleResult> {
  builtinMemFs.volume.reset();

  const inputFileJSON: Record<string, string> = {};
  for (const file of files) {
    inputFileJSON[file.filename] = file.text;
  }

  builtinMemFs.volume.fromJSON(inputFileJSON);

  const configCode = inputFileJSON[RSPACK_CONFIG];
  if (!configCode) {
    return {
      duration: 0,
      output: [],
      formattedOutput: [],
      success: false,
      errors: [`Missing ${RSPACK_CONFIG} in input files.`],
      warnings: [],
    };
  }

  let options: rspackAPI.RspackOptions;
  try {
    options = await loadConfig(configCode);
  } catch (error) {
    return {
      duration: 0,
      output: [],
      formattedOutput: [],
      success: false,
      errors: [(error as Error).message],
      warnings: [],
    };
  }

  const startTime = performance.now();

  return new Promise((resolve) => {
    rspack(options, async (err, stats) => {
      const endTime = performance.now();

      if (err) {
        resolve({
          duration: endTime - startTime,
          output: [],
          formattedOutput: [],
          success: false,
          errors: [err.message],
          warnings: [],
        });
        return;
      }

      const output: SourceFile[] = [];
      const formattedOutput: SourceFile[] = [];
      const fileJSON = builtinMemFs.volume.toJSON() as Record<
        string,
        string | undefined
      >;

      for (const [filename, text] of Object.entries(fileJSON)) {
        if (!text) {
          continue;
        }
        const filenameWithoutPrefixSlash = filename.startsWith('/')
          ? filename.slice(1)
          : filename;

        const isInputFile = Boolean(inputFileJSON[filenameWithoutPrefixSlash]);
        const isHtml = filenameWithoutPrefixSlash.endsWith('.html');
        const isManifest = filenameWithoutPrefixSlash.endsWith('.json');

        if (
          (isInputFile && !isHtml && !isManifest) ||
          filenameWithoutPrefixSlash.includes('rspack.lock')
        ) {
          continue;
        }

        const file: SourceFile = { filename: filenameWithoutPrefixSlash, text };
        output.push(file);

        if (filenameWithoutPrefixSlash.endsWith('.js')) {
          const formattedText = await format(text);
          formattedOutput.push({
            filename: filenameWithoutPrefixSlash,
            text: formattedText,
          });
        } else {
          formattedOutput.push(file);
        }
      }

      const filenameComparator = (f1: string, f2: string) =>
        f1.length !== f2.length ? f1.length - f2.length : f1.localeCompare(f2);

      output.sort((a, b) => filenameComparator(a.filename, b.filename));
      formattedOutput.sort((a, b) =>
        filenameComparator(a.filename, b.filename),
      );

      const statsJson = stats?.toJson({
        all: false,
        errors: true,
        warnings: true,
      });

      resolve({
        duration: endTime - startTime,
        output,
        formattedOutput,
        success: !statsJson?.errors || statsJson.errors.length === 0,
        errors: statsJson?.errors?.map((item) => item.message) || [],
        warnings: statsJson?.warnings?.map((warning) => warning.message) || [],
      });
    });
  });
}
