import { AsyncContainer } from '@module-federation/utilities';

import { rewriteShareScope, setUpkgModule } from './share-scope';

export const resolveModuleContainer = async (
  asyncContainer: AsyncContainer
) => {
  const container = await asyncContainer;

  return {
    get: container.get,
    init: (shareScope: typeof __webpack_share_scopes__) => {
      return container.init(
        new Proxy(shareScope, {
          get(target: typeof __webpack_share_scopes__, prop: string) {
            return target[prop];
          },
          set(target, property: string, value) {
            for (const version in target) {
              const versions = target[version];
              target[version] = rewriteShareScope(
                version,
                Object.keys(versions)
              );
            }

            if (target[property]) {
              return true;
            }

            // This sets the package to fetch from NPM,
            // in the event the package is missing from bundle
            target[property] = new Proxy(value, {
              get(target, prop) {
                return setUpkgModule(property, prop as string);
              },
              set(target, prop, value) {
                target[prop] = value;
                return true;
              },
            });

            return true;
          },
        })
      );
    },
  };
};
