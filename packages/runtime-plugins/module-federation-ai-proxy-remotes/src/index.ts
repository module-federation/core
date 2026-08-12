import {
  aiDebugRuntimePlugin,
  isAIDebugConsoleEnabled,
  type AIDebugRuntimePluginOptions,
} from './core';

export default function aiDebugPlugin(
  options: AIDebugRuntimePluginOptions = {},
) {
  const plugin = aiDebugRuntimePlugin(options);
  if (isAIDebugConsoleEnabled(options)) {
    void import('./console/mount').then(({ mountAIDebugConsole }) =>
      mountAIDebugConsole(
        typeof options.console === 'object' ? options.console : {},
        options,
      ),
    );
  }
  return plugin;
}
