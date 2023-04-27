import type { LoaderContext } from 'webpack';
/**
 *
 * Requires either the default delegate module or a custom one
 *
 */
module.exports = function patchDefaultSharedLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string
) {
  const isRouter = this.remainingRequest.includes('router.js');
  // console.log(this.remainingRequest);
  if (content.includes('hasMerkersOfInj')) {
    return content;
  }

  return `
//hasMerkersOfInj
await import('react');
export default await import(${JSON.stringify(this.remainingRequest)});`;

  return `
//hasMerkersOfInj
  module.exports = Promise.resolve(window._N_E).then((router)=>{
  if(!window.next && router.default){
  console.log(window.next);
  window.next.router = router
   }
console.log('resolving router', window._N_E, router);

  return import(${JSON.stringify(this.remainingRequest)}).then((mod) => {
  console.log('mounting router', window._N_E, module.id);

    return mod.default || mod;
  });
  });
  `;

  return `Promise.resolve(__webpack_init_sharing__('default')).then(async ()=>{
  await import('react');
  console.log('loading react before pushing page callback');
  ${content}
  })`;

  return content;
};
