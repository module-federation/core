import path from 'path';

import type { Compiler } from 'webpack';

export function isDev(): boolean {
  return process.env['NODE_ENV'] === 'development';
}
export function isPrd(): boolean {
  return process.env['NODE_ENV'] === 'production';
}

export function getCompilerOutputDir(compiler: Compiler) {
  try {
    return path.relative(
      compiler.context,
      compiler.outputPath || compiler.options.output.path,
    );
  } catch (err) {
    return '';
  }
}
