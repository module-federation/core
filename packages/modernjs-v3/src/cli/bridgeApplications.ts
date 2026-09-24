import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { AppTools, CliPlugin } from '@modern-js/app-tools';
import type { InternalModernPluginOptions } from '../types';

export function applicationEntrySource(entryName: string, server: boolean) {
  const registry = JSON.stringify(`@modern-js/runtime/registry/${entryName}`);
  return server
    ? `import ${registry};
import { renderApplication } from '@modern-js/runtime/application/server';
import { createModernServerBridge } from '@module-federation/modern-js-v3/bridge/application';
export default createModernServerBridge({ renderApplication });
`
    : `import ${registry};
import { createApplication } from '@modern-js/runtime/application';
import { createModernBrowserBridge } from '@module-federation/modern-js-v3/bridge/application';
export default createModernBrowserBridge({ createApplication });
`;
}

type PluginAPI = Parameters<NonNullable<CliPlugin<AppTools>['setup']>>[0];

export function configureBridgeApplications(
  api: PluginAPI,
  options: InternalModernPluginOptions,
) {
  const bridge = options.originPluginOptions.bridge;
  if (!bridge) return;
  const config = api.getConfig();
  if (!config.server?.ssr || options.originPluginOptions.ssr === false) {
    throw new Error(
      'Independent Bridge SSR requires server.ssr and MF SSR to be enabled.',
    );
  }
  const exposes = typeof bridge === 'object' ? bridge.exposes || {} : {};
  const { appDirectory, internalDirectory } = api.getAppContext();
  const requireFromApp = createRequire(path.join(appDirectory, 'package.json'));
  const generatedDirectory = path.join(internalDirectory, 'mf-bridge');
  const entries = Object.entries(exposes).map(([expose, entry]) => {
    if (!expose.startsWith('./'))
      throw new Error(`Bridge expose must start with ./ : ${expose}`);
    const stem = Buffer.from(expose).toString('hex');
    return {
      expose,
      entry,
      browser: path.join(generatedDirectory, `${stem}.js`),
      server: path.join(generatedDirectory, `${stem}.server.js`),
    };
  });
  for (const [target, server] of [
    [options.csrConfig, false],
    [options.ssrConfig, true],
  ] as const) {
    if (!target) continue;
    if (Array.isArray(target.exposes))
      throw new Error(
        'Bridge application exposes require an object MF exposes configuration.',
      );
    target.exposes ||= {};
    for (const entry of entries) {
      if (entry.expose in target.exposes)
        throw new Error(`Duplicate Bridge expose: ${entry.expose}`);
      target.exposes[entry.expose] = server ? entry.server : entry.browser;
    }
    // Each application owns its renderer. Sharing these packages would defeat
    // the independent-root contract, including on the Node target.
    const shared = target.shared;
    const forbidden = (name: string) =>
      /^(react($|\/)|react-dom($|\/)|react-router($|-dom|\/)|@modern-js\/runtime($|\/))/.test(
        name,
      );
    const names = Array.isArray(shared)
      ? shared.flatMap((item) =>
          typeof item === 'string' ? [item] : Object.keys(item),
        )
      : Object.keys(shared || {});
    if (names.some(forbidden)) {
      throw new Error(
        'Independent Bridge applications must not share React, ReactDOM, React Router or the Modern runtime.',
      );
    }
    const plugin = require.resolve('@module-federation/bridge-react/plugin');
    target.runtimePlugins ||= [];
    if (
      !target.runtimePlugins.some(
        (item) => (typeof item === 'string' ? item : item[0]) === plugin,
      )
    ) {
      target.runtimePlugins.push(plugin);
    }
  }
  api.generateEntryCode(async ({ entrypoints }) => {
    await fs.mkdir(generatedDirectory, { recursive: true });
    for (const entry of entries) {
      const appEntry =
        entry.entry === true
          ? entrypoints.find((item) => item.isMainEntry) ||
            (entrypoints.length === 1 ? entrypoints[0] : undefined)
          : entrypoints.find((item) => item.entryName === entry.entry);
      if (!appEntry?.isAutoMount)
        throw new Error(
          `Bridge application ${entry.expose} requires a Modern auto-mount application entry.`,
        );
      await fs.writeFile(
        entry.browser,
        applicationEntrySource(appEntry.entryName, false),
      );
      await fs.writeFile(
        entry.server,
        applicationEntrySource(appEntry.entryName, true),
      );
    }
  });
  api.modifyBundlerChain((chain) => {
    // Linked framework packages resolve peers relative to their source path.
    // Bind all React imports to this application's dependency, not the toolchain's.
    for (const name of [
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
    ]) {
      try {
        if (name === 'react-router' || name === 'react-router-dom') {
          // A directory alias bypasses package exports; React Router 7's /dom
          // entry exists only in its exports map. Resolve exact exports instead.
          chain.resolve.alias.set(`${name}$`, requireFromApp.resolve(name));
          if (name === 'react-router') {
            try {
              chain.resolve.alias.set(
                'react-router/dom$',
                requireFromApp.resolve('react-router/dom'),
              );
            } catch {}
          }
        } else {
          const packageFile = requireFromApp.resolve(`${name}/package.json`);
          chain.resolve.alias.set(name, path.dirname(packageFile));
        }
      } catch (error) {
        if (name === 'react' || name === 'react-dom') throw error;
      }
    }
  });
}
