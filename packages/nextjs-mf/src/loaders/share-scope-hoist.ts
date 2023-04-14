import type { LoaderContext } from 'webpack';
import path from 'path';

/**
 *
 * Requires either the default delegate module or a custom one
 *
 */
export default function patchDefaultSharedLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string
) {
  const { shared } = this.getOptions() as Record<string, string>;

  if (content.includes('hasShareHoist')) {
    return content;
  }
  let shareScopes = '';
  let eagerShared = {
    scope: '',
    sideload: '',
  };
  if (shared) {
    // @ts-ignore
    eagerShared = Object.entries(shared).reduce(
      (acc, sharedPackage) => {
        const name = sharedPackage[0];
        const params = sharedPackage[1];

        // @ts-ignore
        // @ts-ignore
        if (
          //@ts-ignore
          params.eager === true &&
          // @ts-ignore
          (params.import ? !params.import.startsWith('!!') : true)
        ) {
          //@ts-ignore
          acc.scope += `
       ${JSON.stringify(name)}: {
         "0": {
          eager: true,
          loaded: true,
          get: () => () => require(${JSON.stringify("!!" + name + "?pop")}),
        }
        },`;
          acc.sideload += `
      console.log('sideloading ${name}');

      __webpack_modules__[require.resolveWeak(${JSON.stringify(
        name
      )})] = __webpack_modules__[require.resolveWeak(${JSON.stringify(
            '!!' + name + '?pop'
          )})];
      `;
        }
        return acc;
      },
      { scope: '', sideload: '' }
    );

    shareScopes =
      `
  const eager = {` +
      eagerShared.scope +
      `};
  __webpack_share_scopes__.default = __webpack_share_scopes__.default || {};
  Object.assign(__webpack_share_scopes__.default || {}, eager);
  `;
  }

  return [
    "console.log('initializing internal-module-hoist for:', __webpack_runtime_id__)",
    shareScopes,
    eagerShared.sideload,
    '//hasShareHoist',
    content,
  ].join('\n');
}
