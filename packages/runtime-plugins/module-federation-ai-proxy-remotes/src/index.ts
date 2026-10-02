import {
  aiDebugRuntimePlugin,
  isAIDebugRuntimePluginInitialized,
  isAIDebugConsoleEnabled,
  type AIDebugRuntimePluginOptions,
} from './core';

export type AIDebugUrlOverrides = Record<string, string | null>;

export type GenerateAIDebugUrlOptions = {
  /** Defaults to `__mf_devtools`. */
  parameterName?: string;
  replace?: boolean;
};

export const generateAIDebugUrl = (
  hostUrl: string | URL,
  overrides: AIDebugUrlOverrides,
  options: GenerateAIDebugUrlOptions = {},
): string => {
  const url = new URL(hostUrl.toString());
  url.searchParams.set(
    options.parameterName ?? '__mf_devtools',
    JSON.stringify({
      overrides,
      ...(options.replace === true ? { replace: true } : {}),
    }),
  );
  return url.href;
};

export default function aiDebugPlugin(
  options: AIDebugRuntimePluginOptions = {},
) {
  const shouldInitialize = !isAIDebugRuntimePluginInitialized();
  const plugin = aiDebugRuntimePlugin(options);
  if (shouldInitialize && isAIDebugConsoleEnabled(options)) {
    void import('./console/mount').then(({ mountAIDebugConsole }) =>
      mountAIDebugConsole(
        typeof options.console === 'object' ? options.console : {},
        options,
      ),
    );
  }
  return plugin;
}
