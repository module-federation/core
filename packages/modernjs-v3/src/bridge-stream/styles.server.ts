import React from 'react';
import { collectSSRAssets } from '@module-federation/bridge-react';
import type { ModuleFederation } from '@module-federation/runtime';

/** Reuse Bridge's manifest resolution, including asynchronous route CSS. */
export function bridgeStylesheets(
  moduleName: string,
  instance: ModuleFederation | null,
) {
  return collectSSRAssets({
    id: moduleName,
    instance,
    injectLink: true,
    injectScript: false,
  })
    .filter(
      (asset): asset is React.ReactElement<{ href: string }> =>
        React.isValidElement(asset) && asset.type === 'link',
    )
    .map((asset) => asset.props.href);
}
