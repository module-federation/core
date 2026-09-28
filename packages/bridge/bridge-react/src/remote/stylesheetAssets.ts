import React from 'react';
import { collectSSRAssets } from '../lazy/createLazyComponent';
import { federationRuntime } from '../provider/plugin';

export function collectRemoteStylesheetHrefs(moduleName: string): string[] {
  const instance = federationRuntime.instance;
  if (!instance || !moduleName) return [];
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
