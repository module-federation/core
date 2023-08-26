import type { LoaderContext } from 'webpack';
import fs from 'fs';
import path from 'path';

export default function patchDefaultSharedLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string
) {
  if (content.includes('placeholderModuleEnsure')) {
    // If already patched, return
    return content;
  }

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
  import('next/dynamic');
  import('styled-jsx');
  import('styled-jsx/style');
  if (process.env['NODE_ENV'] === 'development') {
    import('react/jsx-dev-runtime');
  } else {
    import('react/jsx-runtime');
  }
};`;
  return ['', patch, content].join('\n');
}
