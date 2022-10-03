import {createElement} from "react";
import Head from 'next/head';
export { extractUrlAndGlobal, injectScript } from '@module-federation/utilities';

export const revalidate = () => {
  if(typeof window !== 'undefined') {
    console.error('revalidate should only be called server-side');
    return Promise.resolve(false);
  }
  // @ts-ignore
  return import('@module-federation/node/utils').then((utils) => {
    return utils.revalidate();
  })
}


export const FlushedChunksHead = (props: { chunks: string[]; }) => {
  const chunks = props.chunks || [];
  const scripts = chunks.filter((c) => c.endsWith('.js')).map((chunk) => {
    return /*#__PURE__*/createElement("script", {
      key: chunk,
      src: chunk,
      async: true
    });
  });
  const css = chunks.filter((c) => c.endsWith('.css')).map((chunk) => {
    return /*#__PURE__*/createElement("link", {
      key: chunk,
      href: chunk,
      rel: "stylesheet"
    });
  });
  return /*#__PURE__*/createElement(Head, null, scripts, css);
};
