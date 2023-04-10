import type { LoaderContext } from 'webpack';
import path from 'path';


// __webpack_share_scopes__.default = __webpack_share_scopes__.default || {
//   ...__webpack_share_scopes__.default,
//   'react':{
//     ['0'] : {
//       get: () =>()=> require('!!react?pop'),
//       eager:true,
//       loaded:true
//     }
//   },
//   'react-dom':{
//     ['0'] : {
//       get: () =>()=> require('!!react-dom?pop'),
//       eager:true,
//       loaded:true
//     }
//   }
// }
/**
 *
 * Requires either the default delegate module or a custom one
 *
 */
export default function patchDefaultSharedLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string
) {
  const { delegates, shared } = this.getOptions() as Record<string, string>;

  const resolvedDelegates = Object.values(delegates).map((delegate) => {
    const [request, query] = delegate.replace('internal ', '').split('?');
    if (query) {
      const queries = [];
      for (const [key, value] of new URLSearchParams(query).entries()) {
        queries.push(`${key}=${value}`);
      }
      const delegatePath = this.utils.contextify(
        this.context,
        this.utils.absolutify(this._compiler?.context || '', request) +
          '?' +
          queries.join('&')
      );
      return delegatePath;
    } else {
      const delegatePath = this.utils.contextify(
        this.context,
        this.utils.absolutify(this._compiler?.context || '', request)
      );
      return delegatePath;
    }
  });

  if (
    content.includes('hasDelegateMarkers')
    // || (this._compilation && this._compilation.name === 'ChildFederationPlugin')
  ) {
    return content;
  }
  let shareScopes='';
  let eagerShared = {
    scope: '',
    sideload: ''
  }
  if(shared) {

    // @ts-ignore
     eagerShared = Object.entries(shared).reduce((acc, sharedPackage) => {
      const name = sharedPackage[0];
      const params = sharedPackage[1];
      //@ts-ignore
      if (params.eager === true) {
        //@ts-ignore
        acc.scope += `
       ${JSON.stringify(name)}: {
         "0": {
          eager: true,
          loaded: true,
          get: () => () => require(${JSON.stringify("!!" + name + "?pop")}),
        }
        },`
        acc.sideload += `
      console.log('sideloading ${name}');
      __webpack_modules__[require.resolveWeak(${JSON.stringify(name)})] = __webpack_modules__[require.resolveWeak(${JSON.stringify("!!" + name + "?pop")})];
      `
      }
      return acc
    }, {scope: '', sideload: ''});

    console.log(eagerShared);

     shareScopes = `
  const eager = {` + eagerShared.scope + `};
  __webpack_share_scopes__.default = __webpack_share_scopes__.default || Object.assign(__webpack_share_scopes__.default || {}, eager);
  `;
  }

  const requiredDelegates = resolvedDelegates.map((delegate) => {
    return `require('${delegate}')`;
  });

  return ['console.log("console.log(\'initializing internal-module-hoist for:\', __runtime_id__)")',shareScopes,eagerShared.sideload, ...requiredDelegates, '//hasDelegateMarkers', content].join('\n');
}
