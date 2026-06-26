import ts from 'typescript';
import { BRIDGE_RUNTIME_FILES } from './generated/bridgeRuntimeFiles';

export type CompilePlaygroundParams = {
  appCode: string;
  entryCode: string;
  mfCode: string;
  rspackConfigCode: string;
  runtimeFileName: string;
  runtimeGlobalName: string;
  runtimeModuleUrl: string;
  runtimePackageName: string;
};

const ENTRY_FILE = 'entry.ts';
const APP_FILE = 'app.tsx';
const BRIDGE_ROOT = 'bridge';
const BRIDGE_INDEX_FILE = `${BRIDGE_ROOT}/index.es.js`;
const BRIDGE_ROUTER_STUB_FILE = `${BRIDGE_ROOT}/react-router-dom-stub.js`;

const BRIDGE_ROUTER_STUB_SOURCE = `export function useLocation() {
  throw new Error('react-router-dom is not available in playground bridge runtime.');
}
export const useRouteMatch = undefined;
export const useHistory = undefined;
export const useHref = undefined;
export const UNSAFE_RouteContext = undefined;
export default {};
`;

const BRIDGE_REACT_SHIM_SOURCE = `const React = window.React;
if (!React) {
  throw new Error('React runtime is not available for bridge runtime.');
}
export default React;
export const Component = React.Component;
export const Suspense = React.Suspense;
export const createContext = React.createContext;
export const createElement = React.createElement;
export const forwardRef = React.forwardRef;
export const lazy = React.lazy;
export const useContext = React.useContext;
export const useEffect = React.useEffect;
export const useRef = React.useRef;
export const useState = React.useState;
`;

const BRIDGE_REACT_DOM_SHIM_SOURCE = `const ReactDOM = window.ReactDOM;
if (!ReactDOM) {
  throw new Error('ReactDOM runtime is not available for bridge runtime.');
}
export default ReactDOM;
export const createRoot = ReactDOM.createRoot;
export const render = ReactDOM.render;
export const unmountComponentAtNode = ReactDOM.unmountComponentAtNode;
`;

const BRIDGE_SHIM_MODULES = {
  react: BRIDGE_REACT_SHIM_SOURCE,
  'react-dom': BRIDGE_REACT_DOM_SHIM_SOURCE,
  'react-dom/client': BRIDGE_REACT_DOM_SHIM_SOURCE,
};

