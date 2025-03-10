import * as Vue from 'vue';
import {
  defineComponent,
  ref,
  useAttrs,
  watch,
  onMounted,
  onBeforeUnmount,
  createVNode,
  mergeProps,
  defineAsyncComponent,
  h,
} from 'vue';
import { useRoute } from 'vue-router';
const MANIFEST_EXT = '.json',
  BROWSER_LOG_KEY = 'FEDERATION_DEBUG',
  BROWSER_LOG_VALUE = '1',
  SEPARATOR = ':';
function isBrowserEnv() {
  return typeof window < 'u';
}
function isBrowserDebug() {
  try {
    if (isBrowserEnv() && window.localStorage)
      return localStorage.getItem(BROWSER_LOG_KEY) === BROWSER_LOG_VALUE;
  } catch {
    return !1;
  }
  return !1;
}
function isDebugMode() {
  return typeof process < 'u' && process.env && process.env.FEDERATION_DEBUG
    ? !!process.env.FEDERATION_DEBUG
    : typeof FEDERATION_DEBUG < 'u' && FEDERATION_DEBUG
      ? !0
      : isBrowserDebug();
}
const LOG_CATEGORY$1 = '[ Federation Runtime ]',
  composeKeyWithSeparator = function (...n) {
    return n.length
      ? n.reduce((t, o) => (o ? (t ? `${t}${SEPARATOR}${o}` : o) : t), '')
      : '';
  },
  getResourceUrl = (n, t) => {
    if ('getPublicPath' in n) {
      let o;
      return (
        n.getPublicPath.startsWith('function')
          ? (o = new Function('return ' + n.getPublicPath)()())
          : (o = new Function(n.getPublicPath)()),
        `${o}${t}`
      );
    } else
      return 'publicPath' in n
        ? `${n.publicPath}${t}`
        : (console.warn(
            'Cannot get resource URL. If in debug mode, please ignore.',
            n,
            t,
          ),
          '');
  },
  warn$1 = (n) => {
    console.warn(`${LOG_CATEGORY$1}: ${n}`);
  };
