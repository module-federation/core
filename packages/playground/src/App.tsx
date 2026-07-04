import Editor, { loader } from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import * as React from 'react';
import { Component, useEffect, useMemo, useRef, useState } from 'react';
import * as ReactDOMRuntime from 'react-dom';
import * as ReactDOMClientRuntime from 'react-dom/client';
import { compilePlaygroundApp } from './consumerCompiler';
import {
  fetchManifest,
  formatLoadedTarget,
  guessRemoteName,
  normalizeExpose,
} from './sandbox';
import type { RemoteManifest } from './sandbox';

import styles from './App.module.css';

const cx = (...names: Array<string | false | null | undefined>) =>
  names
    .filter((name): name is string => Boolean(name))
    .map((name) => (styles as Record<string, string>)[name] || name)
    .join(' ');

const MONACO_CDN_VS_URL =
  'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs';

loader.config({
  paths: {
    vs: MONACO_CDN_VS_URL,
  },
});

const DEFAULT_MANIFEST_URL =
  'https://unpkg.com/module-federation-rslib-provider@latest/dist/mf/mf-manifest.json';
const DEFAULT_RUNTIME_MODULE_URL =
  'https://esm.sh/@module-federation/runtime@2.6.0?bundle';
const DEFAULT_REACT_VERSION = '19.1.1';
const DEFAULT_LEFT_PANE_WIDTH = 50;
const MIN_LEFT_PANE_WIDTH = 28;
const MAX_LEFT_PANE_WIDTH = 72;
const MANIFEST_QUERY_KEYS = ['url', 'manifestUrl', 'manifest', 'm'];
const EXPOSE_QUERY_KEYS = ['expose', 'e'];
const EXPORT_QUERY_KEYS = ['export', 'exportName'];
const PREVIEW_ROUTE_QUERY_KEYS = ['route', 'previewRoute'];
const AUTO_RUN_QUERY_KEYS = [
  ...MANIFEST_QUERY_KEYS,
  ...EXPOSE_QUERY_KEYS,
  ...EXPORT_QUERY_KEYS,
  ...PREVIEW_ROUTE_QUERY_KEYS,
  'run',
];

type PlaygroundQueryConfig = {
  autoRun: boolean;
  expose: string;
  exportName: string;
  manifestUrl: string;
  previewRoute: string;
};

export type PlaygroundProps = {
  autoRun?: boolean;
  defaultExpose?: string;
  defaultExportName?: string;
  defaultManifestUrl?: string;
  defaultPreviewRoute?: string;
  monacoVsUrl?: string;
  reactRuntimeUrls?: {
    react?: string;
    reactDom?: string;
  };
  runtimeModuleUrl?: string;
  templateRuntimeFileName?: string;
  templateRuntimeGlobalName?: string;
  templateRuntimeImportName?: string;
  templateRuntimeInstanceName?: string;
  templateRuntimePackageName?: string;
  templateRuntimeVariableName?: string;
  templatePlaygroundName?: string;
  templatePlaygroundPropsGlobalName?: string;
  templatePlaygroundTitle?: string;
};

type PlaygroundTemplate = {
  bridgePackageName: string;
  playgroundName: string;
  playgroundPropsGlobalName: string;
  playgroundTitle: string;
  runtimeFileBaseName: string;
  runtimeFileName: string;
  runtimeGlobalName: string;
  runtimeImportName: string;
  runtimeInstanceName: string;
  runtimePackageName: string;
  runtimeVariableName: string;
};

type PlaygroundDefaults = Required<
  Pick<
    PlaygroundProps,
    | 'autoRun'
    | 'defaultExpose'
    | 'defaultExportName'
    | 'defaultManifestUrl'
    | 'defaultPreviewRoute'
    | 'monacoVsUrl'
    | 'runtimeModuleUrl'
  >
> & {
  reactRuntimeUrls: NonNullable<PlaygroundProps['reactRuntimeUrls']>;
  template: PlaygroundTemplate;
};

function normalizeIdentifier(value: string | undefined, fallback: string) {
  const normalized = (value || '').trim().replace(/[^\w$]/g, '_');
  if (!normalized || /^\d/.test(normalized)) {
    return fallback;
  }
  return normalized;
}

function normalizeTemplateFileName(
  value: string | undefined,
  fallback: string,
) {
  const normalized = (value || '')
    .trim()
    .replace(/^\.\/+/, '')
    .replace(/[^\w$.-]/g, '_');
  if (!normalized || normalized.includes('/') || normalized.includes('\\')) {
    return fallback;
  }
  return normalized.endsWith('.ts') ? normalized : `${normalized}.ts`;
}

function getTemplateFileBaseName(fileName: string) {
  return fileName.replace(/\.ts$/, '');
}

function getPlaygroundTemplate(props: PlaygroundProps): PlaygroundTemplate {
  const runtimeFileName = normalizeTemplateFileName(
    props.templateRuntimeFileName,
    'mf.ts',
  );
  const runtimeImportName = normalizeIdentifier(
    props.templateRuntimeImportName,
    'getModuleFederationInstance',
  );

  return {
    bridgePackageName: '@module-federation/bridge-react',
    playgroundName:
      props.templatePlaygroundName?.trim() || '@module-federation/playground',
    playgroundPropsGlobalName: normalizeIdentifier(
      props.templatePlaygroundPropsGlobalName,
      '__MF_PLAYGROUND_PROPS__',
    ),
    playgroundTitle:
      props.templatePlaygroundTitle?.trim() || 'Module Federation Playground',
    runtimeFileBaseName: getTemplateFileBaseName(runtimeFileName),
    runtimeFileName,
    runtimeGlobalName: normalizeIdentifier(
      props.templateRuntimeGlobalName,
      'ModuleFederationRuntime',
    ),
    runtimeImportName,
    runtimeInstanceName: normalizeIdentifier(
      props.templateRuntimeInstanceName,
      'moduleFederationInstance',
    ),
    runtimePackageName:
      props.templateRuntimePackageName?.trim() || '@module-federation/runtime',
    runtimeVariableName: normalizeIdentifier(
      props.templateRuntimeVariableName,
      'moduleFederation',
    ),
  };
}

function getPlaygroundDefaults(props: PlaygroundProps): PlaygroundDefaults {
  return {
    autoRun: props.autoRun ?? false,
    defaultExpose: props.defaultExpose ?? '',
    defaultExportName: props.defaultExportName ?? 'default',
    defaultManifestUrl: props.defaultManifestUrl ?? DEFAULT_MANIFEST_URL,
    defaultPreviewRoute: props.defaultPreviewRoute ?? '/',
    monacoVsUrl: props.monacoVsUrl ?? MONACO_CDN_VS_URL,
    reactRuntimeUrls: props.reactRuntimeUrls ?? {},
    runtimeModuleUrl: props.runtimeModuleUrl ?? DEFAULT_RUNTIME_MODULE_URL,
    template: getPlaygroundTemplate(props),
  };
}

function getReactRuntimeUrl(
  pkg: 'react' | 'react-dom',
  version: string,
  reactRuntimeUrls: PlaygroundDefaults['reactRuntimeUrls'],
): string {
  if (pkg === 'react') {
    return (
      reactRuntimeUrls.react ||
      `https://unpkg.com/react@${version}/umd/react.development.js`
    );
  }
  return (
    reactRuntimeUrls.reactDom ||
    `https://unpkg.com/react-dom@${version}/umd/react-dom.development.js`
  );
}

function normalizeDependencyVersion(version: string): string {
  return (
    version
      .trim()
      .replace(/^[~^<>=\s]+/, '')
      .split(' ')[0] || version.trim()
  );
}

function getFirstSearchParam(
  searchParams: URLSearchParams,
  keys: string[],
): string {
  for (const key of keys) {
    const value = searchParams.get(key)?.trim();
    if (value) {
      return value;
    }
  }

  return '';
}

function hasSearchParam(
  searchParams: URLSearchParams,
  keys: string[],
): boolean {
  return keys.some((key) => searchParams.has(key));
}

