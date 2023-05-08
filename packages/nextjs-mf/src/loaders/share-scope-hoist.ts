import type { LoaderContext } from 'webpack';

interface EagerShared {
  scope: string;
  sideload: string;
}

/**
 * Requires either the default delegate module or a custom one
 */
export default function patchDefaultSharedLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string
) {
  if (content.includes('hasShareHoist')) {
    return content;
  }

  const { shared } = this.getOptions() as Record<string, any>;
  const eagerShared: EagerShared = buildEagerShared(shared);

  const shareScopes = buildShareScopes(eagerShared.scope);

  const result = [
    //  "console.log('initializing internal-module-hoist for:', __webpack_runtime_id__)",
    // shareScopes,
    // eagerShared.sideload,
    '//hasShareHoist',
    content,
  ].join('\n');

  // Cache the generated result
  this.cacheable?.();

  return result;
}

function buildEagerShared(shared: Record<string, any>): EagerShared {
  if (!shared) {
    return { scope: '', sideload: '' };
  }

  return Object.entries(shared).reduce(
    (acc: EagerShared, [name, params]) => {
      if (params.eager === true && params.import === false) {
        acc.scope += `
        ${JSON.stringify(name)}: {
          "0": {
            eager: true,
            loaded: true,
            get: () => () => require(${JSON.stringify('!!' + name + '?pop')}),
          }
        },`;
        acc.sideload += `
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
}

function buildShareScopes(eagerSharedScope: string): string {
  return `
  const eager = {${eagerSharedScope}};
  Object.assign(__webpack_share_scopes__.default || {}, eager);
  `;
}
