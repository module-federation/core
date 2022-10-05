import * as React from "react";
export { extractUrlAndGlobal, injectScript } from '@module-federation/utilities';
// @ts-ignore
export {flushChunks} from '@module-federation/node/utils';

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

//@ts-ignore
export const FlushedChunks = ({ chunks })=>{
  //@ts-ignore
  const scripts = chunks.filter((c)=>c.endsWith(".js")).map((chunk)=>/*#__PURE__*/ React.createElement("script", {
    src: chunk,
    async: true
  }, null));
  return scripts;
};
FlushedChunks.defaultProps = {
  chunks: []
};
