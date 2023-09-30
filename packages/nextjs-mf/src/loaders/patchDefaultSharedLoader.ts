import type { LoaderContext } from 'webpack';
import fs from 'fs';
import path from 'path';

/**
 * This function patches the default shared loader.
 * It checks if the content includes 'placeholderModuleEnsure', if it does, it returns the content as is.
 * If not, it adds a patch and returns the patched content.
 *
 * @param {LoaderContext<Record<string, unknown>>} this - The loader context.
 * @param {string} content - The content to be patched.
 * @returns {string} The patched content.
 */
export default function patchDefaultSharedLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string,
) {
  if (content.includes('placeholderModuleEnsure')) {
    // If already patched, return
    return content;
  }

  // The patch to be added if 'placeholderModuleEnsure' is not found in the content
  const patch = `
  "use client";
(globalThis || self).placeholderModuleEnsure = () => {
throw new Error('should not exec');
  import('react');
  import('react-dom');
  import('next/link');
  import('next/router');
  import('next/head');
  import('next/script');
  import('next/image');
  import('next/dynamic');
  import('styled-jsx');
  import('styled-jsx/style');
  if (process.env['NODE_ENV'] === 'development') {
    import('react/jsx-dev-runtime');
  } else {
    import('react/jsx-runtime');
  }
};`;
  // Return the patched content
  return ['', patch, content].join('\n');
}