function buildBridgeRuntimeFiles() {
  return {
    ...Object.fromEntries(
      Object.entries(BRIDGE_RUNTIME_FILES).map(([filename, source]) => [
        `${BRIDGE_ROOT}/${filename}`,
        String(source).replace(
          /(["'])react-router-dom\1/g,
          '$1./react-router-dom-stub.js$1',
        ),
      ]),
    ),
    [BRIDGE_ROUTER_STUB_FILE]: BRIDGE_ROUTER_STUB_SOURCE,
  };
}

function transpileModule(filename: string, source: string) {
  const result = ts.transpileModule(source, {
    fileName: filename,
    compilerOptions: {
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2020,
    },
  });

  if (result.diagnostics?.length) {
    const message = result.diagnostics
      .map((diagnostic) =>
        typeof diagnostic.messageText === 'string'
          ? diagnostic.messageText
          : diagnostic.messageText.messageText,
      )
      .join('\n');

    if (message) {
      throw new Error(message);
    }
  }

  return result.outputText;
}

function createModuleFactory(filename: string, source: string) {
  return `${JSON.stringify(filename)}: function(require, module, exports) {\n${transpileModule(filename, source)}\n}`;
}

function normalizeRuntimeFileName(value: string) {
  const normalized = value.trim().replace(/^\.\/+/, '');
  if (!normalized || normalized.includes('/') || normalized.includes('\\')) {
    return 'mf.ts';
  }
  return normalized.endsWith('.ts') ? normalized : `${normalized}.ts`;
}

function getRuntimeFileBaseName(filename: string) {
  return filename.replace(/\.ts$/, '');
}

function normalizeGlobalName(value: string) {
  const normalized = value.trim().replace(/[^\w$]/g, '_');
  if (!normalized || /^\d/.test(normalized)) {
    return 'ModuleFederationRuntime';
  }
  return normalized;
}

function getRuntimeGlobalNames(primaryName: string) {
  const names = [primaryName.trim()].filter(Boolean);

  return [...new Set(names)];
}

function createBridgeRuntimeBootstrap() {
  return `
  var bridgeRuntimeFiles = ${JSON.stringify(buildBridgeRuntimeFiles())};
  var bridgeShimModules = ${JSON.stringify(BRIDGE_SHIM_MODULES)};
  var bridgeModuleUrlCache = {};
  var bridgeShimUrlCache = {};
  function createBridgeDataUrl(source) {
    return URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  }
  function createBridgeShimUrl(request) {
    if (!bridgeShimModules[request]) {
      throw new Error('Unsupported bridge runtime dependency: ' + request);
    }
    if (!bridgeShimUrlCache[request]) {
      bridgeShimUrlCache[request] = createBridgeDataUrl(bridgeShimModules[request]);
    }
    return bridgeShimUrlCache[request];
  }
  function resolveBridgeModulePath(from, request) {
    if (request.indexOf('./') !== 0) {
      return request;
    }
    var parts = from.split('/');
    parts.pop();
    request.slice(2).split('/').forEach(function(part) {
      if (!part || part === '.') {
        return;
      }
      if (part === '..') {
        parts.pop();
        return;
      }
      parts.push(part);
    });
    return parts.join('/');
  }
  function createBridgeModuleUrl(filename) {
    if (bridgeModuleUrlCache[filename]) {
      return bridgeModuleUrlCache[filename];
    }
    var source = bridgeRuntimeFiles[filename];
    if (!source) {
      throw new Error('Bridge runtime source not found: ' + filename);
    }
    source = source.replace(/from\\s+["']([^"']+)["']/g, function(full, request) {
      if (request.indexOf('./') === 0) {
        return 'from ' + JSON.stringify(createBridgeModuleUrl(resolveBridgeModulePath(filename, request)));
      }
      if (bridgeShimModules[request]) {
        return 'from ' + JSON.stringify(createBridgeShimUrl(request));
      }
      return full;
    });
    bridgeModuleUrlCache[filename] = createBridgeDataUrl(source);
    return bridgeModuleUrlCache[filename];
  }
  async function ensureBridgeRuntime() {
    if (window.__MF_PLAYGROUND_BRIDGE__) {
      return window.__MF_PLAYGROUND_BRIDGE__;
    }
    window.__MF_PLAYGROUND_BRIDGE__ = await import(createBridgeModuleUrl(${JSON.stringify(BRIDGE_INDEX_FILE)}));
    return window.__MF_PLAYGROUND_BRIDGE__;
  }
`;
}

export async function compilePlaygroundApp(
  params: CompilePlaygroundParams,
): Promise<string> {
  void params.rspackConfigCode;

  const runtimeModuleUrl = params.runtimeModuleUrl.trim();
  if (!runtimeModuleUrl) {
    throw new Error('runtimeModuleUrl is required.');
  }

  const runtimeFileName = normalizeRuntimeFileName(params.runtimeFileName);
  const runtimeFileBaseName = getRuntimeFileBaseName(runtimeFileName);
  const runtimeGlobalName = normalizeGlobalName(params.runtimeGlobalName);
  const runtimeGlobalNames = getRuntimeGlobalNames(runtimeGlobalName);
  const runtimePackageName =
    params.runtimePackageName.trim() || '@module-federation/runtime';
  const factories = [
    createModuleFactory(APP_FILE, params.appCode),
    createModuleFactory(runtimeFileName, params.mfCode),
    createModuleFactory(ENTRY_FILE, params.entryCode),
  ].join(',\n');

  return `(async function() {
${createBridgeRuntimeBootstrap()}
  var bridgeExports = await ensureBridgeRuntime();
  var mfRuntimePromise = null;
  var runtimeGlobalName = ${JSON.stringify(runtimeGlobalName)};
  var runtimeGlobalNames = ${JSON.stringify(runtimeGlobalNames)};
  var runtimePackageName = ${JSON.stringify(runtimePackageName)};
  function getRuntimeFromWindow() {
    for (var i = 0; i < runtimeGlobalNames.length; i++) {
      var name = runtimeGlobalNames[i];
      var runtime = window[name];
      if (runtime && runtime.createInstance) {
        window[runtimeGlobalName] = runtime;
        return runtime;
      }
    }
    return null;
  }
  function loadClassicRuntimeScript() {
    return new Promise(function(resolve, reject) {
      var existingRuntime = getRuntimeFromWindow();
      if (existingRuntime) {
        resolve(existingRuntime);
        return;
      }
      var script = document.createElement('script');
      script.src = ${JSON.stringify(runtimeModuleUrl)};
      script.async = true;
      script.onload = function() {
        var runtime = getRuntimeFromWindow();
        if (runtime) {
          resolve(runtime);
          return;
        }
        reject(new Error('Runtime script loaded but no runtime global was found.'));
      };
      script.onerror = function() {
        reject(new Error('Failed to load runtime script: ' + ${JSON.stringify(runtimeModuleUrl)}));
      };
      document.head.appendChild(script);
    });
  }
  function loadModuleFederationRuntime() {
    var existingRuntime = getRuntimeFromWindow();
    if (existingRuntime) return Promise.resolve(existingRuntime);
    if (!mfRuntimePromise) {
      mfRuntimePromise = import(${JSON.stringify(runtimeModuleUrl)}).then(function(runtime) {
        var runtimeCandidate = runtime && runtime.createInstance ? runtime : getRuntimeFromWindow();
        if (runtimeCandidate) {
          window[runtimeGlobalName] = runtimeCandidate;
          return runtimeCandidate;
        }
        return loadClassicRuntimeScript();
      }).catch(loadClassicRuntimeScript);
    }
    return mfRuntimePromise;
  }
  var modules = {
${factories}
  };
  var cache = {};
  var aliases = {
    './app': 'app.tsx',
    './app.tsx': 'app.tsx',
    ${JSON.stringify(`./${runtimeFileBaseName}`)}: ${JSON.stringify(runtimeFileName)},
    ${JSON.stringify(`./${runtimeFileName}`)}: ${JSON.stringify(runtimeFileName)}
  };
  function require(request) {
    var id = aliases[request] || request;
    if (request === 'react') return window.React;
    if (request === 'react-dom' || request === 'react-dom/client') return window.ReactDOM;
    if (
      request === runtimePackageName ||
      request === '@module-federation/runtime'
    ) {
      return getRuntimeFromWindow();
    }
    if (request === './bridge/index.es.js') return bridgeExports;
    if (request.indexOf('@module-federation/bridge-react') === 0) return bridgeExports;
    if (!modules[id]) {
      throw new Error('Module not found in playground bundle: ' + request);
    }
    if (cache[id]) return cache[id].exports;
    var module = { exports: {} };
    cache[id] = module;
    modules[id](require, module, module.exports);
    return module.exports;
  }
  await loadModuleFederationRuntime();
  require(${JSON.stringify(ENTRY_FILE)});
})();`;
}