function safeToString(n) {
  try {
    return JSON.stringify(n, null, 2);
  } catch {
    return '';
  }
}
function _extends$2() {
  return (
    (_extends$2 =
      Object.assign ||
      function (t) {
        for (var o = 1; o < arguments.length; o++) {
          var r = arguments[o];
          for (var s in r)
            Object.prototype.hasOwnProperty.call(r, s) && (t[s] = r[s]);
        }
        return t;
      }),
    _extends$2.apply(this, arguments)
  );
}
const simpleJoinRemoteEntry = (n, t) => {
  if (!n) return t;
  const r = ((s) => {
    if (s === '.') return '';
    if (s.startsWith('./')) return s.replace('./', '');
    if (s.startsWith('/')) {
      const l = s.slice(1);
      return l.endsWith('/') ? l.slice(0, -1) : l;
    }
    return s;
  })(n);
  return r ? (r.endsWith('/') ? `${r}${t}` : `${r}/${t}`) : t;
};
function inferAutoPublicPath(n) {
  return n
    .replace(/#.*$/, '')
    .replace(/\?.*$/, '')
    .replace(/\/[^\/]+$/, '/');
}
function generateSnapshotFromManifest(n, t = {}) {
  var o, r;
  const { remotes: s = {}, overrides: l = {}, version: a } = t;
  let i;
  const c = () =>
      'publicPath' in n.metaData
        ? n.metaData.publicPath === 'auto' && a
          ? inferAutoPublicPath(a)
          : n.metaData.publicPath
        : n.metaData.getPublicPath,
    u = Object.keys(l);
  let d = {};
  if (!Object.keys(s).length) {
    var m;
    d =
      ((m = n.remotes) == null
        ? void 0
        : m.reduce((b, A) => {
            let T;
            const $ = A.federationContainerName;
            return (
              u.includes($)
                ? (T = l[$])
                : 'version' in A
                  ? (T = A.version)
                  : (T = A.entry),
              (b[$] = {
                matchedVersion: T,
              }),
              b
            );
          }, {})) || {};
  }
  Object.keys(s).forEach(
    (b) =>
      (d[b] = {
        // overrides will override dependencies
        matchedVersion: u.includes(b) ? l[b] : s[b],
      }),
  );
  const {
      remoteEntry: { path: p, name: y, type: g },
      types: E,
      buildInfo: { buildVersion: _ },
      globalName: R,
      ssrRemoteEntry: v,
    } = n.metaData,
    { exposes: I } = n;
  let S = {
    version: a || '',
    buildVersion: _,
    globalName: R,
    remoteEntry: simpleJoinRemoteEntry(p, y),
    remoteEntryType: g,
    remoteTypes: simpleJoinRemoteEntry(E.path, E.name),
    remoteTypesZip: E.zip || '',
    remoteTypesAPI: E.api || '',
    remotesInfo: d,
    shared:
      n == null
        ? void 0
        : n.shared.map((b) => ({
            assets: b.assets,
            sharedName: b.name,
            version: b.version,
          })),
    modules:
      I == null
        ? void 0
        : I.map((b) => ({
            moduleName: b.name,
            modulePath: b.path,
            assets: b.assets,
          })),
  };
  if ((o = n.metaData) != null && o.prefetchInterface) {
    const b = n.metaData.prefetchInterface;
    S = _extends$2({}, S, {
      prefetchInterface: b,
    });
  }
  if ((r = n.metaData) != null && r.prefetchEntry) {
    const { path: b, name: A, type: T } = n.metaData.prefetchEntry;
    S = _extends$2({}, S, {
      prefetchEntry: simpleJoinRemoteEntry(b, A),
      prefetchEntryType: T,
    });
  }
  if (
    ('publicPath' in n.metaData
      ? (i = _extends$2({}, S, {
          publicPath: c(),
        }))
      : (i = _extends$2({}, S, {
          getPublicPath: c(),
        })),
    v)
  ) {
    const b = simpleJoinRemoteEntry(v.path, v.name);
    (i.ssrRemoteEntry = b),
      (i.ssrRemoteEntryType = v.type || 'commonjs-module');
  }
  return i;
}
function isManifestProvider(n) {
  return !!('remoteEntry' in n && n.remoteEntry.includes(MANIFEST_EXT));
}
let Logger = class {
  log(...t) {
    console.log(this.prefix, ...t);
  }
  warn(...t) {
    console.log(this.prefix, ...t);
  }
  error(...t) {
    console.log(this.prefix, ...t);
  }
  success(...t) {
    console.log(this.prefix, ...t);
  }
  info(...t) {
    console.log(this.prefix, ...t);
  }
  ready(...t) {
    console.log(this.prefix, ...t);
  }
  debug(...t) {
    isDebugMode() && console.log(this.prefix, ...t);
  }
  constructor(t) {
    this.prefix = t;
  }
};
function createLogger(n) {
  return new Logger(n);
}
async function safeWrapper(n, t) {
  try {
    return await n();
  } catch (o) {
    warn$1(o);
    return;
  }
}
function isStaticResourcesEqual(n, t) {
  const o = /^(https?:)?\/\//i,
    r = n.replace(o, '').replace(/\/$/, ''),
    s = t.replace(o, '').replace(/\/$/, '');
  return r === s;
}
function createScript(n) {
  let t = null,
    o = !0,
    r = 2e4,
    s;
  const l = document.getElementsByTagName('script');
  for (let i = 0; i < l.length; i++) {
    const c = l[i],
      u = c.getAttribute('src');
    if (u && isStaticResourcesEqual(u, n.url)) {
      (t = c), (o = !1);
      break;
    }
  }
  if (!t) {
    const i = n.attrs;
    (t = document.createElement('script')),
      (t.type =
        (i == null ? void 0 : i.type) === 'module'
          ? 'module'
          : 'text/javascript');
    let c;
    n.createScriptHook &&
      ((c = n.createScriptHook(n.url, n.attrs)),
      c instanceof HTMLScriptElement
        ? (t = c)
        : typeof c == 'object' &&
          ('script' in c && c.script && (t = c.script),
          'timeout' in c && c.timeout && (r = c.timeout))),
      t.src || (t.src = n.url),
      i &&
        !c &&
        Object.keys(i).forEach((u) => {
          t &&
            (u === 'async' || u === 'defer'
              ? (t[u] = i[u])
              : t.getAttribute(u) || t.setAttribute(u, i[u]));
        });
  }
  const a = async (i, c) => {
    clearTimeout(s);
    const u = () => {
      (c == null ? void 0 : c.type) === 'error'
        ? n != null && n.onErrorCallback && (n == null || n.onErrorCallback(c))
        : n != null && n.cb && (n == null || n.cb());
    };
    if (
      t &&
      ((t.onerror = null),
      (t.onload = null),
      safeWrapper(() => {
        const { needDeleteScript: d = !0 } = n;
        d && t != null && t.parentNode && t.parentNode.removeChild(t);
      }),
      i && typeof i == 'function')
    ) {
      const d = i(c);
      if (d instanceof Promise) {
        const m = await d;
        return u(), m;
      }
      return u(), d;
    }
    u();
  };
  return (
    (t.onerror = a.bind(null, t.onerror)),
    (t.onload = a.bind(null, t.onload)),
    (s = setTimeout(() => {
      a(null, new Error(`Remote script "${n.url}" time-outed.`));
    }, r)),
    {
      script: t,
      needAttach: o,
    }
  );
}
function createLink(n) {
  let t = null,
    o = !0;
  const r = document.getElementsByTagName('link');
  for (let l = 0; l < r.length; l++) {
    const a = r[l],
      i = a.getAttribute('href'),
      c = a.getAttribute('rel');
    if (i && isStaticResourcesEqual(i, n.url) && c === n.attrs.rel) {
      (t = a), (o = !1);
      break;
    }
  }
  if (!t) {
    (t = document.createElement('link')), t.setAttribute('href', n.url);
    let l;
    const a = n.attrs;
    n.createLinkHook &&
      ((l = n.createLinkHook(n.url, a)),
      l instanceof HTMLLinkElement && (t = l)),
      a &&
        !l &&
        Object.keys(a).forEach((i) => {
          t && !t.getAttribute(i) && t.setAttribute(i, a[i]);
        });
  }
  const s = (l, a) => {
    const i = () => {
      (a == null ? void 0 : a.type) === 'error'
        ? n != null && n.onErrorCallback && (n == null || n.onErrorCallback(a))
        : n != null && n.cb && (n == null || n.cb());
    };
    if (
      t &&
      ((t.onerror = null),
      (t.onload = null),
      safeWrapper(() => {
        const { needDeleteLink: c = !0 } = n;
        c && t != null && t.parentNode && t.parentNode.removeChild(t);
      }),
      l)
    ) {
      const c = l(a);
      return i(), c;
    }
    i();
  };
  return (
    (t.onerror = s.bind(null, t.onerror)),
    (t.onload = s.bind(null, t.onload)),
    {
      link: t,
      needAttach: o,
    }
  );
}
function loadScript(n, t) {
  const { attrs: o = {}, createScriptHook: r } = t;
  return new Promise((s, l) => {
    const { script: a, needAttach: i } = createScript({
      url: n,
      cb: s,
      onErrorCallback: l,
      attrs: _extends$2(
        {
          fetchpriority: 'high',
        },
        o,
      ),
      createScriptHook: r,
      needDeleteScript: !0,
    });
    i && document.head.appendChild(a);
  });
}
function importNodeModule(n) {
  if (!n) throw new Error('import specifier is required');
  return new Function('name', 'return import(name)')(n)
    .then((o) => o)
    .catch((o) => {
      throw (console.error(`Error importing module ${n}:`, o), o);
    });
}
const loadNodeFetch = async () => {
    const n = await importNodeModule('node-fetch');
    return n.default || n;
  },
  lazyLoaderHookFetch = async (n, t, o) => {
    const s = await ((l, a) => o.lifecycle.fetch.emit(l, a))(n, t || {});
    return !s || !(s instanceof Response)
      ? (typeof fetch > 'u' ? await loadNodeFetch() : fetch)(n, t || {})
      : s;
  };
function createScriptNode(url, cb, attrs, loaderHook) {
  if (loaderHook != null && loaderHook.createScriptHook) {
    const n = loaderHook.createScriptHook(url);
    n && typeof n == 'object' && 'url' in n && (url = n.url);
  }
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch (n) {
    console.error('Error constructing URL:', n),
      cb(new Error(`Invalid URL: ${n}`));
    return;
  }
  const getFetch = async () =>
      loaderHook != null && loaderHook.fetch
        ? (n, t) => lazyLoaderHookFetch(n, t, loaderHook)
        : typeof fetch > 'u'
          ? loadNodeFetch()
          : fetch,
    handleScriptFetch = async (f, urlObj) => {
      try {
        var _vm_constants;
        const res = await f(urlObj.href),
          data = await res.text(),
          [path, vm] = await Promise.all([
            importNodeModule('path'),
            importNodeModule('vm'),
          ]),
          scriptContext = {
            exports: {},
            module: {
              exports: {},
            },
          },
          urlDirname = urlObj.pathname.split('/').slice(0, -1).join('/'),
          filename = path.basename(urlObj.pathname);
        var _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER;
        const script = new vm.Script(
          `(function(exports, module, require, __dirname, __filename) {${data}
})`,
          {
            filename,
            importModuleDynamically:
              (_vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER =
                (_vm_constants = vm.constants) == null
                  ? void 0
                  : _vm_constants.USE_MAIN_CONTEXT_DEFAULT_LOADER) != null
                ? _vm_constants_USE_MAIN_CONTEXT_DEFAULT_LOADER
                : importNodeModule,
          },
        );
        script.runInThisContext()(
          scriptContext.exports,
          scriptContext.module,
          eval('require'),
          urlDirname,
          filename,
        );
        const exportedInterface =
          scriptContext.module.exports || scriptContext.exports;
        if (attrs && exportedInterface && attrs.globalName) {
          const n = exportedInterface[attrs.globalName] || exportedInterface;
          cb(void 0, n);
          return;
        }
        cb(void 0, exportedInterface);
      } catch (n) {
        cb(n instanceof Error ? n : new Error(`Script execution error: ${n}`));
      }
    };
  getFetch()
    .then(async (n) => {
      if (
        (attrs == null ? void 0 : attrs.type) === 'esm' ||
        (attrs == null ? void 0 : attrs.type) === 'module'
      )
        return loadModule(urlObj.href, {
          fetch: n,
          vm: await importNodeModule('vm'),
        })
          .then(async (t) => {
            await t.evaluate(), cb(void 0, t.namespace);
          })
          .catch((t) => {
            cb(
              t instanceof Error
                ? t
                : new Error(`Script execution error: ${t}`),
            );
          });
      handleScriptFetch(n, urlObj);
    })
    .catch((n) => {
      cb(n);
    });
}
function loadScriptNode(n, t) {
  return new Promise((o, r) => {
    createScriptNode(
      n,
      (s, l) => {
        if (s) r(s);
        else {
          var a, i;
          const c =
              (t == null || (a = t.attrs) == null ? void 0 : a.globalName) ||
              `__FEDERATION_${t == null || (i = t.attrs) == null ? void 0 : i.name}:custom__`,
            u = (globalThis[c] = l);
          o(u);
        }
      },
      t.attrs,
      t.loaderHook,
    );
  });
}
async function loadModule(n, t) {
  const { fetch: o, vm: r } = t,
    l = await (await o(n)).text(),
    a = new r.SourceTextModule(l, {
      // @ts-ignore
      importModuleDynamically: async (i, c) => {
        const u = new URL(i, n).href;
        return loadModule(u, t);
      },
    });
  return (
    await a.link(async (i) => {
      const c = new URL(i, n).href;
      return await loadModule(c, t);
    }),
    a
  );
}
const LoggerInstance = createLogger('[ Module Federation Bridge Vue3 ]'),
  RUNTIME_001 = 'RUNTIME-001',
  RUNTIME_002 = 'RUNTIME-002',
  RUNTIME_003 = 'RUNTIME-003',
  RUNTIME_004 = 'RUNTIME-004',
  RUNTIME_005 = 'RUNTIME-005',
  RUNTIME_006 = 'RUNTIME-006',
  RUNTIME_007 = 'RUNTIME-007',
  RUNTIME_008 = 'RUNTIME-008',
  TYPE_001 = 'TYPE-001',
  BUILD_001 = 'BUILD-001',
  getDocsUrl = (n) =>
    `https://module-federation.io/guide/troubleshooting/${n.split('-')[0].toLowerCase()}/${n}`,
  getShortErrorMsg = (n, t, o, r) => {
    const s = [`${[t[n]]} #${n}`];
    return (
      o && s.push(`args: ${JSON.stringify(o)}`),
      s.push(getDocsUrl(n)),
      r &&
        s.push(`Original Error Message:
 ${r}`),
      s.join(`
`)
    );
  };
function _extends$1() {
  return (
    (_extends$1 =
      Object.assign ||
      function (t) {
        for (var o = 1; o < arguments.length; o++) {
          var r = arguments[o];
          for (var s in r)
            Object.prototype.hasOwnProperty.call(r, s) && (t[s] = r[s]);
        }
        return t;
      }),
    _extends$1.apply(this, arguments)
  );
}
const runtimeDescMap = {
    [RUNTIME_001]: 'Failed to get remoteEntry exports.',
    [RUNTIME_002]: 'The remote entry interface does not contain "init"',
    [RUNTIME_003]: 'Failed to get manifest.',
    [RUNTIME_004]: 'Failed to locate remote.',
    [RUNTIME_005]: 'Invalid loadShareSync function call from bundler runtime',
    [RUNTIME_006]: 'Invalid loadShareSync function call from runtime',
    [RUNTIME_007]: 'Failed to get remote snapshot.',
    [RUNTIME_008]: 'Failed to load script resources.',
  },
  typeDescMap = {
    [TYPE_001]: 'Failed to generate type declaration.',
  },
  buildDescMap = {
    [BUILD_001]: 'Failed to find expose module.',
  };
_extends$1({}, runtimeDescMap, typeDescMap, buildDescMap);
function _extends() {
  return (
    (_extends =
      Object.assign ||
      function (t) {
        for (var o = 1; o < arguments.length; o++) {
          var r = arguments[o];
          for (var s in r)
            Object.prototype.hasOwnProperty.call(r, s) && (t[s] = r[s]);
        }
        return t;
      }),
    _extends.apply(this, arguments)
  );
}
function _object_without_properties_loose(n, t) {
  if (n == null) return {};
  var o = {},
    r = Object.keys(n),
    s,
    l;
  for (l = 0; l < r.length; l++)
    (s = r[l]), !(t.indexOf(s) >= 0) && (o[s] = n[s]);
  return o;
}
const LOG_CATEGORY = '[ Federation Runtime ]',
  logger = createLogger(LOG_CATEGORY);
function assert(n, t) {
  n || error(t);
}
function error(n) {
  throw n instanceof Error
    ? ((n.message = `${LOG_CATEGORY}: ${n.message}`), n)
    : new Error(`${LOG_CATEGORY}: ${n}`);
}
function warn(n) {
  n instanceof Error && (n.message = `${LOG_CATEGORY}: ${n.message}`),
    logger.warn(n);
}
function addUniqueItem(n, t) {
  return n.findIndex((o) => o === t) === -1 && n.push(t), n;
}
function getFMId(n) {
  return 'version' in n && n.version
    ? `${n.name}:${n.version}`
    : 'entry' in n && n.entry
      ? `${n.name}:${n.entry}`
      : `${n.name}`;
}
function isRemoteInfoWithEntry(n) {
  return typeof n.entry < 'u';
}
function isPureRemoteEntry(n) {
  return !n.entry.includes('.json') && n.entry.includes('.js');
}
function isObject(n) {
  return n && typeof n == 'object';
}
const objectToString = Object.prototype.toString;
function isPlainObject(n) {
  return objectToString.call(n) === '[object Object]';
}
function arrayOptions(n) {
  return Array.isArray(n) ? n : [n];
}
function getRemoteEntryInfoFromSnapshot(n) {
  const t = {
    url: '',
    type: 'global',
    globalName: '',
  };
  return isBrowserEnv()
    ? 'remoteEntry' in n
      ? {
          url: n.remoteEntry,
          type: n.remoteEntryType,
          globalName: n.globalName,
        }
      : t
    : 'ssrRemoteEntry' in n
      ? {
          url: n.ssrRemoteEntry || t.url,
          type: n.ssrRemoteEntryType || t.type,
          globalName: n.globalName,
        }
      : t;
}
const processModuleAlias = (n, t) => {
    let o;
    return (
      n.endsWith('/') ? (o = n.slice(0, -1)) : (o = n),
      t.startsWith('.') && (t = t.slice(1)),
      (o = o + t),
      o
    );
  },
  CurrentGlobal = typeof globalThis == 'object' ? globalThis : window,
  nativeGlobal = (() => {
    try {
      return document.defaultView;
    } catch {
      return CurrentGlobal;
    }
  })(),
  Global = nativeGlobal;
function definePropertyGlobalVal(n, t, o) {
  Object.defineProperty(n, t, {
    value: o,
    configurable: !1,
    writable: !0,
  });
}
function includeOwnProperty(n, t) {
  return Object.hasOwnProperty.call(n, t);
}
includeOwnProperty(CurrentGlobal, '__GLOBAL_LOADING_REMOTE_ENTRY__') ||
  definePropertyGlobalVal(CurrentGlobal, '__GLOBAL_LOADING_REMOTE_ENTRY__', {});
const globalLoading = CurrentGlobal.__GLOBAL_LOADING_REMOTE_ENTRY__;
function setGlobalDefaultVal(n) {
  var t, o, r, s, l, a;
  includeOwnProperty(n, '__VMOK__') &&
    !includeOwnProperty(n, '__FEDERATION__') &&
    definePropertyGlobalVal(n, '__FEDERATION__', n.__VMOK__),
    includeOwnProperty(n, '__FEDERATION__') ||
      (definePropertyGlobalVal(n, '__FEDERATION__', {
        __GLOBAL_PLUGIN__: [],
        __INSTANCES__: [],
        moduleInfo: {},
        __SHARE__: {},
        __MANIFEST_LOADING__: {},
        __PRELOADED_MAP__: /* @__PURE__ */ new Map(),
      }),
      definePropertyGlobalVal(n, '__VMOK__', n.__FEDERATION__));
  var i;
  (i = (t = n.__FEDERATION__).__GLOBAL_PLUGIN__) != null ||
    (t.__GLOBAL_PLUGIN__ = []);
  var c;
  (c = (o = n.__FEDERATION__).__INSTANCES__) != null || (o.__INSTANCES__ = []);
  var u;
  (u = (r = n.__FEDERATION__).moduleInfo) != null || (r.moduleInfo = {});
  var d;
  (d = (s = n.__FEDERATION__).__SHARE__) != null || (s.__SHARE__ = {});
  var m;
  (m = (l = n.__FEDERATION__).__MANIFEST_LOADING__) != null ||
    (l.__MANIFEST_LOADING__ = {});
  var p;
  (p = (a = n.__FEDERATION__).__PRELOADED_MAP__) != null ||
    (a.__PRELOADED_MAP__ = /* @__PURE__ */ new Map());
}
setGlobalDefaultVal(CurrentGlobal);
setGlobalDefaultVal(nativeGlobal);
function setGlobalFederationConstructor(n, t = isDebugMode()) {
  t &&
    ((CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = n),
    (CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR_VERSION__ = '0.10.0'));
}
function getInfoWithoutType(n, t) {
  if (typeof t == 'string') {
    if (n[t])
      return {
        value: n[t],
        key: t,
      };
    {
      const r = Object.keys(n);
      for (const s of r) {
        const [l, a] = s.split(':'),
          i = `${l}:${t}`,
          c = n[i];
        if (c)
          return {
            value: c,
            key: i,
          };
      }
      return {
        value: void 0,
        key: t,
      };
    }
  } else throw new Error('key must be string');
}
const getGlobalSnapshot = () => nativeGlobal.__FEDERATION__.moduleInfo,
  getTargetSnapshotInfoByModuleInfo = (n, t) => {
    const o = getFMId(n),
      r = getInfoWithoutType(t, o).value;
    if (
      (r &&
        !r.version &&
        'version' in n &&
        n.version &&
        (r.version = n.version),
      r)
    )
      return r;
    if ('version' in n && n.version) {
      const { version: s } = n,
        l = _object_without_properties_loose(n, ['version']),
        a = getFMId(l),
        i = getInfoWithoutType(nativeGlobal.__FEDERATION__.moduleInfo, a).value;
      if ((i == null ? void 0 : i.version) === s) return i;
    }
  },
  getGlobalSnapshotInfoByModuleInfo = (n) =>
    getTargetSnapshotInfoByModuleInfo(
      n,
      nativeGlobal.__FEDERATION__.moduleInfo,
    ),
  setGlobalSnapshotInfoByModuleInfo = (n, t) => {
    const o = getFMId(n);
    return (
      (nativeGlobal.__FEDERATION__.moduleInfo[o] = t),
      nativeGlobal.__FEDERATION__.moduleInfo
    );
  },
  addGlobalSnapshot = (n) => (
    (nativeGlobal.__FEDERATION__.moduleInfo = _extends(
      {},
      nativeGlobal.__FEDERATION__.moduleInfo,
      n,
    )),
    () => {
      const t = Object.keys(n);
      for (const o of t) delete nativeGlobal.__FEDERATION__.moduleInfo[o];
    }
  ),
  getRemoteEntryExports = (n, t) => {
    const o = t || `__FEDERATION_${n}:custom__`,
      r = CurrentGlobal[o];
    return {
      remoteEntryKey: o,
      entryExports: r,
    };
  },
  getGlobalHostPlugins = () => nativeGlobal.__FEDERATION__.__GLOBAL_PLUGIN__,
  getPreloaded = (n) => CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.get(n),
  setPreloaded = (n) =>
    CurrentGlobal.__FEDERATION__.__PRELOADED_MAP__.set(n, !0),
  DEFAULT_SCOPE = 'default',
  DEFAULT_REMOTE_TYPE = 'global',
  buildIdentifier = '[0-9A-Za-z-]+',
  build = `(?:\\+(${buildIdentifier}(?:\\.${buildIdentifier})*))`,
  numericIdentifier = '0|[1-9]\\d*',
  numericIdentifierLoose = '[0-9]+',
  nonNumericIdentifier = '\\d*[a-zA-Z-][a-zA-Z0-9-]*',
  preReleaseIdentifierLoose = `(?:${numericIdentifierLoose}|${nonNumericIdentifier})`,
  preReleaseLoose = `(?:-?(${preReleaseIdentifierLoose}(?:\\.${preReleaseIdentifierLoose})*))`,
  preReleaseIdentifier = `(?:${numericIdentifier}|${nonNumericIdentifier})`,
  preRelease = `(?:-(${preReleaseIdentifier}(?:\\.${preReleaseIdentifier})*))`,
  xRangeIdentifier = `${numericIdentifier}|x|X|\\*`,
  xRangePlain = `[v=\\s]*(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:${preRelease})?${build}?)?)?`,
  hyphenRange = `^\\s*(${xRangePlain})\\s+-\\s+(${xRangePlain})\\s*$`,
  mainVersionLoose = `(${numericIdentifierLoose})\\.(${numericIdentifierLoose})\\.(${numericIdentifierLoose})`,
  loosePlain = `[v=\\s]*${mainVersionLoose}${preReleaseLoose}?${build}?`,
  gtlt = '((?:<|>)?=?)',
  comparatorTrim = `(\\s*)${gtlt}\\s*(${loosePlain}|${xRangePlain})`,
  loneTilde = '(?:~>?)',
  tildeTrim = `(\\s*)${loneTilde}\\s+`,
  loneCaret = '(?:\\^)',
  caretTrim = `(\\s*)${loneCaret}\\s+`,
  star = '(<|>)?=?\\s*\\*',
  caret = `^${loneCaret}${xRangePlain}$`,
  mainVersion = `(${numericIdentifier})\\.(${numericIdentifier})\\.(${numericIdentifier})`,
  fullPlain = `v?${mainVersion}${preRelease}?${build}?`,
  tilde = `^${loneTilde}${xRangePlain}$`,
  xRange = `^${gtlt}\\s*${xRangePlain}$`,
  comparator = `^${gtlt}\\s*(${fullPlain})$|^$`,
  gte0 = '^\\s*>=\\s*0.0.0\\s*$';
function parseRegex(n) {
  return new RegExp(n);
}
function isXVersion(n) {
  return !n || n.toLowerCase() === 'x' || n === '*';
}
function pipe(...n) {
  return (t) => n.reduce((o, r) => r(o), t);
}
function extractComparator(n) {
  return n.match(parseRegex(comparator));
}
function combineVersion(n, t, o, r) {
  const s = `${n}.${t}.${o}`;
  return r ? `${s}-${r}` : s;
}
function parseHyphen(n) {
  return n.replace(
    parseRegex(hyphenRange),
    (t, o, r, s, l, a, i, c, u, d, m, p) => (
      isXVersion(r)
        ? (o = '')
        : isXVersion(s)
          ? (o = `>=${r}.0.0`)
          : isXVersion(l)
            ? (o = `>=${r}.${s}.0`)
            : (o = `>=${o}`),
      isXVersion(u)
        ? (c = '')
        : isXVersion(d)
          ? (c = `<${Number(u) + 1}.0.0-0`)
          : isXVersion(m)
            ? (c = `<${u}.${Number(d) + 1}.0-0`)
            : p
              ? (c = `<=${u}.${d}.${m}-${p}`)
              : (c = `<=${c}`),
      `${o} ${c}`.trim()
    ),
  );
}
function parseComparatorTrim(n) {
  return n.replace(parseRegex(comparatorTrim), '$1$2$3');
}
function parseTildeTrim(n) {
  return n.replace(parseRegex(tildeTrim), '$1~');
}
function parseCaretTrim(n) {
  return n.replace(parseRegex(caretTrim), '$1^');
}
function parseCarets(n) {
  return n
    .trim()
    .split(/\s+/)
    .map((t) =>
      t.replace(parseRegex(caret), (o, r, s, l, a) =>
        isXVersion(r)
          ? ''
          : isXVersion(s)
            ? `>=${r}.0.0 <${Number(r) + 1}.0.0-0`
            : isXVersion(l)
              ? r === '0'
                ? `>=${r}.${s}.0 <${r}.${Number(s) + 1}.0-0`
                : `>=${r}.${s}.0 <${Number(r) + 1}.0.0-0`
              : a
                ? r === '0'
                  ? s === '0'
                    ? `>=${r}.${s}.${l}-${a} <${r}.${s}.${Number(l) + 1}-0`
                    : `>=${r}.${s}.${l}-${a} <${r}.${Number(s) + 1}.0-0`
                  : `>=${r}.${s}.${l}-${a} <${Number(r) + 1}.0.0-0`
                : r === '0'
                  ? s === '0'
                    ? `>=${r}.${s}.${l} <${r}.${s}.${Number(l) + 1}-0`
                    : `>=${r}.${s}.${l} <${r}.${Number(s) + 1}.0-0`
                  : `>=${r}.${s}.${l} <${Number(r) + 1}.0.0-0`,
      ),
    )
    .join(' ');
}
function parseTildes(n) {
  return n
    .trim()
    .split(/\s+/)
    .map((t) =>
      t.replace(parseRegex(tilde), (o, r, s, l, a) =>
        isXVersion(r)
          ? ''
          : isXVersion(s)
            ? `>=${r}.0.0 <${Number(r) + 1}.0.0-0`
            : isXVersion(l)
              ? `>=${r}.${s}.0 <${r}.${Number(s) + 1}.0-0`
              : a
                ? `>=${r}.${s}.${l}-${a} <${r}.${Number(s) + 1}.0-0`
                : `>=${r}.${s}.${l} <${r}.${Number(s) + 1}.0-0`,
      ),
    )
    .join(' ');
}
function parseXRanges(n) {
  return n
    .split(/\s+/)
    .map((t) =>
      t.trim().replace(parseRegex(xRange), (o, r, s, l, a, i) => {
        const c = isXVersion(s),
          u = c || isXVersion(l),
          d = u || isXVersion(a);
        return (
          r === '=' && d && (r = ''),
          (i = ''),
          c
            ? r === '>' || r === '<'
              ? '<0.0.0-0'
              : '*'
            : r && d
              ? (u && (l = 0),
                (a = 0),
                r === '>'
                  ? ((r = '>='),
                    u
                      ? ((s = Number(s) + 1), (l = 0), (a = 0))
                      : ((l = Number(l) + 1), (a = 0)))
                  : r === '<=' &&
                    ((r = '<'), u ? (s = Number(s) + 1) : (l = Number(l) + 1)),
                r === '<' && (i = '-0'),
                `${r + s}.${l}.${a}${i}`)
              : u
                ? `>=${s}.0.0${i} <${Number(s) + 1}.0.0-0`
                : d
                  ? `>=${s}.${l}.0${i} <${s}.${Number(l) + 1}.0-0`
                  : o
        );
      }),
    )
    .join(' ');
}
function parseStar(n) {
  return n.trim().replace(parseRegex(star), '');
}
function parseGTE0(n) {
  return n.trim().replace(parseRegex(gte0), '');
}
function compareAtom(n, t) {
  return (
    (n = Number(n) || n), (t = Number(t) || t), n > t ? 1 : n === t ? 0 : -1
  );
}
function comparePreRelease(n, t) {
  const { preRelease: o } = n,
    { preRelease: r } = t;
  if (o === void 0 && r) return 1;
  if (o && r === void 0) return -1;
  if (o === void 0 && r === void 0) return 0;
  for (let s = 0, l = o.length; s <= l; s++) {
    const a = o[s],
      i = r[s];
    if (a !== i)
      return a === void 0 && i === void 0
        ? 0
        : a
          ? i
            ? compareAtom(a, i)
            : -1
          : 1;
  }
  return 0;
}
function compareVersion(n, t) {
  return (
    compareAtom(n.major, t.major) ||
    compareAtom(n.minor, t.minor) ||
    compareAtom(n.patch, t.patch) ||
    comparePreRelease(n, t)
  );
}
function eq(n, t) {
  return n.version === t.version;
}
function compare(n, t) {
  switch (n.operator) {
    case '':
    case '=':
      return eq(n, t);
    case '>':
      return compareVersion(n, t) < 0;
    case '>=':
      return eq(n, t) || compareVersion(n, t) < 0;
    case '<':
      return compareVersion(n, t) > 0;
    case '<=':
      return eq(n, t) || compareVersion(n, t) > 0;
    case void 0:
      return !0;
    default:
      return !1;
  }
}
function parseComparatorString(n) {
  return pipe(
    // handle caret
    // ^ --> * (any, kinda silly)
    // ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
    // ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
    // ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
    // ^1.2.3 --> >=1.2.3 <2.0.0-0
    // ^1.2.0 --> >=1.2.0 <2.0.0-0
    parseCarets,
    // handle tilde
    // ~, ~> --> * (any, kinda silly)
    // ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
    // ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
    // ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
    // ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
    // ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
    parseTildes,
    parseXRanges,
    parseStar,
  )(n);
}
function parseRange(n) {
  return pipe(
    // handle hyphenRange
    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
    parseHyphen,
    // handle trim comparator
    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
    parseComparatorTrim,
    // handle trim tilde
    // `~ 1.2.3` => `~1.2.3`
    parseTildeTrim,
    // handle trim caret
    // `^ 1.2.3` => `^1.2.3`
    parseCaretTrim,
  )(n.trim())
    .split(/\s+/)
    .join(' ');
}
function satisfy(n, t) {
  if (!n) return !1;
  const s = parseRange(t)
      .split(' ')
      .map((p) => parseComparatorString(p))
      .join(' ')
      .split(/\s+/)
      .map((p) => parseGTE0(p)),
    l = extractComparator(n);
  if (!l) return !1;
  const [, a, , i, c, u, d] = l,
    m = {
      version: combineVersion(i, c, u, d),
      major: i,
      minor: c,
      patch: u,
      preRelease: d == null ? void 0 : d.split('.'),
    };
  for (const p of s) {
    const y = extractComparator(p);
    if (!y) return !1;
    const [, g, , E, _, R, v] = y,
      I = {
        operator: g,
        version: combineVersion(E, _, R, v),
        major: E,
        minor: _,
        patch: R,
        preRelease: v == null ? void 0 : v.split('.'),
      };
    if (!compare(I, m)) return !1;
  }
  return !0;
}
function formatShare(n, t, o, r) {
  let s;
  'get' in n
    ? (s = n.get)
    : 'lib' in n
      ? (s = () => Promise.resolve(n.lib))
      : (s = () =>
          Promise.resolve(() => {
            throw new Error(`Can not get shared '${o}'!`);
          })),
    n.strategy &&
      warn(
        '"shared.strategy is deprecated, please set in initOptions.shareStrategy instead!"',
      );
  var l, a, i;
  return _extends(
    {
      deps: [],
      useIn: [],
      from: t,
      loading: null,
    },
    n,
    {
      shareConfig: _extends(
        {
          requiredVersion: `^${n.version}`,
          singleton: !1,
          eager: !1,
          strictVersion: !1,
        },
        n.shareConfig,
      ),
      get: s,
      loaded: (n != null && n.loaded) || 'lib' in n ? !0 : void 0,
      version: (l = n.version) != null ? l : '0',
      scope: Array.isArray(n.scope)
        ? n.scope
        : [(a = n.scope) != null ? a : 'default'],
      strategy: ((i = n.strategy) != null ? i : r) || 'version-first',
    },
  );
}
function formatShareConfigs(n, t) {
  const o = t.shared || {},
    r = t.name,
    s = Object.keys(o).reduce((a, i) => {
      const c = arrayOptions(o[i]);
      return (
        (a[i] = a[i] || []),
        c.forEach((u) => {
          a[i].push(formatShare(u, r, i, t.shareStrategy));
        }),
        a
      );
    }, {}),
    l = _extends({}, n.shared);
  return (
    Object.keys(s).forEach((a) => {
      l[a]
        ? s[a].forEach((i) => {
            l[a].find((u) => u.version === i.version) || l[a].push(i);
          })
        : (l[a] = s[a]);
    }),
    {
      shared: l,
      shareInfos: s,
    }
  );
}
function versionLt(n, t) {
  const o = (r) => {
    if (!Number.isNaN(Number(r))) {
      const l = r.split('.');
      let a = r;
      for (let i = 0; i < 3 - l.length; i++) a += '.0';
      return a;
    }
    return r;
  };
  return !!satisfy(o(n), `<=${o(t)}`);
}
const findVersion = (n, t) => {
    const o =
      t ||
      function (r, s) {
        return versionLt(r, s);
      };
    return Object.keys(n).reduce(
      (r, s) => (!r || o(r, s) || r === '0' ? s : r),
      0,
    );
  },
  isLoaded = (n) => !!n.loaded || typeof n.lib == 'function',
  isLoading = (n) => !!n.loading;
function findSingletonVersionOrderByVersion(n, t, o) {
  const r = n[t][o],
    s = function (l, a) {
      return !isLoaded(r[l]) && versionLt(l, a);
    };
  return findVersion(n[t][o], s);
}
function findSingletonVersionOrderByLoaded(n, t, o) {
  const r = n[t][o],
    s = function (l, a) {
      const i = (c) => isLoaded(c) || isLoading(c);
      return i(r[a])
        ? i(r[l])
          ? !!versionLt(l, a)
          : !0
        : i(r[l])
          ? !1
          : versionLt(l, a);
    };
  return findVersion(n[t][o], s);
}
function getFindShareFunction(n) {
  return n === 'loaded-first'
    ? findSingletonVersionOrderByLoaded
    : findSingletonVersionOrderByVersion;
}
function getRegisteredShare(n, t, o, r) {
  if (!n) return;
  const { shareConfig: s, scope: l = DEFAULT_SCOPE, strategy: a } = o,
    i = Array.isArray(l) ? l : [l];
  for (const c of i)
    if (s && n[c] && n[c][t]) {
      const { requiredVersion: u } = s,
        m = getFindShareFunction(a)(n, c, t),
        p = () => {
          if (s.singleton) {
            if (typeof u == 'string' && !satisfy(m, u)) {
              const E = `Version ${m} from ${m && n[c][t][m].from} of shared singleton module ${t} does not satisfy the requirement of ${o.from} which needs ${u})`;
              s.strictVersion ? error(E) : warn(E);
            }
            return n[c][t][m];
          } else {
            if (u === !1 || u === '*' || satisfy(m, u)) return n[c][t][m];
            for (const [E, _] of Object.entries(n[c][t]))
              if (satisfy(E, u)) return _;
          }
        },
        y = {
          shareScopeMap: n,
          scope: c,
          pkgName: t,
          version: m,
          GlobalFederation: Global.__FEDERATION__,
          resolver: p,
        };
      return (r.emit(y) || y).resolver();
    }
}
function getGlobalShareScope() {
  return Global.__FEDERATION__.__SHARE__;
}
function getTargetSharedOptions(n) {
  const { pkgName: t, extraOptions: o, shareInfos: r } = n,
    s = (i) => {
      if (!i) return;
      const c = {};
      i.forEach((m) => {
        c[m.version] = m;
      });
      const d = findVersion(c, function (m, p) {
        return !isLoaded(c[m]) && versionLt(m, p);
      });
      return c[d];
    };
  var l;
  const a = (l = o == null ? void 0 : o.resolver) != null ? l : s;
  return Object.assign({}, a(r[t]), o == null ? void 0 : o.customShareInfo);
}
function getBuilderId() {
  return typeof FEDERATION_BUILD_IDENTIFIER < 'u'
    ? FEDERATION_BUILD_IDENTIFIER
    : '';
}
function matchRemoteWithNameAndExpose(n, t) {
  for (const o of n) {
    const r = t.startsWith(o.name);
    let s = t.replace(o.name, '');
    if (r) {
      if (s.startsWith('/')) {
        const i = o.name;
        return (
          (s = `.${s}`),
          {
            pkgNameOrAlias: i,
            expose: s,
            remote: o,
          }
        );
      } else if (s === '')
        return {
          pkgNameOrAlias: o.name,
          expose: '.',
          remote: o,
        };
    }
    const l = o.alias && t.startsWith(o.alias);
    let a = o.alias && t.replace(o.alias, '');
    if (o.alias && l) {
      if (a && a.startsWith('/')) {
        const i = o.alias;
        return (
          (a = `.${a}`),
          {
            pkgNameOrAlias: i,
            expose: a,
            remote: o,
          }
        );
      } else if (a === '')
        return {
          pkgNameOrAlias: o.alias,
          expose: '.',
          remote: o,
        };
    }
  }
}
function matchRemote(n, t) {
  for (const o of n) if (t === o.name || (o.alias && t === o.alias)) return o;
}
function registerPlugins(n, t) {
  const o = getGlobalHostPlugins();
  return (
    o.length > 0 &&
      o.forEach((r) => {
        n != null && n.find((s) => s.name !== r.name) && n.push(r);
      }),
    n &&
      n.length > 0 &&
      n.forEach((r) => {
        t.forEach((s) => {
          s.applyPlugin(r);
        });
      }),
    n
  );
}
async function loadEsmEntry({ entry: n, remoteEntryExports: t }) {
  return new Promise((o, r) => {
    try {
      t
        ? o(t)
        : typeof FEDERATION_ALLOW_NEW_FUNCTION < 'u'
          ? new Function(
              'callbacks',
              `import("${n}").then(callbacks[0]).catch(callbacks[1])`,
            )([o, r])
          : import(
              /* webpackIgnore: true */
              /* @vite-ignore */
              n
            )
              .then(o)
              .catch(r);
    } catch (s) {
      r(s);
    }
  });
}
async function loadSystemJsEntry({ entry: n, remoteEntryExports: t }) {
  return new Promise((o, r) => {
    try {
      t
        ? o(t)
        : typeof __system_context__ > 'u'
          ? System.import(n).then(o).catch(r)
          : new Function(
              'callbacks',
              `System.import("${n}").then(callbacks[0]).catch(callbacks[1])`,
            )([o, r]);
    } catch (s) {
      r(s);
    }
  });
}
async function loadEntryScript({
  name: n,
  globalName: t,
  entry: o,
  loaderHook: r,
}) {
  const { entryExports: s } = getRemoteEntryExports(n, t);
  return (
    s ||
    loadScript(o, {
      attrs: {},
      createScriptHook: (l, a) => {
        const i = r.lifecycle.createScript.emit({
          url: l,
          attrs: a,
        });
        if (
          i &&
          (i instanceof HTMLScriptElement || 'script' in i || 'timeout' in i)
        )
          return i;
      },
    })
      .then(() => {
        const { remoteEntryKey: l, entryExports: a } = getRemoteEntryExports(
          n,
          t,
        );
        return (
          assert(
            a,
            getShortErrorMsg(RUNTIME_001, runtimeDescMap, {
              remoteName: n,
              remoteEntryUrl: o,
              remoteEntryKey: l,
            }),
          ),
          a
        );
      })
      .catch((l) => {
        throw (
          (assert(
            void 0,
            getShortErrorMsg(RUNTIME_008, runtimeDescMap, {
              remoteName: n,
              resourceUrl: o,
            }),
          ),
          l)
        );
      })
  );
}
async function loadEntryDom({
  remoteInfo: n,
  remoteEntryExports: t,
  loaderHook: o,
}) {
  const { entry: r, entryGlobalName: s, name: l, type: a } = n;
  switch (a) {
    case 'esm':
    case 'module':
      return loadEsmEntry({
        entry: r,
        remoteEntryExports: t,
      });
    case 'system':
      return loadSystemJsEntry({
        entry: r,
        remoteEntryExports: t,
      });
    default:
      return loadEntryScript({
        entry: r,
        globalName: s,
        name: l,
        loaderHook: o,
      });
  }
}
async function loadEntryNode({ remoteInfo: n, loaderHook: t }) {
  const { entry: o, entryGlobalName: r, name: s, type: l } = n,
    { entryExports: a } = getRemoteEntryExports(s, r);
  return (
    a ||
    loadScriptNode(o, {
      attrs: {
        name: s,
        globalName: r,
        type: l,
      },
      loaderHook: {
        createScriptHook: (i, c = {}) => {
          const u = t.lifecycle.createScript.emit({
            url: i,
            attrs: c,
          });
          if (u && 'url' in u) return u;
        },
      },
    })
      .then(() => {
        const { remoteEntryKey: i, entryExports: c } = getRemoteEntryExports(
          s,
          r,
        );
        return (
          assert(
            c,
            getShortErrorMsg(RUNTIME_001, runtimeDescMap, {
              remoteName: s,
              remoteEntryUrl: o,
              remoteEntryKey: i,
            }),
          ),
          c
        );
      })
      .catch((i) => {
        throw i;
      })
  );
}
function getRemoteEntryUniqueKey(n) {
  const { entry: t, name: o } = n;
  return composeKeyWithSeparator(o, t);
}
async function getRemoteEntry({
  origin: n,
  remoteEntryExports: t,
  remoteInfo: o,
}) {
  const r = getRemoteEntryUniqueKey(o);
  if (t) return t;
  if (!globalLoading[r]) {
    const s = n.remoteHandler.hooks.lifecycle.loadEntry,
      l = n.loaderHook;
    globalLoading[r] = s
      .emit({
        loaderHook: l,
        remoteInfo: o,
        remoteEntryExports: t,
      })
      .then(
        (a) =>
          a ||
          (isBrowserEnv()
            ? loadEntryDom({
                remoteInfo: o,
                remoteEntryExports: t,
                loaderHook: l,
              })
            : loadEntryNode({
                remoteInfo: o,
                loaderHook: l,
              })),
      );
  }
  return globalLoading[r];
}
function getRemoteInfo(n) {
  return _extends({}, n, {
    entry: 'entry' in n ? n.entry : '',
    type: n.type || DEFAULT_REMOTE_TYPE,
    entryGlobalName: n.entryGlobalName || n.name,
    shareScope: n.shareScope || DEFAULT_SCOPE,
  });
}
let Module = class {
  async getEntry() {
    if (this.remoteEntryExports) return this.remoteEntryExports;
    let t;
    try {
      t = await getRemoteEntry({
        origin: this.host,
        remoteInfo: this.remoteInfo,
        remoteEntryExports: this.remoteEntryExports,
      });
    } catch {
      const r = getRemoteEntryUniqueKey(this.remoteInfo);
      t = await this.host.loaderHook.lifecycle.loadEntryError.emit({
        getRemoteEntry,
        origin: this.host,
        remoteInfo: this.remoteInfo,
        remoteEntryExports: this.remoteEntryExports,
        globalLoading,
        uniqueKey: r,
      });
    }
    return (
      assert(
        t,
        `remoteEntryExports is undefined 
 ${safeToString(this.remoteInfo)}`,
      ),
      (this.remoteEntryExports = t),
      this.remoteEntryExports
    );
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async get(t, o, r, s) {
    const { loadFactory: l = !0 } = r || {
        loadFactory: !0,
      },
      a = await this.getEntry();
    if (!this.inited) {
      const m = this.host.shareScopeMap,
        p = this.remoteInfo.shareScope || 'default';
      m[p] || (m[p] = {});
      const y = m[p],
        g = [],
        E = {
          version: this.remoteInfo.version || '',
        };
      Object.defineProperty(E, 'shareScopeMap', {
        value: m,
        // remoteEntryInitOptions will be traversed and assigned during container init, ,so this attribute is not allowed to be traversed
        enumerable: !1,
      });
      const _ = await this.host.hooks.lifecycle.beforeInitContainer.emit({
        shareScope: y,
        // @ts-ignore shareScopeMap will be set by Object.defineProperty
        remoteEntryInitOptions: E,
        initScope: g,
        remoteInfo: this.remoteInfo,
        origin: this.host,
      });
      typeof (a == null ? void 0 : a.init) > 'u' &&
        error(
          getShortErrorMsg(RUNTIME_002, runtimeDescMap, {
            remoteName: name,
            remoteEntryUrl: this.remoteInfo.entry,
            remoteEntryKey: this.remoteInfo.entryGlobalName,
          }),
        ),
        await a.init(_.shareScope, _.initScope, _.remoteEntryInitOptions),
        await this.host.hooks.lifecycle.initContainer.emit(
          _extends({}, _, {
            id: t,
            remoteSnapshot: s,
            remoteEntryExports: a,
          }),
        );
    }
    (this.lib = a), (this.inited = !0);
    let i;
    (i = await this.host.loaderHook.lifecycle.getModuleFactory.emit({
      remoteEntryExports: a,
      expose: o,
      moduleInfo: this.remoteInfo,
    })),
      i || (i = await a.get(o)),
      assert(i, `${getFMId(this.remoteInfo)} remote don't export ${o}.`);
    const c = processModuleAlias(this.remoteInfo.name, o),
      u = this.wraperFactory(i, c);
    return l ? await u() : u;
  }
  wraperFactory(t, o) {
    function r(s, l) {
      s &&
        typeof s == 'object' &&
        Object.isExtensible(s) &&
        !Object.getOwnPropertyDescriptor(s, Symbol.for('mf_module_id')) &&
        Object.defineProperty(s, Symbol.for('mf_module_id'), {
          value: l,
          enumerable: !1,
        });
    }
    return t instanceof Promise
      ? async () => {
          const s = await t();
          return r(s, o), s;
        }
      : () => {
          const s = t();
          return r(s, o), s;
        };
  }
  constructor({ remoteInfo: t, host: o }) {
    (this.inited = !1),
      (this.lib = void 0),
      (this.remoteInfo = t),
      (this.host = o);
  }
};
class SyncHook {
  on(t) {
    typeof t == 'function' && this.listeners.add(t);
  }
  once(t) {
    const o = this;
    this.on(function r(...s) {
      return o.remove(r), t.apply(null, s);
    });
  }
  emit(...t) {
    let o;
    return (
      this.listeners.size > 0 &&
        this.listeners.forEach((r) => {
          o = r(...t);
        }),
      o
    );
  }
  remove(t) {
    this.listeners.delete(t);
  }
  removeAll() {
    this.listeners.clear();
  }
  constructor(t) {
    (this.type = ''),
      (this.listeners = /* @__PURE__ */ new Set()),
      t && (this.type = t);
  }
}
class AsyncHook extends SyncHook {
  emit(...t) {
    let o;
    const r = Array.from(this.listeners);
    if (r.length > 0) {
      let s = 0;
      const l = (a) =>
        a === !1
          ? !1
          : s < r.length
            ? Promise.resolve(r[s++].apply(null, t)).then(l)
            : a;
      o = l();
    }
    return Promise.resolve(o);
  }
}
function checkReturnData(n, t) {
  if (!isObject(t)) return !1;
  if (n !== t) {
    for (const o in n) if (!(o in t)) return !1;
  }
  return !0;
}
class SyncWaterfallHook extends SyncHook {
  emit(t) {
    isObject(t) ||
      error(`The data for the "${this.type}" hook should be an object.`);
    for (const o of this.listeners)
      try {
        const r = o(t);
        if (checkReturnData(t, r)) t = r;
        else {
          this.onerror(
            `A plugin returned an unacceptable value for the "${this.type}" type.`,
          );
          break;
        }
      } catch (r) {
        warn(r), this.onerror(r);
      }
    return t;
  }
  constructor(t) {
    super(), (this.onerror = error), (this.type = t);
  }
}
class AsyncWaterfallHook extends SyncHook {
  emit(t) {
    isObject(t) ||
      error(`The response data for the "${this.type}" hook must be an object.`);
    const o = Array.from(this.listeners);
    if (o.length > 0) {
      let r = 0;
      const s = (a) => (warn(a), this.onerror(a), t),
        l = (a) => {
          if (checkReturnData(t, a)) {
            if (((t = a), r < o.length))
              try {
                return Promise.resolve(o[r++](t)).then(l, s);
              } catch (i) {
                return s(i);
              }
          } else
            this.onerror(
              `A plugin returned an incorrect value for the "${this.type}" type.`,
            );
          return t;
        };
      return Promise.resolve(l(t));
    }
    return Promise.resolve(t);
  }
  constructor(t) {
    super(), (this.onerror = error), (this.type = t);
  }
}
class PluginSystem {
  applyPlugin(t) {
    assert(isPlainObject(t), 'Plugin configuration is invalid.');
    const o = t.name;
    assert(o, 'A name must be provided by the plugin.'),
      this.registerPlugins[o] ||
        ((this.registerPlugins[o] = t),
        Object.keys(this.lifecycle).forEach((r) => {
          const s = t[r];
          s && this.lifecycle[r].on(s);
        }));
  }
  removePlugin(t) {
    assert(t, 'A name is required.');
    const o = this.registerPlugins[t];
    assert(o, `The plugin "${t}" is not registered.`),
      Object.keys(o).forEach((r) => {
        r !== 'name' && this.lifecycle[r].remove(o[r]);
      });
  }
  // eslint-disable-next-line @typescript-eslint/no-shadow
  inherit({ lifecycle: t, registerPlugins: o }) {
    Object.keys(t).forEach((r) => {
      assert(
        !this.lifecycle[r],
        `The hook "${r}" has a conflict and cannot be inherited.`,
      ),
        (this.lifecycle[r] = t[r]);
    }),
      Object.keys(o).forEach((r) => {
        assert(
          !this.registerPlugins[r],
          `The plugin "${r}" has a conflict and cannot be inherited.`,
        ),
          this.applyPlugin(o[r]);
      });
  }
  constructor(t) {
    (this.registerPlugins = {}),
      (this.lifecycle = t),
      (this.lifecycleKeys = Object.keys(t));
  }
}
function defaultPreloadArgs(n) {
  return _extends(
    {
      resourceCategory: 'sync',
      share: !0,
      depsRemote: !0,
      prefetchInterface: !1,
    },
    n,
  );
}
function formatPreloadArgs(n, t) {
  return t.map((o) => {
    const r = matchRemote(n, o.nameOrAlias);
    return (
      assert(
        r,
        `Unable to preload ${o.nameOrAlias} as it is not included in ${
          !r &&
          safeToString({
            remoteInfo: r,
            remotes: n,
          })
        }`,
      ),
      {
        remote: r,
        preloadConfig: defaultPreloadArgs(o),
      }
    );
  });
}
function normalizePreloadExposes(n) {
  return n
    ? n.map((t) =>
        t === '.' ? t : t.startsWith('./') ? t.replace('./', '') : t,
      )
    : [];
}
function preloadAssets(n, t, o, r = !0) {
  const { cssAssets: s, jsAssetsWithoutEntry: l, entryAssets: a } = o;
  if (t.options.inBrowser) {
    if (
      (a.forEach((i) => {
        const { moduleInfo: c } = i,
          u = t.moduleCache.get(n.name);
        getRemoteEntry(
          u
            ? {
                origin: t,
                remoteInfo: c,
                remoteEntryExports: u.remoteEntryExports,
              }
            : {
                origin: t,
                remoteInfo: c,
                remoteEntryExports: void 0,
              },
        );
      }),
      r)
    ) {
      const i = {
        rel: 'preload',
        as: 'style',
      };
      s.forEach((c) => {
        const { link: u, needAttach: d } = createLink({
          url: c,
          cb: () => {},
          attrs: i,
          createLinkHook: (m, p) => {
            const y = t.loaderHook.lifecycle.createLink.emit({
              url: m,
              attrs: p,
            });
            if (y instanceof HTMLLinkElement) return y;
          },
        });
        d && document.head.appendChild(u);
      });
    } else {
      const i = {
        rel: 'stylesheet',
        type: 'text/css',
      };
      s.forEach((c) => {
        const { link: u, needAttach: d } = createLink({
          url: c,
          cb: () => {},
          attrs: i,
          createLinkHook: (m, p) => {
            const y = t.loaderHook.lifecycle.createLink.emit({
              url: m,
              attrs: p,
            });
            if (y instanceof HTMLLinkElement) return y;
          },
          needDeleteLink: !1,
        });
        d && document.head.appendChild(u);
      });
    }
    if (r) {
      const i = {
        rel: 'preload',
        as: 'script',
      };
      l.forEach((c) => {
        const { link: u, needAttach: d } = createLink({
          url: c,
          cb: () => {},
          attrs: i,
          createLinkHook: (m, p) => {
            const y = t.loaderHook.lifecycle.createLink.emit({
              url: m,
              attrs: p,
            });
            if (y instanceof HTMLLinkElement) return y;
          },
        });
        d && document.head.appendChild(u);
      });
    } else {
      const i = {
        fetchpriority: 'high',
        type:
          (n == null ? void 0 : n.type) === 'module'
            ? 'module'
            : 'text/javascript',
      };
      l.forEach((c) => {
        const { script: u, needAttach: d } = createScript({
          url: c,
          cb: () => {},
          attrs: i,
          createScriptHook: (m, p) => {
            const y = t.loaderHook.lifecycle.createScript.emit({
              url: m,
              attrs: p,
            });
            if (y instanceof HTMLScriptElement) return y;
          },
          needDeleteScript: !0,
        });
        d && document.head.appendChild(u);
      });
    }
  }
}
function assignRemoteInfo(n, t) {
  const o = getRemoteEntryInfoFromSnapshot(t);
  o.url ||
    error(`The attribute remoteEntry of ${n.name} must not be undefined.`);
  let r = getResourceUrl(t, o.url);
  !isBrowserEnv() && !r.startsWith('http') && (r = `https:${r}`),
    (n.type = o.type),
    (n.entryGlobalName = o.globalName),
    (n.entry = r),
    (n.version = t.version),
    (n.buildVersion = t.buildVersion);
}
function snapshotPlugin() {
  return {
    name: 'snapshot-plugin',
    async afterResolve(n) {
      const {
        remote: t,
        pkgNameOrAlias: o,
        expose: r,
        origin: s,
        remoteInfo: l,
      } = n;
      if (!isRemoteInfoWithEntry(t) || !isPureRemoteEntry(t)) {
        const { remoteSnapshot: a, globalSnapshot: i } =
          await s.snapshotHandler.loadRemoteSnapshotInfo(t);
        assignRemoteInfo(l, a);
        const c = {
            remote: t,
            preloadConfig: {
              nameOrAlias: o,
              exposes: [r],
              resourceCategory: 'sync',
              share: !1,
              depsRemote: !1,
            },
          },
          u = await s.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit({
            origin: s,
            preloadOptions: c,
            remoteInfo: l,
            remote: t,
            remoteSnapshot: a,
            globalSnapshot: i,
          });
        return (
          u && preloadAssets(l, s, u, !1),
          _extends({}, n, {
            remoteSnapshot: a,
          })
        );
      }
      return n;
    },
  };
}
function splitId(n) {
  const t = n.split(':');
  return t.length === 1
    ? {
        name: t[0],
        version: void 0,
      }
    : t.length === 2
      ? {
          name: t[0],
          version: t[1],
        }
      : {
          name: t[1],
          version: t[2],
        };
}
function traverseModuleInfo(n, t, o, r, s = {}, l) {
  const a = getFMId(t),
    { value: i } = getInfoWithoutType(n, a),
    c = l || i;
  if (c && !isManifestProvider(c) && (o(c, t, r), c.remotesInfo)) {
    const u = Object.keys(c.remotesInfo);
    for (const d of u) {
      if (s[d]) continue;
      s[d] = !0;
      const m = splitId(d),
        p = c.remotesInfo[d];
      traverseModuleInfo(
        n,
        {
          name: m.name,
          version: p.matchedVersion,
        },
        o,
        !1,
        s,
        void 0,
      );
    }
  }
}
function generatePreloadAssets(n, t, o, r, s) {
  const l = [],
    a = [],
    i = [],
    c = /* @__PURE__ */ new Set(),
    u = /* @__PURE__ */ new Set(),
    { options: d } = n,
    { preloadConfig: m } = t,
    { depsRemote: p } = m;
  if (
    (traverseModuleInfo(
      r,
      o,
      (_, R, v) => {
        let I;
        if (v) I = m;
        else if (Array.isArray(p)) {
          const w = p.find(
            (O) => O.nameOrAlias === R.name || O.nameOrAlias === R.alias,
          );
          if (!w) return;
          I = defaultPreloadArgs(w);
        } else if (p === !0) I = m;
        else return;
        const S = getResourceUrl(_, getRemoteEntryInfoFromSnapshot(_).url);
        S &&
          i.push({
            name: R.name,
            moduleInfo: {
              name: R.name,
              entry: S,
              type: 'remoteEntryType' in _ ? _.remoteEntryType : 'global',
              entryGlobalName: 'globalName' in _ ? _.globalName : R.name,
              shareScope: '',
              version: 'version' in _ ? _.version : void 0,
            },
            url: S,
          });
        let b = 'modules' in _ ? _.modules : [];
        const A = normalizePreloadExposes(I.exposes);
        if (A.length && 'modules' in _) {
          var T;
          b =
            _ == null || (T = _.modules) == null
              ? void 0
              : T.reduce(
                  (w, O) => (
                    (A == null ? void 0 : A.indexOf(O.moduleName)) !== -1 &&
                      w.push(O),
                    w
                  ),
                  [],
                );
        }
        function $(w) {
          const O = w.map((M) => getResourceUrl(_, M));
          return I.filter ? O.filter(I.filter) : O;
        }
        if (b) {
          const w = b.length;
          for (let O = 0; O < w; O++) {
            const M = b[O],
              N = `${R.name}/${M.moduleName}`;
            n.remoteHandler.hooks.lifecycle.handlePreloadModule.emit({
              id: M.moduleName === '.' ? R.name : N,
              name: R.name,
              remoteSnapshot: _,
              preloadConfig: I,
              remote: R,
              origin: n,
            }),
              !getPreloaded(N) &&
                (I.resourceCategory === 'all'
                  ? (l.push(...$(M.assets.css.async)),
                    l.push(...$(M.assets.css.sync)),
                    a.push(...$(M.assets.js.async)),
                    a.push(...$(M.assets.js.sync)))
                  : (I.resourceCategory = 'sync') &&
                    (l.push(...$(M.assets.css.sync)),
                    a.push(...$(M.assets.js.sync))),
                setPreloaded(N));
          }
        }
      },
      !0,
      {},
      s,
    ),
    s.shared)
  ) {
    const _ = (R, v) => {
      const I = getRegisteredShare(
        n.shareScopeMap,
        v.sharedName,
        R,
        n.sharedHandler.hooks.lifecycle.resolveShare,
      );
      I &&
        typeof I.lib == 'function' &&
        (v.assets.js.sync.forEach((S) => {
          c.add(S);
        }),
        v.assets.css.sync.forEach((S) => {
          u.add(S);
        }));
    };
    s.shared.forEach((R) => {
      var v;
      const I = (v = d.shared) == null ? void 0 : v[R.sharedName];
      if (!I) return;
      const S = R.version ? I.find((A) => A.version === R.version) : I;
      if (!S) return;
      arrayOptions(S).forEach((A) => {
        _(A, R);
      });
    });
  }
  const g = a.filter((_) => !c.has(_));
  return {
    cssAssets: l.filter((_) => !u.has(_)),
    jsAssetsWithoutEntry: g,
    entryAssets: i,
  };
}
const generatePreloadAssetsPlugin = function () {
  return {
    name: 'generate-preload-assets-plugin',
    async generatePreloadAssets(n) {
      const {
        origin: t,
        preloadOptions: o,
        remoteInfo: r,
        remote: s,
        globalSnapshot: l,
        remoteSnapshot: a,
      } = n;
      return isRemoteInfoWithEntry(s) && isPureRemoteEntry(s)
        ? {
            cssAssets: [],
            jsAssetsWithoutEntry: [],
            entryAssets: [
              {
                name: s.name,
                url: s.entry,
                moduleInfo: {
                  name: r.name,
                  entry: s.entry,
                  type: r.type || 'global',
                  entryGlobalName: '',
                  shareScope: '',
                },
              },
            ],
          }
        : (assignRemoteInfo(r, a), generatePreloadAssets(t, o, r, l, a));
    },
  };
};
function getGlobalRemoteInfo(n, t) {
  const o = getGlobalSnapshotInfoByModuleInfo({
      name: t.options.name,
      version: t.options.version,
    }),
    r =
      o &&
      'remotesInfo' in o &&
      o.remotesInfo &&
      getInfoWithoutType(o.remotesInfo, n.name).value;
  return r && r.matchedVersion
    ? {
        hostGlobalSnapshot: o,
        globalSnapshot: getGlobalSnapshot(),
        remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
          name: n.name,
          version: r.matchedVersion,
        }),
      }
    : {
        hostGlobalSnapshot: void 0,
        globalSnapshot: getGlobalSnapshot(),
        remoteSnapshot: getGlobalSnapshotInfoByModuleInfo({
          name: n.name,
          version: 'version' in n ? n.version : void 0,
        }),
      };
}
class SnapshotHandler {
  async loadSnapshot(t) {
    const { options: o } = this.HostInstance,
      {
        hostGlobalSnapshot: r,
        remoteSnapshot: s,
        globalSnapshot: l,
      } = this.getGlobalRemoteInfo(t),
      { remoteSnapshot: a, globalSnapshot: i } =
        await this.hooks.lifecycle.loadSnapshot.emit({
          options: o,
          moduleInfo: t,
          hostGlobalSnapshot: r,
          remoteSnapshot: s,
          globalSnapshot: l,
        });
    return {
      remoteSnapshot: a,
      globalSnapshot: i,
    };
  }
  // eslint-disable-next-line max-lines-per-function
  async loadRemoteSnapshotInfo(t) {
    const { options: o } = this.HostInstance;
    await this.hooks.lifecycle.beforeLoadRemoteSnapshot.emit({
      options: o,
      moduleInfo: t,
    });
    let r = getGlobalSnapshotInfoByModuleInfo({
      name: this.HostInstance.options.name,
      version: this.HostInstance.options.version,
    });
    r ||
      ((r = {
        version: this.HostInstance.options.version || '',
        remoteEntry: '',
        remotesInfo: {},
      }),
      addGlobalSnapshot({
        [this.HostInstance.options.name]: r,
      })),
      r &&
        'remotesInfo' in r &&
        !getInfoWithoutType(r.remotesInfo, t.name).value &&
        ('version' in t || 'entry' in t) &&
        (r.remotesInfo = _extends({}, r == null ? void 0 : r.remotesInfo, {
          [t.name]: {
            matchedVersion: 'version' in t ? t.version : t.entry,
          },
        }));
    const {
        hostGlobalSnapshot: s,
        remoteSnapshot: l,
        globalSnapshot: a,
      } = this.getGlobalRemoteInfo(t),
      { remoteSnapshot: i, globalSnapshot: c } =
        await this.hooks.lifecycle.loadSnapshot.emit({
          options: o,
          moduleInfo: t,
          hostGlobalSnapshot: s,
          remoteSnapshot: l,
          globalSnapshot: a,
        });
    let u, d;
    if (i)
      if (isManifestProvider(i)) {
        const m = isBrowserEnv()
            ? i.remoteEntry
            : i.ssrRemoteEntry || i.remoteEntry || '',
          p = await this.getManifestJson(m, t, {}),
          y = setGlobalSnapshotInfoByModuleInfo(
            _extends({}, t, {
              // The global remote may be overridden
              // Therefore, set the snapshot key to the global address of the actual request
              entry: m,
            }),
            p,
          );
        (u = p), (d = y);
      } else {
        const { remoteSnapshot: m } =
          await this.hooks.lifecycle.loadRemoteSnapshot.emit({
            options: this.HostInstance.options,
            moduleInfo: t,
            remoteSnapshot: i,
            from: 'global',
          });
        (u = m), (d = c);
      }
    else if (isRemoteInfoWithEntry(t)) {
      const m = await this.getManifestJson(t.entry, t, {}),
        p = setGlobalSnapshotInfoByModuleInfo(t, m),
        { remoteSnapshot: y } =
          await this.hooks.lifecycle.loadRemoteSnapshot.emit({
            options: this.HostInstance.options,
            moduleInfo: t,
            remoteSnapshot: m,
            from: 'global',
          });
      (u = y), (d = p);
    } else
      error(
        getShortErrorMsg(RUNTIME_007, runtimeDescMap, {
          hostName: t.name,
          hostVersion: t.version,
          globalSnapshot: JSON.stringify(c),
        }),
      );
    return (
      await this.hooks.lifecycle.afterLoadSnapshot.emit({
        options: o,
        moduleInfo: t,
        remoteSnapshot: u,
      }),
      {
        remoteSnapshot: u,
        globalSnapshot: d,
      }
    );
  }
  getGlobalRemoteInfo(t) {
    return getGlobalRemoteInfo(t, this.HostInstance);
  }
  async getManifestJson(t, o, r) {
    const s = async () => {
        let a = this.manifestCache.get(t);
        if (a) return a;
        try {
          let i = await this.loaderHook.lifecycle.fetch.emit(t, {});
          (!i || !(i instanceof Response)) && (i = await fetch(t, {})),
            (a = await i.json());
        } catch (i) {
          (a =
            await this.HostInstance.remoteHandler.hooks.lifecycle.errorLoadRemote.emit(
              {
                id: t,
                error: i,
                from: 'runtime',
                lifecycle: 'afterResolve',
                origin: this.HostInstance,
              },
            )),
            a ||
              (delete this.manifestLoading[t],
              error(
                getShortErrorMsg(
                  RUNTIME_003,
                  runtimeDescMap,
                  {
                    manifestUrl: t,
                    moduleName: o.name,
                  },
                  `${i}`,
                ),
              ));
        }
        return (
          assert(
            a.metaData && a.exposes && a.shared,
            `${t} is not a federation manifest`,
          ),
          this.manifestCache.set(t, a),
          a
        );
      },
      l = async () => {
        const a = await s(),
          i = generateSnapshotFromManifest(a, {
            version: t,
          }),
          { remoteSnapshot: c } =
            await this.hooks.lifecycle.loadRemoteSnapshot.emit({
              options: this.HostInstance.options,
              moduleInfo: o,
              manifestJson: a,
              remoteSnapshot: i,
              manifestUrl: t,
              from: 'manifest',
            });
        return c;
      };
    return (
      this.manifestLoading[t] || (this.manifestLoading[t] = l().then((a) => a)),
      this.manifestLoading[t]
    );
  }
  constructor(t) {
    (this.loadingHostSnapshot = null),
      (this.manifestCache = /* @__PURE__ */ new Map()),
      (this.hooks = new PluginSystem({
        beforeLoadRemoteSnapshot: new AsyncHook('beforeLoadRemoteSnapshot'),
        loadSnapshot: new AsyncWaterfallHook('loadGlobalSnapshot'),
        loadRemoteSnapshot: new AsyncWaterfallHook('loadRemoteSnapshot'),
        afterLoadSnapshot: new AsyncWaterfallHook('afterLoadSnapshot'),
      })),
      (this.manifestLoading = Global.__FEDERATION__.__MANIFEST_LOADING__),
      (this.HostInstance = t),
      (this.loaderHook = t.loaderHook);
  }
}
class SharedHandler {
  // register shared in shareScopeMap
  registerShared(t, o) {
    const { shareInfos: r, shared: s } = formatShareConfigs(t, o);
    return (
      Object.keys(r).forEach((a) => {
        r[a].forEach((c) => {
          !getRegisteredShare(
            this.shareScopeMap,
            a,
            c,
            this.hooks.lifecycle.resolveShare,
          ) &&
            c &&
            c.lib &&
            this.setShared({
              pkgName: a,
              lib: c.lib,
              get: c.get,
              loaded: !0,
              shared: c,
              from: o.name,
            });
        });
      }),
      {
        shareInfos: r,
        shared: s,
      }
    );
  }
  async loadShare(t, o) {
    const { host: r } = this,
      s = getTargetSharedOptions({
        pkgName: t,
        extraOptions: o,
        shareInfos: r.options.shared,
      });
    s != null &&
      s.scope &&
      (await Promise.all(
        s.scope.map(async (u) => {
          await Promise.all(
            this.initializeSharing(u, {
              strategy: s.strategy,
            }),
          );
        }),
      ));
    const l = await this.hooks.lifecycle.beforeLoadShare.emit({
        pkgName: t,
        shareInfo: s,
        shared: r.options.shared,
        origin: r,
      }),
      { shareInfo: a } = l;
    assert(
      a,
      `Cannot find ${t} Share in the ${r.options.name}. Please ensure that the ${t} Share parameters have been injected`,
    );
    const i = getRegisteredShare(
        this.shareScopeMap,
        t,
        a,
        this.hooks.lifecycle.resolveShare,
      ),
      c = (u) => {
        u.useIn || (u.useIn = []), addUniqueItem(u.useIn, r.options.name);
      };
    if (i && i.lib) return c(i), i.lib;
    if (i && i.loading && !i.loaded) {
      const u = await i.loading;
      return (i.loaded = !0), i.lib || (i.lib = u), c(i), u;
    } else if (i) {
      const d = (async () => {
        const m = await i.get();
        (a.lib = m), (a.loaded = !0), c(a);
        const p = getRegisteredShare(
          this.shareScopeMap,
          t,
          a,
          this.hooks.lifecycle.resolveShare,
        );
        return p && ((p.lib = m), (p.loaded = !0)), m;
      })();
      return (
        this.setShared({
          pkgName: t,
          loaded: !1,
          shared: i,
          from: r.options.name,
          lib: null,
          loading: d,
        }),
        d
      );
    } else {
      if (o != null && o.customShareInfo) return !1;
      const d = (async () => {
        const m = await a.get();
        (a.lib = m), (a.loaded = !0), c(a);
        const p = getRegisteredShare(
          this.shareScopeMap,
          t,
          a,
          this.hooks.lifecycle.resolveShare,
        );
        return p && ((p.lib = m), (p.loaded = !0)), m;
      })();
      return (
        this.setShared({
          pkgName: t,
          loaded: !1,
          shared: a,
          from: r.options.name,
          lib: null,
          loading: d,
        }),
        d
      );
    }
  }
  /**
   * This function initializes the sharing sequence (executed only once per share scope).
   * It accepts one argument, the name of the share scope.
   * If the share scope does not exist, it creates one.
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  initializeSharing(t = DEFAULT_SCOPE, o) {
    const { host: r } = this,
      s = o == null ? void 0 : o.from,
      l = o == null ? void 0 : o.strategy;
    let a = o == null ? void 0 : o.initScope;
    const i = [];
    if (s !== 'build') {
      const { initTokens: g } = this;
      a || (a = []);
      let E = g[t];
      if (
        (E ||
          (E = g[t] =
            {
              from: this.host.name,
            }),
        a.indexOf(E) >= 0)
      )
        return i;
      a.push(E);
    }
    const c = this.shareScopeMap,
      u = r.options.name;
    c[t] || (c[t] = {});
    const d = c[t],
      m = (g, E) => {
        var _;
        const { version: R, eager: v } = E;
        d[g] = d[g] || {};
        const I = d[g],
          S = I[R],
          b = !!(S && (S.eager || ((_ = S.shareConfig) != null && _.eager)));
        (!S ||
          (S.strategy !== 'loaded-first' &&
            !S.loaded &&
            (!v != !b ? v : u > S.from))) &&
          (I[R] = E);
      },
      p = (g) => g && g.init && g.init(c[t], a),
      y = async (g) => {
        const { module: E } = await r.remoteHandler.getRemoteModuleAndOptions({
          id: g,
        });
        if (E.getEntry) {
          let _;
          try {
            _ = await E.getEntry();
          } catch (R) {
            _ = await r.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
              id: g,
              error: R,
              from: 'runtime',
              lifecycle: 'beforeLoadShare',
              origin: r,
            });
          }
          E.inited || (await p(_), (E.inited = !0));
        }
      };
    return (
      Object.keys(r.options.shared).forEach((g) => {
        r.options.shared[g].forEach((_) => {
          _.scope.includes(t) && m(g, _);
        });
      }),
      (r.options.shareStrategy === 'version-first' || l === 'version-first') &&
        r.options.remotes.forEach((g) => {
          g.shareScope === t && i.push(y(g.name));
        }),
      i
    );
  }
  // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
  // 1. If the loaded shared already exists globally, then it will be reused
  // 2. If lib exists in local shared, it will be used directly
  // 3. If the local get returns something other than Promise, then it will be used directly
  loadShareSync(t, o) {
    const { host: r } = this,
      s = getTargetSharedOptions({
        pkgName: t,
        extraOptions: o,
        shareInfos: r.options.shared,
      });
    s != null &&
      s.scope &&
      s.scope.forEach((i) => {
        this.initializeSharing(i, {
          strategy: s.strategy,
        });
      });
    const l = getRegisteredShare(
        this.shareScopeMap,
        t,
        s,
        this.hooks.lifecycle.resolveShare,
      ),
      a = (i) => {
        i.useIn || (i.useIn = []), addUniqueItem(i.useIn, r.options.name);
      };
    if (l) {
      if (typeof l.lib == 'function')
        return (
          a(l),
          l.loaded ||
            ((l.loaded = !0), l.from === r.options.name && (s.loaded = !0)),
          l.lib
        );
      if (typeof l.get == 'function') {
        const i = l.get();
        if (!(i instanceof Promise))
          return (
            a(l),
            this.setShared({
              pkgName: t,
              loaded: !0,
              from: r.options.name,
              lib: i,
              shared: l,
            }),
            i
          );
      }
    }
    if (s.lib) return s.loaded || (s.loaded = !0), s.lib;
    if (s.get) {
      const i = s.get();
      if (i instanceof Promise) {
        const c =
          (o == null ? void 0 : o.from) === 'build' ? RUNTIME_005 : RUNTIME_006;
        throw new Error(
          getShortErrorMsg(c, runtimeDescMap, {
            hostName: r.options.name,
            sharedPkgName: t,
          }),
        );
      }
      return (
        (s.lib = i),
        this.setShared({
          pkgName: t,
          loaded: !0,
          from: r.options.name,
          lib: s.lib,
          shared: s,
        }),
        s.lib
      );
    }
    throw new Error(
      getShortErrorMsg(RUNTIME_006, runtimeDescMap, {
        hostName: r.options.name,
        sharedPkgName: t,
      }),
    );
  }
  initShareScopeMap(t, o, r = {}) {
    const { host: s } = this;
    (this.shareScopeMap[t] = o),
      this.hooks.lifecycle.initContainerShareScopeMap.emit({
        shareScope: o,
        options: s.options,
        origin: s,
        scopeName: t,
        hostShareScopeMap: r.hostShareScopeMap,
      });
  }
  setShared({
    pkgName: t,
    shared: o,
    from: r,
    lib: s,
    loading: l,
    loaded: a,
    get: i,
  }) {
    const { version: c, scope: u = 'default' } = o,
      d = _object_without_properties_loose(o, ['version', 'scope']);
    (Array.isArray(u) ? u : [u]).forEach((p) => {
      if (
        (this.shareScopeMap[p] || (this.shareScopeMap[p] = {}),
        this.shareScopeMap[p][t] || (this.shareScopeMap[p][t] = {}),
        !this.shareScopeMap[p][t][c])
      ) {
        (this.shareScopeMap[p][t][c] = _extends(
          {
            version: c,
            scope: ['default'],
          },
          d,
          {
            lib: s,
            loaded: a,
            loading: l,
          },
        )),
          i && (this.shareScopeMap[p][t][c].get = i);
        return;
      }
      const y = this.shareScopeMap[p][t][c];
      l && !y.loading && (y.loading = l);
    });
  }
  _setGlobalShareScopeMap(t) {
    const o = getGlobalShareScope(),
      r = t.id || t.name;
    r && !o[r] && (o[r] = this.shareScopeMap);
  }
  constructor(t) {
    (this.hooks = new PluginSystem({
      afterResolve: new AsyncWaterfallHook('afterResolve'),
      beforeLoadShare: new AsyncWaterfallHook('beforeLoadShare'),
      // not used yet
      loadShare: new AsyncHook(),
      resolveShare: new SyncWaterfallHook('resolveShare'),
      // maybe will change, temporarily for internal use only
      initContainerShareScopeMap: new SyncWaterfallHook(
        'initContainerShareScopeMap',
      ),
    })),
      (this.host = t),
      (this.shareScopeMap = {}),
      (this.initTokens = {}),
      this._setGlobalShareScopeMap(t.options);
  }
}
class RemoteHandler {
  formatAndRegisterRemote(t, o) {
    return (o.remotes || []).reduce(
      (s, l) => (
        this.registerRemote(l, s, {
          force: !1,
        }),
        s
      ),
      t.remotes,
    );
  }
  setIdToRemoteMap(t, o) {
    const { remote: r, expose: s } = o,
      { name: l, alias: a } = r;
    if (
      ((this.idToRemoteMap[t] = {
        name: r.name,
        expose: s,
      }),
      a && t.startsWith(l))
    ) {
      const i = t.replace(l, a);
      this.idToRemoteMap[i] = {
        name: r.name,
        expose: s,
      };
      return;
    }
    if (a && t.startsWith(a)) {
      const i = t.replace(a, l);
      this.idToRemoteMap[i] = {
        name: r.name,
        expose: s,
      };
    }
  }
  // eslint-disable-next-line max-lines-per-function
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async loadRemote(t, o) {
    const { host: r } = this;
    try {
      const { loadFactory: s = !0 } = o || {
          loadFactory: !0,
        },
        {
          module: l,
          moduleOptions: a,
          remoteMatchInfo: i,
        } = await this.getRemoteModuleAndOptions({
          id: t,
        }),
        {
          pkgNameOrAlias: c,
          remote: u,
          expose: d,
          id: m,
          remoteSnapshot: p,
        } = i,
        y = await l.get(m, d, o, p),
        g = await this.hooks.lifecycle.onLoad.emit({
          id: m,
          pkgNameOrAlias: c,
          expose: d,
          exposeModule: s ? y : void 0,
          exposeModuleFactory: s ? void 0 : y,
          remote: u,
          options: a,
          moduleInstance: l,
          origin: r,
        });
      return this.setIdToRemoteMap(t, i), typeof g == 'function' ? g : y;
    } catch (s) {
      const { from: l = 'runtime' } = o || {
          from: 'runtime',
        },
        a = await this.hooks.lifecycle.errorLoadRemote.emit({
          id: t,
          error: s,
          from: l,
          lifecycle: 'onLoad',
          origin: r,
        });
      if (!a) throw s;
      return a;
    }
  }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async preloadRemote(t) {
    const { host: o } = this;
    await this.hooks.lifecycle.beforePreloadRemote.emit({
      preloadOps: t,
      options: o.options,
      origin: o,
    });
    const r = formatPreloadArgs(o.options.remotes, t);
    await Promise.all(
      r.map(async (s) => {
        const { remote: l } = s,
          a = getRemoteInfo(l),
          { globalSnapshot: i, remoteSnapshot: c } =
            await o.snapshotHandler.loadRemoteSnapshotInfo(l),
          u = await this.hooks.lifecycle.generatePreloadAssets.emit({
            origin: o,
            preloadOptions: s,
            remote: l,
            remoteInfo: a,
            globalSnapshot: i,
            remoteSnapshot: c,
          });
        u && preloadAssets(a, o, u);
      }),
    );
  }
  registerRemotes(t, o) {
    const { host: r } = this;
    t.forEach((s) => {
      this.registerRemote(s, r.options.remotes, {
        force: o == null ? void 0 : o.force,
      });
    });
  }
  async getRemoteModuleAndOptions(t) {
    const { host: o } = this,
      { id: r } = t;
    let s;
    try {
      s = await this.hooks.lifecycle.beforeRequest.emit({
        id: r,
        options: o.options,
        origin: o,
      });
    } catch (g) {
      if (
        ((s = await this.hooks.lifecycle.errorLoadRemote.emit({
          id: r,
          options: o.options,
          origin: o,
          from: 'runtime',
          error: g,
          lifecycle: 'beforeRequest',
        })),
        !s)
      )
        throw g;
    }
    const { id: l } = s,
      a = matchRemoteWithNameAndExpose(o.options.remotes, l);
    assert(
      a,
      getShortErrorMsg(RUNTIME_004, runtimeDescMap, {
        hostName: o.options.name,
        requestId: l,
      }),
    );
    const { remote: i } = a,
      c = getRemoteInfo(i),
      u = await o.sharedHandler.hooks.lifecycle.afterResolve.emit(
        _extends(
          {
            id: l,
          },
          a,
          {
            options: o.options,
            origin: o,
            remoteInfo: c,
          },
        ),
      ),
      { remote: d, expose: m } = u;
    assert(
      d && m,
      `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${l}.`,
    );
    let p = o.moduleCache.get(d.name);
    const y = {
      host: o,
      remoteInfo: c,
    };
    return (
      p || ((p = new Module(y)), o.moduleCache.set(d.name, p)),
      {
        module: p,
        moduleOptions: y,
        remoteMatchInfo: u,
      }
    );
  }
  registerRemote(t, o, r) {
    const { host: s } = this,
      l = () => {
        if (t.alias) {
          const i = o.find((c) => {
            var u;
            return (
              t.alias &&
              (c.name.startsWith(t.alias) ||
                ((u = c.alias) == null ? void 0 : u.startsWith(t.alias)))
            );
          });
          assert(
            !i,
            `The alias ${t.alias} of remote ${t.name} is not allowed to be the prefix of ${i && i.name} name or alias`,
          );
        }
        'entry' in t &&
          isBrowserEnv() &&
          !t.entry.startsWith('http') &&
          (t.entry = new URL(t.entry, window.location.origin).href),
          t.shareScope || (t.shareScope = DEFAULT_SCOPE),
          t.type || (t.type = DEFAULT_REMOTE_TYPE);
      };
    this.hooks.lifecycle.beforeRegisterRemote.emit({
      remote: t,
      origin: s,
    });
    const a = o.find((i) => i.name === t.name);
    if (!a)
      l(),
        o.push(t),
        this.hooks.lifecycle.registerRemote.emit({
          remote: t,
          origin: s,
        });
    else {
      const i = [
        `The remote "${t.name}" is already registered.`,
        'Please note that overriding it may cause unexpected errors.',
      ];
      r != null &&
        r.force &&
        (this.removeRemote(a),
        l(),
        o.push(t),
        this.hooks.lifecycle.registerRemote.emit({
          remote: t,
          origin: s,
        }),
        warn$1(i.join(' ')));
    }
  }
  removeRemote(t) {
    try {
      const { host: r } = this,
        { name: s } = t,
        l = r.options.remotes.findIndex((i) => i.name === s);
      l !== -1 && r.options.remotes.splice(l, 1);
      const a = r.moduleCache.get(t.name);
      if (a) {
        const i = a.remoteInfo,
          c = i.entryGlobalName;
        if (CurrentGlobal[c]) {
          var o;
          (o = Object.getOwnPropertyDescriptor(CurrentGlobal, c)) != null &&
          o.configurable
            ? delete CurrentGlobal[c]
            : (CurrentGlobal[c] = void 0);
        }
        const u = getRemoteEntryUniqueKey(a.remoteInfo);
        globalLoading[u] && delete globalLoading[u],
          r.snapshotHandler.manifestCache.delete(i.entry);
        let d = i.buildVersion
          ? composeKeyWithSeparator(i.name, i.buildVersion)
          : i.name;
        const m = CurrentGlobal.__FEDERATION__.__INSTANCES__.findIndex((y) =>
          i.buildVersion ? y.options.id === d : y.name === d,
        );
        if (m !== -1) {
          const y = CurrentGlobal.__FEDERATION__.__INSTANCES__[m];
          d = y.options.id || d;
          const g = getGlobalShareScope();
          let E = !0;
          const _ = [];
          Object.keys(g).forEach((R) => {
            const v = g[R];
            v &&
              Object.keys(v).forEach((I) => {
                const S = v[I];
                S &&
                  Object.keys(S).forEach((b) => {
                    const A = S[b];
                    A &&
                      Object.keys(A).forEach((T) => {
                        const $ = A[T];
                        $ &&
                          typeof $ == 'object' &&
                          $.from === i.name &&
                          ($.loaded || $.loading
                            ? (($.useIn = $.useIn.filter((w) => w !== i.name)),
                              $.useIn.length ? (E = !1) : _.push([R, I, b, T]))
                            : _.push([R, I, b, T]));
                      });
                  });
              });
          }),
            E && ((y.shareScopeMap = {}), delete g[d]),
            _.forEach(([R, v, I, S]) => {
              var b, A, T;
              (T = g[R]) == null ||
                (A = T[v]) == null ||
                (b = A[I]) == null ||
                delete b[S];
            }),
            CurrentGlobal.__FEDERATION__.__INSTANCES__.splice(m, 1);
        }
        const { hostGlobalSnapshot: p } = getGlobalRemoteInfo(t, r);
        if (p) {
          const y =
            p &&
            'remotesInfo' in p &&
            p.remotesInfo &&
            getInfoWithoutType(p.remotesInfo, t.name).key;
          y &&
            (delete p.remotesInfo[y],
            Global.__FEDERATION__.__MANIFEST_LOADING__[y] &&
              delete Global.__FEDERATION__.__MANIFEST_LOADING__[y]);
        }
        r.moduleCache.delete(t.name);
      }
    } catch (r) {
      logger.log('removeRemote fail: ', r);
    }
  }
  constructor(t) {
    (this.hooks = new PluginSystem({
      beforeRegisterRemote: new SyncWaterfallHook('beforeRegisterRemote'),
      registerRemote: new SyncWaterfallHook('registerRemote'),
      beforeRequest: new AsyncWaterfallHook('beforeRequest'),
      onLoad: new AsyncHook('onLoad'),
      handlePreloadModule: new SyncHook('handlePreloadModule'),
      errorLoadRemote: new AsyncHook('errorLoadRemote'),
      beforePreloadRemote: new AsyncHook('beforePreloadRemote'),
      generatePreloadAssets: new AsyncHook('generatePreloadAssets'),
      // not used yet
      afterPreloadRemote: new AsyncHook(),
      loadEntry: new AsyncHook(),
    })),
      (this.host = t),
      (this.idToRemoteMap = {});
  }
}
class FederationHost {
  initOptions(t) {
    this.registerPlugins(t.plugins);
    const o = this.formatOptions(this.options, t);
    return (this.options = o), o;
  }
  async loadShare(t, o) {
    return this.sharedHandler.loadShare(t, o);
  }
  // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
  // 1. If the loaded shared already exists globally, then it will be reused
  // 2. If lib exists in local shared, it will be used directly
  // 3. If the local get returns something other than Promise, then it will be used directly
  loadShareSync(t, o) {
    return this.sharedHandler.loadShareSync(t, o);
  }
  initializeSharing(t = DEFAULT_SCOPE, o) {
    return this.sharedHandler.initializeSharing(t, o);
  }
  initRawContainer(t, o, r) {
    const s = getRemoteInfo({
        name: t,
        entry: o,
      }),
      l = new Module({
        host: this,
        remoteInfo: s,
      });
    return (l.remoteEntryExports = r), this.moduleCache.set(t, l), l;
  }
  // eslint-disable-next-line max-lines-per-function
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async loadRemote(t, o) {
    return this.remoteHandler.loadRemote(t, o);
  }
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async preloadRemote(t) {
    return this.remoteHandler.preloadRemote(t);
  }
  initShareScopeMap(t, o, r = {}) {
    this.sharedHandler.initShareScopeMap(t, o, r);
  }
  formatOptions(t, o) {
    const { shared: r } = formatShareConfigs(t, o),
      { userOptions: s, options: l } = this.hooks.lifecycle.beforeInit.emit({
        origin: this,
        userOptions: o,
        options: t,
        shareInfo: r,
      }),
      a = this.remoteHandler.formatAndRegisterRemote(l, s),
      { shared: i } = this.sharedHandler.registerShared(l, s),
      c = [...l.plugins];
    s.plugins &&
      s.plugins.forEach((d) => {
        c.includes(d) || c.push(d);
      });
    const u = _extends({}, t, o, {
      plugins: c,
      remotes: a,
      shared: i,
    });
    return (
      this.hooks.lifecycle.init.emit({
        origin: this,
        options: u,
      }),
      u
    );
  }
  registerPlugins(t) {
    const o = registerPlugins(t, [
      this.hooks,
      this.remoteHandler.hooks,
      this.sharedHandler.hooks,
      this.snapshotHandler.hooks,
      this.loaderHook,
      this.bridgeHook,
    ]);
    this.options.plugins = this.options.plugins.reduce(
      (r, s) => (s && r && !r.find((l) => l.name === s.name) && r.push(s), r),
      o || [],
    );
  }
  registerRemotes(t, o) {
    return this.remoteHandler.registerRemotes(t, o);
  }
  constructor(t) {
    (this.hooks = new PluginSystem({
      beforeInit: new SyncWaterfallHook('beforeInit'),
      init: new SyncHook(),
      // maybe will change, temporarily for internal use only
      beforeInitContainer: new AsyncWaterfallHook('beforeInitContainer'),
      // maybe will change, temporarily for internal use only
      initContainer: new AsyncWaterfallHook('initContainer'),
    })),
      (this.version = '0.10.0'),
      (this.moduleCache = /* @__PURE__ */ new Map()),
      (this.loaderHook = new PluginSystem({
        // FIXME: may not be suitable , not open to the public yet
        getModuleInfo: new SyncHook(),
        createScript: new SyncHook(),
        createLink: new SyncHook(),
        fetch: new AsyncHook(),
        loadEntryError: new AsyncHook(),
        getModuleFactory: new AsyncHook(),
      })),
      (this.bridgeHook = new PluginSystem({
        beforeBridgeRender: new SyncHook(),
        afterBridgeRender: new SyncHook(),
        beforeBridgeDestroy: new SyncHook(),
        afterBridgeDestroy: new SyncHook(),
      }));
    const o = {
      id: getBuilderId(),
      name: t.name,
      plugins: [snapshotPlugin(), generatePreloadAssetsPlugin()],
      remotes: [],
      shared: {},
      inBrowser: isBrowserEnv(),
    };
    (this.name = t.name),
      (this.options = o),
      (this.snapshotHandler = new SnapshotHandler(this)),
      (this.sharedHandler = new SharedHandler(this)),
      (this.remoteHandler = new RemoteHandler(this)),
      (this.shareScopeMap = this.sharedHandler.shareScopeMap),
      this.registerPlugins([...o.plugins, ...(t.plugins || [])]),
      (this.options = this.formatOptions(o, t));
  }
}
let FederationInstance = null;
function getInstance() {
  return FederationInstance;
}
setGlobalFederationConstructor(FederationHost);
function createBridgeComponent(n) {
  const t = /* @__PURE__ */ new Map(),
    o = getInstance();
  return () => ({
    __APP_VERSION__: '0.10.0',
    async render(r) {
      var y, g, E;
      LoggerInstance.debug('createBridgeComponent render Info', r);
      const { moduleName: s, dom: l, basename: a, memoryRoute: i, ...c } = r,
        u = Vue.createApp(n.rootComponent, c);
      t.set(l, u);
      const d = await ((E =
          (g =
            (y = o == null ? void 0 : o.bridgeHook) == null
              ? void 0
              : y.lifecycle) == null
            ? void 0
            : g.beforeBridgeRender) == null
          ? void 0
          : E.emit(r)),
        m =
          d && typeof d == 'object' && d != null && d.extraProps
            ? d == null
              ? void 0
              : d.extraProps
            : {},
        p = n.appOptions({
          app: u,
          basename: a,
          memoryRoute: i,
          ...c,
          ...m,
        });
      p != null &&
        p.router &&
        (console.log('vue3-bridge==>bridgeOptions.router', p.router),
        u.use(p.router)),
        u.mount(l);
    },
    destroy(r) {
      LoggerInstance.debug('createBridgeComponent destroy Info', r);
      const s = t.get(r == null ? void 0 : r.dom);
      s == null || s.unmount();
    },
  });
}
function e() {
  const n = new PopStateEvent('popstate', { state: window.history.state });
  window.dispatchEvent(n);
}
const RemoteApp = /* @__PURE__ */ defineComponent({
  name: 'RemoteApp',
  props: {
    moduleName: String,
    basename: String,
    memoryRoute: Object,
    providerInfo: Function,
    rootAttrs: Object,
  },
  inheritAttrs: !1,
  setup(n) {
    const t = ref(null),
      o = ref(null),
      r = ref(''),
      s = useRoute(),
      l = getInstance(),
      a = useAttrs(),
      i = async () => {
        var p, y, g, E;
        const u = (p = n.providerInfo) == null ? void 0 : p.call(n);
        o.value = u;
        let d = {
          ...a,
          moduleName: n.moduleName,
          dom: t.value,
          basename: n.basename,
          memoryRoute: n.memoryRoute,
        };
        LoggerInstance.debug(
          'createRemoteComponent LazyComponent render >>>',
          d,
        );
        const m =
          (await ((E =
            (g =
              (y = l == null ? void 0 : l.bridgeHook) == null
                ? void 0
                : y.lifecycle) == null
              ? void 0
              : g.beforeBridgeRender) == null
            ? void 0
            : E.emit(d))) || {};
        (d = {
          ...d,
          ...m.extraProps,
        }),
          u.render(d);
      },
      c = watch(
        () => s.path,
        (u) => {
          u !== s.path && i(),
            r.value !== '' &&
              r.value !== u &&
              (LoggerInstance.debug(
                'createRemoteComponent dispatchPopstateEnv >>>',
                {
                  ...n,
                  pathname: s.path,
                },
              ),
              e()),
            (r.value = u);
        },
      );
    return (
      onMounted(() => {
        i();
      }),
      onBeforeUnmount(() => {
        var u;
        LoggerInstance.debug(
          'createRemoteComponent LazyComponent destroy >>>',
          {
            ...n,
          },
        ),
          c(),
          (u = o.value) == null ||
            u.destroy({
              dom: t.value,
            });
      }),
      () =>
        createVNode(
          'div',
          mergeProps(n.rootAttrs || {}, {
            ref: t,
          }),
          null,
        )
    );
  },
});
function createRemoteComponent(n) {
  return defineAsyncComponent({
    __APP_VERSION__: '0.10.0',
    ...n.asyncComponentOptions,
    //@ts-ignore
    loader: async () => {
      var c;
      const t = useRoute();
      let o = '/';
      const r = (c = t.matched[0]) == null ? void 0 : c.path;
      r &&
        (r.endsWith('/:pathMatch(.*)*')
          ? (o = r.replace('/:pathMatch(.*)*', ''))
          : (o = t.matched[0].path));
      const s = (n == null ? void 0 : n.export) || 'default';
      LoggerInstance.debug('createRemoteComponent LazyComponent create >>>', {
        basename: o,
        info: n,
      });
      const l = await n.loader(),
        a = l && l[Symbol.for('mf_module_id')],
        i = l[s];
      if (
        (LoggerInstance.debug(
          'createRemoteComponent LazyComponent loadRemote info >>>',
          { moduleName: a, module: l, exportName: s, basename: o, route: t },
        ),
        s in l && typeof i == 'function')
      )
        return {
          render() {
            return h(RemoteApp, {
              moduleName: a,
              providerInfo: i,
              basename: o,
              rootAttrs: n.rootAttrs,
            });
          },
        };
      throw new Error('module not found');
    },
  });
}
export { createBridgeComponent, createRemoteComponent };
