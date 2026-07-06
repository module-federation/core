import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

function isTypescriptDynamicRequireWarning(warning: unknown) {
  const message =
    typeof warning === 'object' && warning && 'message' in warning
      ? String(warning.message)
      : String(warning);
  const moduleResource =
    typeof warning === 'object' && warning && 'module' in warning
      ? String(
          (
            warning as {
              module?: { resource?: string; identifier?: () => string };
            }
          ).module?.resource ||
            (
              warning as { module?: { identifier?: () => string } }
            ).module?.identifier?.() ||
            '',
        )
      : '';

  return (
    message.includes('Critical dependency') &&
    (message.includes('typescript/lib/typescript.js') ||
      moduleResource.includes('typescript/lib/typescript.js'))
  );
}

export default defineConfig({
  source: {
    entry: {
      index: './src/index.tsx',
    },
  },
  html: {
    template: './public/index.html',
  },
  server: {
    port: 5173,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
  },
  dev: {
    startUrl: 'http://localhost:<port>/',
  },
  tools: {
    rspack: (config) => {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        isTypescriptDynamicRequireWarning,
      ];
    },
  },
  plugins: [pluginReact()],
});