function getInitialQueryConfig(
  defaults: PlaygroundDefaults,
): PlaygroundQueryConfig {
  if (typeof window === 'undefined') {
    return {
      autoRun: defaults.autoRun,
      expose: defaults.defaultExpose,
      exportName: defaults.defaultExportName,
      manifestUrl: defaults.defaultManifestUrl,
      previewRoute: defaults.defaultPreviewRoute,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const manifestFromQuery = getFirstSearchParam(
    searchParams,
    MANIFEST_QUERY_KEYS,
  );
  const exposeFromQuery = getFirstSearchParam(searchParams, EXPOSE_QUERY_KEYS);
  const exportFromQuery = getFirstSearchParam(searchParams, EXPORT_QUERY_KEYS);
  const previewRouteFromQuery = getFirstSearchParam(
    searchParams,
    PREVIEW_ROUTE_QUERY_KEYS,
  );

  return {
    autoRun:
      hasSearchParam(searchParams, AUTO_RUN_QUERY_KEYS) || defaults.autoRun,
    expose: exposeFromQuery || defaults.defaultExpose,
    exportName: exportFromQuery || defaults.defaultExportName,
    manifestUrl: manifestFromQuery || defaults.defaultManifestUrl,
    previewRoute: previewRouteFromQuery || defaults.defaultPreviewRoute,
  };
}

const DEFAULT_ENTRY_CODE = `import App from './app';
import React from 'react';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Preview root not found.');
}

createRoot(container).render(
  React.createElement(App),
);
`;

const APP_LOADED_TARGET_PLACEHOLDER = '__LOADED_TARGET__';

function getReactMajor(version: string): number {
  const match = version.trim().match(/^(\d+)/);
  return match ? Number(match[1]) : 19;
}

function getBridgeProviderImportPath(reactVersion: string): string {
  const major = getReactMajor(reactVersion);

  if (major >= 19) {
    return '@module-federation/bridge-react/v19';
  }

  if (major >= 18) {
    return '@module-federation/bridge-react/v18';
  }

  return '@module-federation/bridge-react';
}

function isBridgeAppExpose(expose: string): boolean {
  return normalizeExpose(expose) === 'export-app';
}

function buildDefaultComponentAppCode(
  loadedTarget: string,
  exportName: string,
  template: PlaygroundTemplate,
): string {
  const safeLoadedTarget = loadedTarget.trim() || APP_LOADED_TARGET_PLACEHOLDER;
  const safeExportName = exportName.trim() || 'default';

  return `import React from 'react';
import { ${template.runtimeImportName} } from './${template.runtimeFileBaseName}';

const loadedTargetLabel = ${JSON.stringify(safeLoadedTarget)};

export default function App() {
  const RemoteComponent = React.useMemo(
    () =>
      React.lazy(async () => {
        const ${template.runtimeVariableName} = await ${template.runtimeImportName}();
        const module = await ${template.runtimeVariableName}.loadRemote(${JSON.stringify(safeLoadedTarget)});
        return { default: module?.[${JSON.stringify(safeExportName)}] };
      }),
    [],
  );

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <React.Suspense fallback={<div>Loading remote module...</div>}>
        <RemoteComponent
          title=${JSON.stringify(template.playgroundTitle)}
        />
      </React.Suspense>
    </div>
  );
}
`;
}

function buildDefaultBridgeAppCode(
  loadedTarget: string,
  exportName: string,
  template: PlaygroundTemplate,
): string {
  const safeLoadedTarget = loadedTarget.trim() || APP_LOADED_TARGET_PLACEHOLDER;
  const safeExportName = exportName.trim() || 'default';

  return `import React from 'react';
import { createRemoteAppComponent, ${template.runtimeImportName} } from './${template.runtimeFileBaseName}';

const loadedTargetLabel = ${JSON.stringify(safeLoadedTarget)};

const RemoteApp = createRemoteAppComponent({
  loader: async () => {
    const ${template.runtimeVariableName} = await ${template.runtimeImportName}();
    return ${template.runtimeVariableName}.loadRemote(${JSON.stringify(safeLoadedTarget)});
  },
  export: ${JSON.stringify(safeExportName)},
  loading: (
    <div style={{ padding: 16, fontSize: 13, opacity: 0.72 }}>
      Loading remote app...
    </div>
  ),
  fallback: ({ error }) => (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: '1px solid rgba(255, 90, 90, 0.24)',
        background: 'rgba(255, 90, 90, 0.08)',
        color: '#c53b3b',
        fontSize: 13,
      }}
    >
      {error?.message || 'Failed to load remote app.'}
    </div>
  ),
});

export default function App() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <RemoteApp basename="/" />
    </div>
  );
}
`;
}

function buildDefaultAppCode(
  loadedTarget: string,
  exportName: string,
  expose: string,
  _reactVersion: string,
  template: PlaygroundTemplate,
): string {
  if (isBridgeAppExpose(expose)) {
    return buildDefaultBridgeAppCode(loadedTarget, exportName, template);
  }

  return buildDefaultComponentAppCode(loadedTarget, exportName, template);
}

const MF_MANIFEST_PLACEHOLDER = '__MANIFEST_URL__';
const MF_REMOTE_NAME_PLACEHOLDER = '__REMOTE_NAME__';

function buildDefaultMfCode(
  manifestUrl: string,
  remoteName: string,
  reactVersions: Record<string, string>,
  template: PlaygroundTemplate,
): string {
  const safeManifestUrl = manifestUrl.trim() || MF_MANIFEST_PLACEHOLDER;
  const safeRemoteName = remoteName.trim() || MF_REMOTE_NAME_PLACEHOLDER;
  const safeReactVersion = reactVersions.react?.trim() || DEFAULT_REACT_VERSION;
  const safeReactDomClientVersion =
    reactVersions['react-dom/client']?.trim() ||
    reactVersions['react-dom']?.trim() ||
    safeReactVersion;
  const bridgeProviderImportPath =
    getBridgeProviderImportPath(safeReactVersion);

  return `import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { createInstance } from ${JSON.stringify(template.runtimePackageName)};

const PLAYGROUND_NAME = ${JSON.stringify(template.playgroundName)};
const manifestUrl = ${JSON.stringify(safeManifestUrl)};
const remoteName = ${JSON.stringify(safeRemoteName)};
const reactVersion = ${JSON.stringify(safeReactVersion)};
const reactDomClientVersion = ${JSON.stringify(safeReactDomClientVersion)};

let ${template.runtimeInstanceName} = null;

// The playground bundles the bridge runtime into the sandbox.
// In a real host, import createRemoteAppComponent from '${template.bridgePackageName}'.
// React version differences mainly affect the producer-side createBridgeComponent import:
// current react version: ${safeReactVersion}
// producer-side import: ${bridgeProviderImportPath}
import { createRemoteAppComponent as createBridgeRemoteAppComponent } from './bridge/index.es.js';

function normalizePlaygroundRoute(route) {
  const normalizedRoute = typeof route === 'string' ? route.trim() : '';

  if (!normalizedRoute || /^[a-z][a-z\\d+.-]*:/i.test(normalizedRoute)) {
    return '/';
  }

  return normalizedRoute.startsWith('/') ? normalizedRoute : \`/\${normalizedRoute}\`;
}

function getPlaygroundRoute() {
  return normalizePlaygroundRoute(window[${JSON.stringify(template.playgroundPropsGlobalName)}]?.previewRoute);
}

export function createRemoteAppComponent(options) {
  const RemoteApp = createBridgeRemoteAppComponent(options);

  return React.forwardRef((props, ref) => {
    const previewRoute = getPlaygroundRoute();
    const propsWithRoute = {
      ...props,
      ref,
      basename:
        props?.basename && props.basename !== '/' ? props.basename : previewRoute,
      memoryRoute: props?.memoryRoute || { entryPath: previewRoute },
    };

    return React.createElement(RemoteApp, propsWithRoute);
  });
}

function createShared() {
  return {
    react: {
      version: reactVersion,
      scope: 'default',
      lib: () => React,
      shareConfig: {
        singleton: true,
        requiredVersion: reactVersion,
        fixedDependencies: false,
      },
    },
    'react/': {
      version: reactVersion,
      scope: 'default',
      lib: () => React,
      shareConfig: {
        singleton: true,
        requiredVersion: reactVersion,
        fixedDependencies: false,
      },
    },
    'react-dom/client': {
      version: reactDomClientVersion,
      scope: 'default',
      lib: () => ReactDOMClient,
      shareConfig: {
        singleton: true,
        requiredVersion: reactDomClientVersion,
        fixedDependencies: false,
      },
    },
    'react-dom': {
      version: reactDomClientVersion,
      scope: 'default',
      lib: () => ReactDOMClient,
      shareConfig: {
        singleton: true,
        requiredVersion: reactDomClientVersion,
        fixedDependencies: false,
      },
    },
  };
}

export async function ${template.runtimeImportName}() {
  if (manifestUrl === ${JSON.stringify(MF_MANIFEST_PLACEHOLDER)}) {
    throw new Error('manifestUrl is not resolved yet. Run Sandbox first.');
  }

  if (remoteName === ${JSON.stringify(MF_REMOTE_NAME_PLACEHOLDER)}) {
    throw new Error('remoteName is not resolved yet. Run Sandbox first.');
  }

  if (${template.runtimeInstanceName}) {
    return ${template.runtimeInstanceName};
  }

  ${template.runtimeInstanceName} = createInstance({
    name: PLAYGROUND_NAME,
    remotes: [
      {
        name: remoteName,
        entry: manifestUrl,
      },
    ],
    shared: createShared(),
  });

  return ${template.runtimeInstanceName};
}
`;
}

function buildDefaultRspackConfigCode(template: PlaygroundTemplate) {
  return `// Only used to show the browser sandbox shape. Configure your real bundler as needed.
export default {
  mode: 'development',
  entry: './entry.ts',
  devtool: false,
  externalsType: 'window',
  lazyCompilation: false,
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'react-dom/client': 'ReactDOM',
    ${JSON.stringify(template.runtimePackageName)}: ${JSON.stringify(template.runtimeGlobalName)},
  },
  target: ['web', 'es2020'],
  output: {
    path: '/dist',
    filename: 'app.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\\.[jt]sx?$/,
        type: 'javascript/auto',
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  runtime: 'classic',
                },
              },
            },
          },
        },
      },
    ],
	},
	experiments: {
	  buildHttp: {
	    allowedUris: ['https://'],
	  },
    useInputFileSystem: [/.*/],
  },
	plugins: [
	  new BrowserHttpImportEsmPlugin({
	    domain: 'https://esm.sh',
	    dependencyVersions: {},
	    postprocess: (request) => {
        if (
          request.packageName === 'react' ||
          request.packageName === 'react-dom' ||
          request.packageName === 'react-dom/client' ||
          request.packageName === ${JSON.stringify(template.runtimePackageName)}
        ) {
          return null;
        }
	      return request;
	    }
    }),
  ],
};
`;
}

type PreviewState = null | {
  kind: 'consumer';
  bundle: string;
  loadedTarget: string;
  manifest: RemoteManifest | null;
  manifestUrl: string;
  expose: string;
  previewRoute: string;
  runtimeModuleUrl: string;
  runId: number;
};

type RenderError = {
  message: string;
  componentStack?: string;
};

type TerminalLine = {
  id: number;
  level: 'error' | 'info' | 'warn';
  message: string;
};

type RenderErrorBoundaryProps = {
  children: React.ReactNode;
  onError?: (error: RenderError) => void;
};

type RenderErrorBoundaryState = {
  error: RenderError | null;
};

type EditorFileKey = 'app.tsx' | 'entry.ts' | 'runtime' | 'rspack.config.mjs';

const FILE_TABS: Array<{
  copyKey: string;
  copyMessage: string;
  label?: string;
  key: EditorFileKey;
  placeholder: string;
}> = [
  {
    key: 'app.tsx',
    copyKey: 'app-code',
    copyMessage: '已复制 app.tsx 到剪贴板',
    placeholder: 'export default function App(...) { ... }',
  },
  {
    key: 'entry.ts',
    copyKey: 'entry-code',
    copyMessage: '已复制 entry.ts 到剪贴板',
    placeholder: "import App from './app';",
  },
  {
    key: 'runtime',
    copyKey: 'runtime-code',
    copyMessage: '已复制 runtime.ts 到剪贴板',
    placeholder: 'export async function getRuntimeInstance(...) { ... }',
  },
  {
    key: 'rspack.config.mjs',
    copyKey: 'rspack-config',
    copyMessage: '已复制 rspack.config.mjs 到剪贴板',
    placeholder: 'export default { ... }',
  },
];

function getFileTabs(template: PlaygroundTemplate) {
  return FILE_TABS.map((item) =>
    item.key === 'runtime'
      ? {
          ...item,
          copyMessage: `已复制 ${template.runtimeFileName} 到剪贴板`,
          label: template.runtimeFileName,
          placeholder: `export async function ${template.runtimeImportName}(...) { ... }`,
        }
      : item,
  );
}

function getEditorLanguage(file: EditorFileKey) {
  if (file === 'app.tsx') {
    return 'typescript';
  }

  if (file === 'entry.ts' || file === 'runtime') {
    return 'typescript';
  }

  if (file.endsWith('.mjs')) {
    return 'javascript';
  }

  return 'plaintext';
}

function EditorLoadingState() {
  return (
    <div className={cx('vp-loadingSimple')}>
      <span className={cx('vp-loadingSpinner')} aria-hidden="true" />
    </div>
  );
}

function getEditorTheme() {
  if (typeof document === 'undefined') {
    return 'vs-dark';
  }

  const root = document.documentElement;
  return root.classList.contains('dark') || root.classList.contains('rp-dark')
    ? 'vs-dark'
    : 'vs';
}

function getDocumentLocale() {
  if (typeof document === 'undefined') {
    return 'zh';
  }

  const lang =
    document.documentElement.lang ||
    (typeof navigator !== 'undefined' ? navigator.language : '') ||
    'zh';

  return lang.toLowerCase().startsWith('en') ? 'en' : 'zh';
}

function useEditorTheme() {
  const [theme, setTheme] = useState<'vs' | 'vs-dark'>(getEditorTheme);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(getEditorTheme());
    });

    observer.observe(root, {
      attributeFilter: ['class'],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}

function useLocale() {
  const [locale, setLocale] = useState<'zh' | 'en'>(getDocumentLocale);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const observer = new MutationObserver(() => {
      setLocale(getDocumentLocale());
    });

    observer.observe(document.documentElement, {
      attributeFilter: ['lang'],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return locale;
}

function getEditorPath(file: EditorFileKey, template: PlaygroundTemplate) {
  if (file === 'rspack.config.mjs') {
    return `file:///${file}`;
  }

  if (file === 'runtime') {
    return `file:///src/${template.runtimeFileName}`;
  }

  return `file:///src/${file}`;
}

function configureEditor(monaco: Monaco, template: PlaygroundTemplate) {
  const localTypes = {
    'file:///node_modules/@types/react/index.d.ts': `
declare module 'react' {
  const React: any;
  export default React;
}
`,
    'file:///node_modules/@types/react-dom/client.d.ts': `
declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(children: any): void;
    unmount(): void;
  };
}
`,
    [`file:///src/${template.runtimeFileBaseName}.d.ts`]: `
export function createRemoteAppComponent(options: {
  export?: string;
  fallback?: (context: { error?: Error | null }) => any;
  loader: () => Promise<any>;
  loading?: any;
}): any;
export function ${template.runtimeImportName}(): Promise<{
  loadRemote(request: string): Promise<any>;
}>;
`,
    'file:///src/app.d.ts': `
const App: any;
export default App;
`,
    'file:///src/globals.d.ts': `
declare global {
	interface Window {
    ${template.playgroundPropsGlobalName}?: any;
    ${template.runtimeGlobalName}?: {
      createInstance?: (...args: any[]) => any;
    };
    ModuleFederationRuntime?: {
      createInstance?: (...args: any[]) => any;
    };
  }
}
export {};
`,
  };

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    allowJs: true,
    allowNonTsExtensions: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    noImplicitAny: false,
    noEmit: true,
    strict: false,
    target: monaco.languages.typescript.ScriptTarget.ES2020,
  });
  for (const [path, content] of Object.entries(localTypes)) {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(content, path);
    monaco.languages.typescript.javascriptDefaults.addExtraLib(content, path);
  }

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
}

function syncEditorModels(
  monaco: Monaco,
  files: Record<EditorFileKey, string>,
  template: PlaygroundTemplate,
) {
  for (const [file, value] of Object.entries(files) as Array<
    [EditorFileKey, string]
  >) {
    const uri = monaco.Uri.parse(getEditorPath(file, template));
    const model = monaco.editor.getModel(uri);

    if (model) {
      if (model.getValue() !== value) {
        model.setValue(value);
      }
      continue;
    }

    monaco.editor.createModel(value, getEditorLanguage(file), uri);
  }
}

function extractSharedDependencyVersions(
  manifest: RemoteManifest,
): Record<string, string> {
  const shared = manifest.shared;
  if (!shared) {
    return {};
  }

  if (Array.isArray(shared)) {
    return shared.reduce<Record<string, string>>((acc, item) => {
      if (
        item &&
        typeof item === 'object' &&
        'name' in item &&
        typeof item.name === 'string'
      ) {
        const resolvedVersion =
          ('version' in item && typeof item.version === 'string'
            ? item.version
            : 'requiredVersion' in item &&
                typeof item.requiredVersion === 'string'
              ? normalizeDependencyVersion(item.requiredVersion)
              : '') || '';

        if (resolvedVersion) {
          acc[item.name] = resolvedVersion;
        }
      }
      return acc;
    }, {});
  }

  if (typeof shared === 'object') {
    return Object.entries(shared).reduce<Record<string, string>>(
      (acc, [name, value]) => {
        if (value && typeof value === 'object') {
          const resolvedVersion =
            ('version' in value && typeof value.version === 'string'
              ? value.version
              : 'requiredVersion' in value &&
                  typeof value.requiredVersion === 'string'
                ? normalizeDependencyVersion(value.requiredVersion)
                : '') || '';

          if (resolvedVersion) {
            acc[name] = resolvedVersion;
          }
        }
        return acc;
      },
      {},
    );
  }

  return {};
}

function extractReactDependencyVersions(
  manifest: RemoteManifest,
): Record<string, string> {
  const sharedVersions = extractSharedDependencyVersions(manifest);
  const reactVersion =
    sharedVersions.react || sharedVersions['react/'] || DEFAULT_REACT_VERSION;
  const reactDomVersion = sharedVersions['react-dom'] || reactVersion;
  const reactDomClientVersion =
    sharedVersions['react-dom/client'] || reactDomVersion || reactVersion;

  return {
    react: reactVersion,
    'react-dom/client': reactDomClientVersion,
  };
}

function updateDependencyVersionsInRspackConfig(
  configCode: string,
  _versions: Record<string, string>,
): string {
  return configCode;
}

function getDefaultReactDependencyVersions(): Record<string, string> {
  return {
    react: DEFAULT_REACT_VERSION,
    'react-dom/client': DEFAULT_REACT_VERSION,
  };
}

function escapeInlineScript(source: string): string {
  return source.replace(/<\/script/gi, '<\\/script');
}

function normalizePreviewRoute(route: string): string {
  const trimmedRoute = route.trim();

  if (!trimmedRoute) {
    return '/';
  }

  if (/^[a-z][a-z\d+.-]*:/i.test(trimmedRoute)) {
    return '/';
  }

  return trimmedRoute.startsWith('/') ? trimmedRoute : `/${trimmedRoute}`;
}

function resolveExposeFromOptions(
  exposeOptions: string[],
  requestedExpose: string,
): string {
  const trimmedExpose = requestedExpose.trim();

  if (!trimmedExpose) {
    return exposeOptions[0] || '';
  }

  const exactMatch = exposeOptions.find((item) => item === trimmedExpose);
  if (exactMatch) {
    return exactMatch;
  }

  const normalizedRequestedExpose = normalizeExpose(trimmedExpose);
  const normalizedMatch = exposeOptions.find(
    (item) => normalizeExpose(item) === normalizedRequestedExpose,
  );
  if (normalizedMatch) {
    return normalizedMatch;
  }

  return trimmedExpose;
}

function normalizeTerminalLevel(level: unknown): TerminalLine['level'] {
  if (level === 'warn' || level === 'info') {
    return level;
  }

  return 'error';
}

function formatErrorForTerminal(error: unknown): string {
  return error instanceof Error ? error.stack || error.message : String(error);
}

function buildPreviewDocument(
  previewState: Exclude<PreviewState, null>,
  defaults: PlaygroundDefaults,
): string {
  const reactDependencyVersions = previewState.manifest
    ? extractReactDependencyVersions(previewState.manifest)
    : getDefaultReactDependencyVersions();
  const reactVersion = reactDependencyVersions.react || DEFAULT_REACT_VERSION;
  const reactDomVersion =
    reactDependencyVersions['react-dom/client'] ||
    reactDependencyVersions['react-dom'] ||
    reactVersion;
  const reactMajor = getReactMajor(reactVersion);
  const previewRoute = normalizePreviewRoute(previewState.previewRoute);
  const props = JSON.stringify({
    expose: previewState.expose,
    loadedTarget: previewState.loadedTarget,
    manifest: previewState.manifest,
    manifestUrl: previewState.manifestUrl,
    previewRoute,
  });
  const bundle = escapeInlineScript(previewState.bundle);
  const dependencyInjection =
    reactMajor >= 19
      ? `<script>
      if (!window.parent?.__MF_PLAYGROUND_HOST_REACT__ || !window.parent?.__MF_PLAYGROUND_HOST_REACT_DOM__) {
        throw new Error('Host React runtime is not available.');
      }
      window.React = window.parent.__MF_PLAYGROUND_HOST_REACT__;
      window.ReactDOM = window.parent.__MF_PLAYGROUND_HOST_REACT_DOM__;
    </script>`
      : `<script src="${getReactRuntimeUrl('react', reactVersion, defaults.reactRuntimeUrls)}"></script>
    <script src="${getReactRuntimeUrl('react-dom', reactDomVersion, defaults.reactRuntimeUrls)}"></script>`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body, #root {
        height: 100%;
      }

      html {
        background: var(--mf-preview-bg, transparent) !important;
      }

      body {
        margin: 0;
        padding: 12px;
        box-sizing: border-box;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: var(--mf-preview-bg, transparent) !important;
        color: var(--mf-preview-text, #e5eef7);
      }

      #root {
        background: transparent !important;
      }

      pre {
        white-space: pre-wrap;
        word-break: break-word;
      }

      #mf-error {
        display: none;
        margin-bottom: 12px;
        padding: 12px;
        border-radius: 12px;
        background: rgba(255, 90, 90, 0.12);
        border: 1px solid rgba(255, 90, 90, 0.24);
        color: #ffd7d7;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div id="mf-error"></div>
    <div id="root"></div>
    ${dependencyInjection}
    <script>
      window.__MF_PLAYGROUND_PROPS__ = ${props};
      const parentStyles = window.parent?.getComputedStyle?.(window.parent.document.body);
      if (parentStyles) {
        document.documentElement.style.setProperty('--mf-preview-bg', parentStyles.background);
        document.documentElement.style.setProperty('--mf-preview-text', parentStyles.color);
      }
      const postTerminal = (level, message) => {
        window.parent?.postMessage({
          type: 'mf-playground-terminal',
          runId: ${previewState.runId},
          level,
          message: String(message || ''),
        }, '*');
      };
      const patchPreviewRouterSource = (source) => {
        const previewEntry = 'window.__MF_PLAYGROUND_PROPS__?.previewRoute || "/"';
        return source
          .replace(
            /history: createBrowserHistory\\(\\{\\s*window: opts === null \\|\\| opts === void 0 \\? void 0 : opts\\.window\\s*\\}\\),/g,
            \`history: createMemoryHistory({
            initialEntries: [\${previewEntry}],
            v5Compat: true
        }),\`
          )
          .replace(
            /historyRef\\.current = createBrowserHistory\\(\\{\\s*window: window2,\\s*v5Compat: true\\s*\\}\\);/g,
            \`historyRef.current = createMemoryHistory({
            initialEntries: [\${previewEntry}],
            v5Compat: true
        });\`
          );
      };
      const installPreviewRouterPatch = () => {
        const originalAppendChild = HTMLHeadElement.prototype.appendChild;

        HTMLHeadElement.prototype.appendChild = function appendChildWithRouterPatch(node) {
          if (
            node instanceof HTMLScriptElement &&
            node.src &&
            !node.src.startsWith('blob:')
          ) {
            const originalSrc = node.src;

            fetch(originalSrc)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(\`HTTP \${response.status}\`);
                }
                return response.text();
              })
              .then((source) => {
                const patchedSource = patchPreviewRouterSource(source);
                if (patchedSource === source) {
                  node.src = originalSrc;
                } else {
                  node.src = URL.createObjectURL(
                    new Blob([patchedSource], { type: 'text/javascript' })
                  );
                }
                originalAppendChild.call(this, node);
              })
              .catch((error) => {
                node.src = originalSrc;
                originalAppendChild.call(this, node);
                postTerminal(
                  'warn',
                  \`Preview router patch skipped for \${originalSrc}: \${error?.message || String(error)}\`
                );
              });

            return node;
          }

          return originalAppendChild.call(this, node);
        };
      };
      const patchHistoryForSrcdoc = () => {
        if (window.location.protocol !== 'about:') {
          return;
        }

        const wrap = (method) => {
          const original = window.history[method].bind(window.history);
          window.history[method] = (state, unused, url) => {
            try {
              return original(state, unused, url);
            } catch (error) {
              if (!(error instanceof DOMException) || error.name !== 'SecurityError') {
                throw error;
              }

              const fallbackState =
                url == null
                  ? state
                  : {
                      ...(state && typeof state === 'object' ? state : {}),
                      __mfPreviewUrl: String(url),
                    };

              postTerminal(
                'warn',
                \`Preview router fallback applied for \${method}: \${String(url || '')}\`
              );

              return original(fallbackState, unused, window.location.href);
            }
          };
        };

        wrap('pushState');
        wrap('replaceState');
      };
      installPreviewRouterPatch();
      patchHistoryForSrcdoc();
      const formatTerminalValue = (value) => {
        if (value instanceof Error) {
          return value.stack || value.message;
        }
        if (typeof value === 'object' && value !== null) {
          try {
            return JSON.stringify(value, null, 2);
          } catch {
            return String(value);
          }
        }
        return String(value);
      };
      for (const method of ['error', 'warn']) {
        const original = console[method];
        console[method] = (...args) => {
          postTerminal(method, args.map(formatTerminalValue).join(' '));
          original.apply(console, args);
        };
      }
      const errorBox = document.getElementById('mf-error');
      const showError = (value) => {
        if (!errorBox) return;
        errorBox.style.display = 'block';
        errorBox.textContent = value;
        postTerminal('error', value);
      };
      window.addEventListener('error', (event) => {
        showError(event.error?.stack || event.message || String(event.error));
      });
      window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        showError(reason?.stack || reason?.message || String(reason));
      });
    </script>
    <script>${bundle}</script>
  </body>
</html>`;
}

class RenderErrorBoundary extends Component<
  RenderErrorBoundaryProps,
  RenderErrorBoundaryState
> {
  state: RenderErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): RenderErrorBoundaryState {
    return {
      error: {
        message: error.message,
      },
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.({
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div className={cx('vp-errorPanel')}>
          <div className={cx('vp-errorTitle')}>Render Error</div>
          <pre className={cx('vp-codeBlock')}>{this.state.error.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppInner(props: { defaults: PlaygroundDefaults }) {
  const { defaults } = props;
  const initialQueryConfig = useMemo(
    () => getInitialQueryConfig(defaults),
    [defaults],
  );
  const template = defaults.template;
  const initialGeneratedAppCode = useMemo(
    () =>
      buildDefaultAppCode('', 'default', '', DEFAULT_REACT_VERSION, template),
    [template],
  );
  const initialGeneratedMfCode = useMemo(
    () =>
      buildDefaultMfCode(
        '',
        '',
        {
          react: DEFAULT_REACT_VERSION,
          'react-dom/client': DEFAULT_REACT_VERSION,
        },
        template,
      ),
    [template],
  );

  const [manifestUrl, setManifestUrl] = useState(
    initialQueryConfig.manifestUrl,
  );
  const [exposeOptions, setExposeOptions] = useState<string[]>([]);
  const [expose, setExpose] = useState(initialQueryConfig.expose);
  const [exportName, setExportName] = useState(initialQueryConfig.exportName);
  const [previewRoute, setPreviewRoute] = useState(
    initialQueryConfig.previewRoute,
  );
  const [entryCode, setEntryCode] = useState(DEFAULT_ENTRY_CODE);
  const [appCode, setAppCode] = useState(initialGeneratedAppCode);
  const [lastGeneratedAppCode, setLastGeneratedAppCode] = useState(
    initialGeneratedAppCode,
  );
  const [mfCode, setMfCode] = useState(initialGeneratedMfCode);
  const [lastGeneratedMfCode, setLastGeneratedMfCode] = useState(
    initialGeneratedMfCode,
  );
  const [rspackConfigCode, setRspackConfigCode] = useState(() =>
    buildDefaultRspackConfigCode(template),
  );
  const [openPanels, setOpenPanels] = useState<
    Record<'control' | 'code', boolean>
  >({
    control: true,
    code: false,
  });
  const [leftPaneWidth, setLeftPaneWidth] = useState(DEFAULT_LEFT_PANE_WIDTH);
  const [isDesktopLayout, setIsDesktopLayout] = useState(
    () => typeof window === 'undefined' || window.innerWidth > 980,
  );
  const [activeFile, setActiveFile] = useState<EditorFileKey>('app.tsx');
  const [status, setStatus] = useState('');
  const [isResolvingExpose, setIsResolvingExpose] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [resolvedManifest, setResolvedManifest] =
    useState<RemoteManifest | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>(null);
  const [renderError, setRenderError] = useState<RenderError | null>(null);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    {
      id: 0,
      level: 'info',
      message:
        'Terminal ready. Compile and runtime errors will appear here after Run Sandbox.',
    },
  ]);
  const [runId, setRunId] = useState(0);
  const runIdRef = useRef(runId);
  const autoRunStartedRef = useRef(false);
  const onRunRef = useRef<(() => Promise<void>) | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const resizeStateRef = useRef<{
    startWidth: number;
    startX: number;
  } | null>(null);
  const editorFiles = useMemo(
    () => ({
      'app.tsx': appCode,
      'entry.ts': entryCode,
      runtime: mfCode,
      'rspack.config.mjs': rspackConfigCode,
    }),
    [appCode, entryCode, mfCode, rspackConfigCode],
  );
  const fileTabs = useMemo(() => getFileTabs(template), [template]);

  useEffect(() => {
    loader.config({
      paths: {
        vs: defaults.monacoVsUrl,
      },
    });
  }, [defaults.monacoVsUrl]);

  useEffect(() => {
    if (monacoRef.current) {
      syncEditorModels(monacoRef.current, editorFiles, template);
    }
  }, [editorFiles, template]);

  useEffect(() => {
    runIdRef.current = runId;
  }, [runId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      const nextIsDesktop = window.innerWidth > 980;
      setIsDesktopLayout(nextIsDesktop);

      if (!nextIsDesktop) {
        resizeStateRef.current = null;
        setLeftPaneWidth(DEFAULT_LEFT_PANE_WIDTH);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    (
      window as typeof window & {
        __MF_PLAYGROUND_HOST_REACT__?: typeof React;
        __MF_PLAYGROUND_HOST_REACT_DOM__?: typeof ReactDOMRuntime &
          typeof ReactDOMClientRuntime;
      }
    ).__MF_PLAYGROUND_HOST_REACT__ = React;
    (
      window as typeof window & {
        __MF_PLAYGROUND_HOST_REACT__?: typeof React;
        __MF_PLAYGROUND_HOST_REACT_DOM__?: typeof ReactDOMRuntime &
          typeof ReactDOMClientRuntime;
      }
    ).__MF_PLAYGROUND_HOST_REACT_DOM__ = {
      ...ReactDOMRuntime,
      ...ReactDOMClientRuntime,
    };
  }, []);

  useEffect(() => {
    if (!isDesktopLayout || typeof window === 'undefined') {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const resizeState = resizeStateRef.current;
      if (!resizeState) {
        return;
      }

      const viewportWidth = window.innerWidth || 1;
      const deltaRatio =
        ((event.clientX - resizeState.startX) / viewportWidth) * 100;
      const nextWidth = Math.min(
        MAX_LEFT_PANE_WIDTH,
        Math.max(MIN_LEFT_PANE_WIDTH, resizeState.startWidth + deltaRatio),
      );
      setLeftPaneWidth(nextWidth);
    };

    const handleMouseUp = () => {
      resizeStateRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDesktopLayout]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (
        !data ||
        data.type !== 'mf-playground-terminal' ||
        data.runId !== runIdRef.current
      ) {
        return;
      }

      setTerminalLines((currentLines) =>
        [
          ...currentLines,
          {
            id: Date.now() + Math.random(),
            level: normalizeTerminalLevel(data.level),
            message: String(data.message || ''),
          },
        ].slice(-120),
      );
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const appendTerminalLine = (
    level: TerminalLine['level'],
    message: string,
  ) => {
    setTerminalLines((currentLines) =>
      [
        ...currentLines,
        {
          id: Date.now() + Math.random(),
          level,
          message,
        },
      ].slice(-120),
    );
  };

  const manifestName = useMemo(() => {
    if (!resolvedManifest) {
      return '';
    }

    return (
      resolvedManifest.metaData?.name ||
      resolvedManifest.name ||
      resolvedManifest.id ||
      ''
    );
  }, [resolvedManifest]);

  const syncGeneratedAppCode = (
    nextManifest: RemoteManifest | null,
    nextExpose: string,
    nextExportName: string,
  ) => {
    const reactVersion = nextManifest
      ? extractReactDependencyVersions(nextManifest).react
      : DEFAULT_REACT_VERSION;

    if (!nextManifest) {
      const placeholderCode = buildDefaultAppCode(
        '',
        nextExportName,
        nextExpose,
        reactVersion,
        template,
      );
      setAppCode((currentCode) =>
        currentCode === lastGeneratedAppCode ? placeholderCode : currentCode,
      );
      setLastGeneratedAppCode(placeholderCode);
      return;
    }

    const resolvedRemoteName = guessRemoteName(nextManifest).trim();
    const nextLoadedTarget = formatLoadedTarget(
      resolvedRemoteName,
      normalizeExpose(nextExpose),
    );
    const nextCode = buildDefaultAppCode(
      nextLoadedTarget,
      nextExportName,
      nextExpose,
      reactVersion,
      template,
    );

    setAppCode((currentCode) =>
      currentCode === lastGeneratedAppCode ? nextCode : currentCode,
    );
    setLastGeneratedAppCode(nextCode);
  };

  const syncGeneratedMfCode = (
    nextManifestUrl: string,
    nextManifest: RemoteManifest | null,
  ) => {
    if (!nextManifest) {
      return;
    }

    const resolvedRemoteName = guessRemoteName(nextManifest).trim();
    const reactDependencyVersions =
      extractReactDependencyVersions(nextManifest);
    const nextCode = buildDefaultMfCode(
      nextManifestUrl,
      resolvedRemoteName,
      reactDependencyVersions,
      template,
    );

    setMfCode((currentCode) =>
      currentCode === lastGeneratedMfCode ? nextCode : currentCode,
    );
    setLastGeneratedMfCode(nextCode);
  };

  const syncGeneratedMfPlaceholder = () => {
    const nextCode = buildDefaultMfCode(
      '',
      '',
      {
        react: DEFAULT_REACT_VERSION,
        'react-dom/client': DEFAULT_REACT_VERSION,
      },
      template,
    );

    setMfCode((currentCode) =>
      currentCode === lastGeneratedMfCode ? nextCode : currentCode,
    );
    setLastGeneratedMfCode(nextCode);
  };

  const onManifestReady = async (options?: {
    appendTerminal?: boolean;
    silentStatus?: boolean;
  }) => {
    const appendTerminal = options?.appendTerminal ?? true;
    const silentStatus = options?.silentStatus ?? false;
    const nextManifestUrl = manifestUrl.trim();
    if (!nextManifestUrl) {
      setResolvedManifest(null);
      setExposeOptions([]);
      setExpose('');
      setOpenPanels((current) => ({
        ...current,
        code: false,
      }));
      syncGeneratedAppCode(null, '', exportName);
      syncGeneratedMfPlaceholder();
      throw new Error(
        isEn
          ? 'Manifest URL is required before running the sandbox.'
          : '运行前请先填写 Manifest URL。',
      );
    }

    setIsResolvingExpose(true);
    if (!silentStatus) {
      setStatus(isEn ? 'Resolving manifest...' : '解析 Manifest 中...');
    }
    if (appendTerminal) {
      appendTerminalLine('info', `Resolving manifest: ${nextManifestUrl}`);
    }

    try {
      const manifest = await fetchManifest(nextManifestUrl);
      const options =
        manifest.exposes
          ?.map((item) => item?.name?.trim())
          .filter((item): item is string => Boolean(item)) || [];
      const effectiveExpose = resolveExposeFromOptions(options, expose);

      setResolvedManifest(manifest);
      setExposeOptions(options);
      const reactDependencyVersions = extractReactDependencyVersions(manifest);
      const dependencyVersions = {
        ...reactDependencyVersions,
      };
      setRspackConfigCode((currentCode) =>
        updateDependencyVersionsInRspackConfig(currentCode, dependencyVersions),
      );
      syncGeneratedAppCode(manifest, effectiveExpose, exportName);
      syncGeneratedMfCode(nextManifestUrl, manifest);
      setExpose(effectiveExpose);
      setOpenPanels((current) => ({
        ...current,
        code: true,
      }));
      if (!silentStatus) {
        setStatus(
          options.length > 0
            ? isEn
              ? `Loaded ${options.length} expose entries`
              : `已加载 ${options.length} 个 expose`
            : isEn
              ? 'No exposes found in manifest'
              : 'Manifest 未提供 expose',
        );
      }
      return manifest;
    } catch (error) {
      const message = formatErrorForTerminal(error);
      setResolvedManifest(null);
      setExposeOptions([]);
      setExpose('');
      setOpenPanels((current) => ({
        ...current,
        code: false,
      }));
      setStatus(error instanceof Error ? error.message : String(error));
      syncGeneratedAppCode(null, '', exportName);
      syncGeneratedMfPlaceholder();
      if (appendTerminal) {
        appendTerminalLine('error', `Resolve manifest failed:\n${message}`);
      }
      throw error;
    } finally {
      setIsResolvingExpose(false);
    }
  };

  const onRun = async () => {
    setPreviewState(null);
    setRenderError(null);
    setStatus('编译中...');
    setTerminalLines([
      {
        id: Date.now(),
        level: 'info',
        message: 'Compiling sandbox...',
      },
    ]);

    try {
      const normalizedManifestUrl = manifestUrl.trim();
      const manifestForRun = await onManifestReady({
        appendTerminal: false,
        silentStatus: true,
      });

      const reactDependencyVersions = manifestForRun
        ? extractReactDependencyVersions(manifestForRun)
        : getDefaultReactDependencyVersions();
      const dependencyVersions = {
        ...reactDependencyVersions,
      };
      const nextRspackConfigCode = updateDependencyVersionsInRspackConfig(
        rspackConfigCode,
        dependencyVersions,
      );

      if (nextRspackConfigCode !== rspackConfigCode) {
        setRspackConfigCode(nextRspackConfigCode);
      }

      const remoteNameForRun = manifestForRun
        ? guessRemoteName(manifestForRun)
        : manifestName || normalizedManifestUrl || 'remote';
      const nextExposeForRun = normalizeExpose(
        expose || manifestForRun?.exposes?.[0]?.name || '',
      );
      const nextGeneratedAppCode = buildDefaultAppCode(
        formatLoadedTarget(remoteNameForRun, nextExposeForRun),
        exportName,
        nextExposeForRun,
        reactDependencyVersions.react,
        template,
      );
      const nextGeneratedMfCode = buildDefaultMfCode(
        normalizedManifestUrl,
        remoteNameForRun,
        reactDependencyVersions,
        template,
      );
      const nextAppCode =
        appCode === lastGeneratedAppCode ? nextGeneratedAppCode : appCode;
      const nextMfCode =
        mfCode === lastGeneratedMfCode ? nextGeneratedMfCode : mfCode;

      if (nextGeneratedAppCode !== lastGeneratedAppCode) {
        setLastGeneratedAppCode(nextGeneratedAppCode);
      }
      if (nextAppCode !== appCode) {
        setAppCode(nextAppCode);
      }
      if (nextGeneratedMfCode !== lastGeneratedMfCode) {
        setLastGeneratedMfCode(nextGeneratedMfCode);
      }
      if (nextMfCode !== mfCode) {
        setMfCode(nextMfCode);
      }

      const bundle = await compilePlaygroundApp({
        appCode: nextAppCode,
        entryCode,
        mfCode: nextMfCode,
        runtimeModuleUrl: defaults.runtimeModuleUrl,
        runtimeFileName: template.runtimeFileName,
        runtimeGlobalName: template.runtimeGlobalName,
        runtimePackageName: template.runtimePackageName,
        rspackConfigCode: nextRspackConfigCode,
      });
      const normalizedCurrentExpose = nextExposeForRun;
      const loadedTarget = formatLoadedTarget(
        remoteNameForRun,
        normalizedCurrentExpose,
      );
      const nextRunId = runId + 1;

      runIdRef.current = nextRunId;
      setRunId(nextRunId);
      setPreviewState({
        kind: 'consumer',
        bundle,
        loadedTarget,
        manifest: manifestForRun,
        manifestUrl: normalizedManifestUrl,
        expose: normalizedCurrentExpose,
        previewRoute: normalizePreviewRoute(previewRoute),
        runtimeModuleUrl: defaults.runtimeModuleUrl,
        runId: nextRunId,
      });
      setStatus('完成');
      appendTerminalLine(
        'info',
        'Sandbox bundle compiled. Preview is running.',
      );
    } catch (error) {
      const message = formatErrorForTerminal(error);
      setStatus(error instanceof Error ? error.message : String(error));
      appendTerminalLine('error', `Run Sandbox failed:\n${message}`);
    }
  };

  onRunRef.current = onRun;

  useEffect(() => {
    if (!initialQueryConfig.autoRun || autoRunStartedRef.current) {
      return;
    }

    autoRunStartedRef.current = true;
    void onRunRef.current?.();
  }, [initialQueryConfig.autoRun]);

  const copyText = async (key: string, text: string, okMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setStatus(okMsg);
      window.setTimeout(() => setCopiedKey(''), 1000);
    } catch {
      setStatus('复制失败：浏览器不支持 clipboard API（可手动复制）');
    }
  };

  const CopyButton = (props: {
    copyKey: string;
    label?: string;
    okMsg: string;
    text: string;
  }) => {
    const { copyKey, label, okMsg, text } = props;
    const done = copiedKey === copyKey;
    return (
      <button
        type="button"
        className={cx('vp-copyBtn')}
        onClick={() => void copyText(copyKey, text, okMsg)}
        title={done ? 'Copied' : 'Copy'}
      >
        <svg
          aria-hidden="true"
          className={cx('vp-copyIcon')}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 7.5C8 6.119 9.119 5 10.5 5H18c1.381 0 2.5 1.119 2.5 2.5V15c0 1.381-1.119 2.5-2.5 2.5h-7.5C9.119 17.5 8 16.381 8 15V7.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M5 9.5C5 8.119 6.119 7 7.5 7H8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M5 18.5C5 19.881 6.119 21 7.5 21H15c1.381 0 2.5-1.119 2.5-2.5V18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span>{done ? 'Copied' : label || 'Copy'}</span>
      </button>
    );
  };

  const renderPreview = () => {
    if (!previewState) {
      return (
        <div className={cx('vp-empty')}>
          <div className={cx('vp-emptyTitle')}>Ready.</div>
          <div>
            {isEn
              ? '1. Fill in the Manifest URL first.'
              : '1. 先填写 Manifest URL。'}
          </div>
          <div>
            {isEn
              ? '2. Click Run Sandbox. It resolves the manifest first, then starts the preview if everything is valid.'
              : '2. 点击 Run Sandbox。它会先解析 Manifest，没问题再启动右侧预览。'}
          </div>
          <div>
            {isEn
              ? '3. If manifest parsing fails, check the terminal below for the exact error.'
              : '3. 如果 Manifest 解析失败，直接看下方 Terminal 里的具体报错。'}
          </div>
          <div>
            {isEn
              ? '4. If you still need to adjust how the producer is loaded, edit the consumer code in the Code panel on the left. The Code panel only appears and loads after the first successful Manifest resolve.'
              : '4. 如果还需要调整加载方式，再去修改左侧 Code 里的消费者代码。Code 只有在第一次解析 Manifest 成功后才会出现并加载。'}
          </div>
        </div>
      );
    }

    if (previewState.kind === 'consumer') {
      const { expose: currentExpose, runId: currentRunId } = previewState;
      return (
        <div>
          <div className={cx('vp-kv')}>
            Target:{' '}
            {formatLoadedTarget(manifestName || 'remote', currentExpose)}
          </div>
          <div className={cx('vp-renderArea')}>
            <iframe
              key={currentRunId}
              className={cx('vp-previewFrame')}
              title="Sandbox Preview"
              srcDoc={buildPreviewDocument(previewState, defaults)}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  const renderTerminal = () => {
    return (
      <div className={cx('vp-terminal')}>
        <div className={cx('vp-terminalHeader')}>
          <span>Terminal</span>
          <button
            type="button"
            className={cx('vp-terminalClear')}
            onClick={() => setTerminalLines([])}
          >
            Clear
          </button>
        </div>
        <div className={cx('vp-terminalBody')}>
          {terminalLines.length > 0 ? (
            terminalLines.map((line) => (
              <pre
                key={line.id}
                className={cx(
                  'vp-terminalLine',
                  line.level === 'error' && 'vp-terminalLineError',
                  line.level === 'warn' && 'vp-terminalLineWarn',
                )}
              >
                {line.message}
              </pre>
            ))
          ) : (
            <div className={cx('vp-terminalEmpty')}>No output.</div>
          )}
        </div>
      </div>
    );
  };

  const fileState = {
    'app.tsx': {
      value: appCode,
      onChange: setAppCode,
    },
    'entry.ts': {
      value: entryCode,
      onChange: setEntryCode,
    },
    runtime: {
      value: mfCode,
      onChange: setMfCode,
    },
    'rspack.config.mjs': {
      value: rspackConfigCode,
      onChange: setRspackConfigCode,
    },
  } satisfies Record<
    EditorFileKey,
    { onChange: (value: string) => void; value: string }
  >;

  const activeTab =
    fileTabs.find((item) => item.key === activeFile) || fileTabs[0];
  const activeEditor = fileState[activeTab.key];
  const editorPath = getEditorPath(activeTab.key, template);
  const editorTheme = useEditorTheme();
  const locale = useLocale();
  const isEn = locale === 'en';
  const canShowCodePanel = Boolean(resolvedManifest);
  const displayStatus = renderError?.message || status || 'Idle';
  const visibleExposeOptions =
    expose && !exposeOptions.includes(expose)
      ? [expose, ...exposeOptions]
      : exposeOptions;
  const moduleNameText =
    previewState?.kind === 'consumer'
      ? formatLoadedTarget(manifestName || 'remote', previewState.expose)
      : 'editor mode';
  const mainStyle = isDesktopLayout
    ? {
        gridTemplateColumns: `minmax(0, ${leftPaneWidth}fr) 10px minmax(0, ${
          100 - leftPaneWidth
        }fr)`,
      }
    : undefined;
  return (
    <div className={cx('vp-root')}>
      <main className={cx('vp-main')} style={mainStyle}>
        <section className={cx('vp-left')}>
          <div className={cx('vp-card')}>
            <div className={cx('vp-cardHeader')}>
              <div className={cx('vp-cardTitle')}>Workspace</div>
              <div className={cx('vp-paneActions')}>
                <button
                  type="button"
                  className={cx('vp-button', 'vp-buttonPrimary')}
                  onClick={onRun}
                  title="Run Sandbox"
                >
                  <span>Run Sandbox</span>
                </button>
              </div>
            </div>
            <div className={cx('vp-cardBody')}>
              <div className={cx('vp-collapse')}>
                <div className={cx('vp-collapseItem')}>
                  <button
                    type="button"
                    className={cx(
                      'vp-collapseHeader',
                      openPanels.control && 'vp-collapseHeaderActive',
                    )}
                    onClick={() =>
                      setOpenPanels((current) => ({
                        ...current,
                        control: !current.control,
                      }))
                    }
                    aria-expanded={openPanels.control}
                  >
                    <span className={cx('vp-collapseLabel')}>
                      Control Panel
                    </span>
                    <span
                      className={cx(
                        'vp-collapseArrow',
                        openPanels.control && 'vp-collapseArrowOpen',
                      )}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M4.5 6.5L8 10L11.5 6.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                  {openPanels.control ? (
                    <div className={cx('vp-collapseBody')}>
                      <div className={cx('vp-form')}>
                        <div className={cx('vp-field')}>
                          <div className={cx('vp-labelRow')}>
                            <div className={cx('vp-label')}>Manifest URL</div>
                            <div className={cx('vp-hint')}>
                              {isEn
                                ? 'Run Sandbox resolves this automatically'
                                : '点击 Run Sandbox 时自动解析'}
                            </div>
                          </div>
                          <input
                            className={cx('vp-input')}
                            value={manifestUrl}
                            onChange={(event) => {
                              setManifestUrl(event.target.value);
                              setResolvedManifest(null);
                              setExposeOptions([]);
                              setExpose('');
                              setOpenPanels((current) => ({
                                ...current,
                                code: false,
                              }));
                              syncGeneratedAppCode(null, '', exportName);
                              syncGeneratedMfPlaceholder();
                            }}
                            placeholder="https://.../mf-manifest.json"
                          />
                        </div>

                        <div className={cx('vp-fieldGrid')}>
                          <div className={cx('vp-field')}>
                            <div className={cx('vp-labelRow')}>
                              <div className={cx('vp-label')}>Expose</div>
                              <div className={cx('vp-hint')}>
                                {manifestName
                                  ? `Remote: ${manifestName}`
                                  : isEn
                                    ? 'Auto read from manifest'
                                    : '从 manifest 自动读取'}
                              </div>
                            </div>
                            <select
                              className={cx('vp-select')}
                              value={expose}
                              onChange={(event) => {
                                const nextExpose = event.target.value;
                                setExpose(nextExpose);
                                syncGeneratedAppCode(
                                  resolvedManifest,
                                  nextExpose,
                                  exportName,
                                );
                                syncGeneratedMfCode(
                                  manifestUrl.trim(),
                                  resolvedManifest,
                                );
                              }}
                              disabled={isResolvingExpose}
                            >
                              {visibleExposeOptions.length > 0 ? (
                                visibleExposeOptions.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))
                              ) : (
                                <option value="">
                                  {isEn
                                    ? 'Run Sandbox to load expose options'
                                    : '点击 Run Sandbox 后加载 expose'}
                                </option>
                              )}
                            </select>
                          </div>

                          <div className={cx('vp-field')}>
                            <div className={cx('vp-labelRow')}>
                              <div className={cx('vp-label')}>Export</div>
                              <div className={cx('vp-hint')}>
                                {isEn
                                  ? 'Default is default; you can switch to a named export'
                                  : '默认 default，可改成具名导出'}
                              </div>
                            </div>
                            <input
                              className={cx('vp-input')}
                              value={exportName}
                              onChange={(event) => {
                                const nextExportName = event.target.value;
                                setExportName(nextExportName);
                                syncGeneratedAppCode(
                                  resolvedManifest,
                                  expose,
                                  nextExportName,
                                );
                                syncGeneratedMfCode(
                                  manifestUrl.trim(),
                                  resolvedManifest,
                                );
                              }}
                              placeholder="default"
                            />
                          </div>
                        </div>

                        <div className={cx('vp-field')}>
                          <div className={cx('vp-labelRow')}>
                            <div className={cx('vp-label')}>Preview Route</div>
                            <div className={cx('vp-hint')}>
                              {isEn
                                ? 'Match the basename used by export-app'
                                : '和 export-app 的 basename 保持一致'}
                            </div>
                          </div>
                          <input
                            className={cx('vp-input')}
                            value={previewRoute}
                            onChange={(event) => {
                              setPreviewRoute(event.target.value);
                            }}
                            placeholder="/"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {canShowCodePanel ? (
                  <div className={cx('vp-collapseItem')}>
                    <button
                      type="button"
                      className={cx(
                        'vp-collapseHeader',
                        openPanels.code && 'vp-collapseHeaderActive',
                      )}
                      onClick={() =>
                        setOpenPanels((current) => ({
                          ...current,
                          code: !current.code,
                        }))
                      }
                      aria-expanded={openPanels.code}
                    >
                      <span className={cx('vp-collapseLabel')}>Code</span>
                      <span
                        className={cx(
                          'vp-collapseArrow',
                          openPanels.code && 'vp-collapseArrowOpen',
                        )}
                      >
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M4.5 6.5L8 10L11.5 6.5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                    {openPanels.code ? (
                      <div
                        className={cx('vp-collapseBody', 'vp-collapseBodyCode')}
                      >
                        <div className={cx('vp-editorToolbar')}>
                          <div
                            className={cx('vp-editorTabs')}
                            role="tablist"
                            aria-label="Files"
                          >
                            {fileTabs.map((item) => (
                              <button
                                key={item.key}
                                type="button"
                                className={
                                  item.key === activeTab.key
                                    ? cx('vp-editorTab', 'vp-editorTabActive')
                                    : cx('vp-editorTab')
                                }
                                onClick={() => setActiveFile(item.key)}
                              >
                                {item.label || item.key}
                              </button>
                            ))}
                          </div>
                          <CopyButton
                            copyKey={activeTab.copyKey}
                            label="Copy"
                            okMsg={activeTab.copyMessage}
                            text={activeEditor.value}
                          />
                        </div>
                        <div className={cx('vp-codeEditor')}>
                          <Editor
                            key={editorPath}
                            height="100%"
                            language={getEditorLanguage(activeTab.key)}
                            path={editorPath}
                            theme={editorTheme}
                            value={activeEditor.value}
                            loading={<EditorLoadingState />}
                            options={{
                              automaticLayout: true,
                              fontFamily:
                                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                              fontSize: 13,
                              lineHeight: 21,
                              minimap: { enabled: false },
                              padding: { top: 12, bottom: 12 },
                              scrollBeyondLastLine: false,
                              tabSize: 2,
                              wordWrap: 'on',
                            }}
                            beforeMount={(monaco) =>
                              configureEditor(monaco, template)
                            }
                            onMount={(_, monaco) => {
                              monacoRef.current = monaco;
                              syncEditorModels(monaco, editorFiles, template);
                            }}
                            onChange={(value) =>
                              activeEditor.onChange(value || '')
                            }
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div
          className={cx('vp-splitter')}
          aria-hidden="true"
          onMouseDown={
            isDesktopLayout
              ? (event) => {
                  resizeStateRef.current = {
                    startWidth: leftPaneWidth,
                    startX: event.clientX,
                  };
                }
              : undefined
          }
        />

        <section className={cx('vp-right')}>
          <div className={cx('vp-ide')}>
            <div className={cx('vp-ideTitlebar')}>
              <div className={cx('vp-ideDots')}>
                <span className={cx('vp-dot', 'vp-dotRed')} />
                <span className={cx('vp-dot', 'vp-dotYellow')} />
                <span className={cx('vp-dot', 'vp-dotGreen')} />
              </div>
              <div className={cx('vp-ideTitle')}>Sandbox Preview</div>
              <div className={cx('vp-ideMeta')}>
                <span className={cx('vp-ideMetaText')} title={moduleNameText}>
                  {moduleNameText}
                </span>
                <span className={cx('vp-ideStatus')} title={displayStatus}>
                  {displayStatus}
                </span>
              </div>
            </div>
            <div className={cx('vp-ideBody')}>
              {renderPreview()}
              {renderTerminal()}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App(props: PlaygroundProps) {
  const defaults = useMemo(() => getPlaygroundDefaults(props), [props]);

  return (
    <RenderErrorBoundary>
      <AppInner defaults={defaults} />
    </RenderErrorBoundary>
  );
}
