import type { LoaderContext } from 'webpack';
import fs from 'fs';
import path from 'path';

/**
 *
 * Requires `include-defaults.js` with required shared libs
 *
 */
export default function patchDefaultSharedLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string
) {
  if (content.includes('include-defaults')) {
    // If already patched, return
    return content;
  }

  // avoid absolute paths as they break hashing when the root for the project is moved
  // @see https://webpack.js.org/contribute/writing-a-loader/#absolute-paths
  const pathIncludeDefaults = path.relative(
    this.context,
    path.resolve(__dirname, '../include-defaults.js')
  );
  const patch = `
(globalThis || self).placeholderModuleEnsure = () => {
  import('react');
  import('react/jsx-runtime');
  import('react-dom');
  import('next/link');
  import('next/router');
  import('next/head');
  import('next/script');
  import('next/dynamic');
  import('styled-jsx');
  import('styled-jsx/style');
};
if (process.env['NODE_ENV'] === 'development') {
  import('react/jsx-dev-runtime');
}`;
  return ['', patch, content].join('\n');
}
