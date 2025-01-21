// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
const e = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
export const validate = D;
export default D;
const t = {
    definitions: {
      AmdContainer: { type: 'string', minLength: 1 },
      AuxiliaryComment: {
        anyOf: [
          { type: 'string' },
          { $ref: '#/definitions/LibraryCustomUmdCommentObject' },
        ],
      },
      EntryRuntime: {
        anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }],
      },
      Exposes: {
        anyOf: [
          {
            type: 'array',
            items: {
              anyOf: [
                { $ref: '#/definitions/ExposesItem' },
                { $ref: '#/definitions/ExposesObject' },
              ],
            },
          },
          { $ref: '#/definitions/ExposesObject' },
        ],
      },
      ExposesConfig: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          import: {
            anyOf: [
              { $ref: '#/definitions/ExposesItem' },
              { $ref: '#/definitions/ExposesItems' },
            ],
          },
          name: { type: 'string' },
        },
        required: ['import'],
      },
      ExposesItem: { type: 'string', minLength: 1 },
      ExposesItems: {
        type: 'array',
        items: { $ref: '#/definitions/ExposesItem' },
      },
      ExposesObject: {
        type: 'object',
        additionalProperties: {
          anyOf: [
            { $ref: '#/definitions/ExposesConfig' },
            { $ref: '#/definitions/ExposesItem' },
            { $ref: '#/definitions/ExposesItems' },
          ],
        },
      },
      ExternalsType: {
        enum: [
          'var',
          'module',
          'assign',
          'this',
          'window',
          'self',
          'global',
          'commonjs',
          'commonjs2',
          'commonjs-module',
          'commonjs-static',
          'amd',
          'amd-require',
          'umd',
          'umd2',
          'jsonp',
          'system',
          'promise',
          'import',
          'script',
          'module-import',
          'node-commonjs',
        ],
      },
      LibraryCustomUmdCommentObject: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          amd: { type: 'string' },
          commonjs: { type: 'string' },
          commonjs2: { type: 'string' },
          root: { type: 'string' },
        },
      },
      LibraryCustomUmdObject: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          amd: { type: 'string', minLength: 1 },
          commonjs: { type: 'string', minLength: 1 },
          root: {
            anyOf: [
              { type: 'array', items: { type: 'string', minLength: 1 } },
              { type: 'string', minLength: 1 },
            ],
          },
        },
      },
      LibraryExport: {
        anyOf: [
          { type: 'array', items: { type: 'string', minLength: 1 } },
          { type: 'string', minLength: 1 },
        ],
      },
      LibraryName: {
        anyOf: [
          {
            type: 'array',
            items: { type: 'string', minLength: 1 },
            minItems: 1,
          },
          { type: 'string', minLength: 1 },
          { $ref: '#/definitions/LibraryCustomUmdObject' },
        ],
      },
      LibraryOptions: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          amdContainer: { $ref: '#/definitions/AmdContainer' },
          auxiliaryComment: { $ref: '#/definitions/AuxiliaryComment' },
          export: { $ref: '#/definitions/LibraryExport' },
          name: { $ref: '#/definitions/LibraryName' },
          type: { $ref: '#/definitions/LibraryType' },
          umdNamedDefine: { $ref: '#/definitions/UmdNamedDefine' },
        },
        required: ['type'],
      },
      LibraryType: {
        anyOf: [
          {
            enum: [
              'var',
              'module',
              'assign',
              'assign-properties',
              'this',
              'window',
              'self',
              'global',
              'commonjs',
              'commonjs2',
              'commonjs-module',
              'commonjs-static',
              'amd',
              'amd-require',
              'umd',
              'umd2',
              'jsonp',
              'system',
            ],
          },
          { type: 'string' },
        ],
      },
      Remotes: {
        anyOf: [
          {
            type: 'array',
            items: {
              anyOf: [
                { $ref: '#/definitions/RemotesItem' },
                { $ref: '#/definitions/RemotesObject' },
              ],
            },
          },
          { $ref: '#/definitions/RemotesObject' },
        ],
      },
      RemotesConfig: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          external: {
            anyOf: [
              { $ref: '#/definitions/RemotesItem' },
              { $ref: '#/definitions/RemotesItems' },
            ],
          },
          shareScope: { type: 'string', minLength: 1 },
        },
        required: ['external'],
      },
      RemotesItem: { type: 'string', minLength: 1 },
      RemotesItems: {
        type: 'array',
        items: { $ref: '#/definitions/RemotesItem' },
      },
      RemotesObject: {
        type: 'object',
        additionalProperties: {
          anyOf: [
            { $ref: '#/definitions/RemotesConfig' },
            { $ref: '#/definitions/RemotesItem' },
            { $ref: '#/definitions/RemotesItems' },
          ],
        },
      },
      Shared: {
        anyOf: [
          {
            type: 'array',
            items: {
              anyOf: [
                { $ref: '#/definitions/SharedItem' },
                { $ref: '#/definitions/SharedObject' },
              ],
            },
          },
          { $ref: '#/definitions/SharedObject' },
        ],
      },
      SharedConfig: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          eager: { type: 'boolean' },
          import: {
            anyOf: [{ enum: [!1] }, { $ref: '#/definitions/SharedItem' }],
          },
          packageName: { type: 'string', minLength: 1 },
          requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
          shareKey: { type: 'string', minLength: 1 },
          shareScope: { type: 'string', minLength: 1 },
          shareStrategy: { enum: ['version-first', 'loaded-first'] },
          singleton: { type: 'boolean' },
          strictVersion: { type: 'boolean' },
          version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
        },
      },
      SharedItem: { type: 'string', minLength: 1 },
      SharedObject: {
        type: 'object',
        additionalProperties: {
          anyOf: [
            { $ref: '#/definitions/SharedConfig' },
            { $ref: '#/definitions/SharedItem' },
          ],
        },
      },
      UmdNamedDefine: { type: 'boolean' },
    },
    type: 'object',
    additionalProperties: !1,
    properties: {
      dataPrefetch: { type: 'boolean' },
      exposes: { $ref: '#/definitions/Exposes' },
      filename: { type: 'string', absolutePath: !1 },
      getPublicPath: { type: 'string' },
      implementation: { type: 'string' },
      library: { $ref: '#/definitions/LibraryOptions' },
      manifest: {
        anyOf: [
          { type: 'boolean' },
          {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              disableAssetsAnalyze: { type: 'boolean' },
              fileName: { type: 'string' },
              additionalData: { type: 'string' },
            },
          },
        ],
      },
      name: { type: 'string' },
      remoteType: { oneOf: [{ $ref: '#/definitions/ExternalsType' }] },
      remotes: { $ref: '#/definitions/Remotes' },
      runtime: { $ref: '#/definitions/EntryRuntime' },
      runtimePlugins: { type: 'array', items: { type: 'string' } },
      shareScope: { type: 'string', minLength: 1 },
      shareStrategy: { enum: ['version-first', 'loaded-first'] },
      shared: { $ref: '#/definitions/Shared' },
      virtualRuntimeEntry: { type: 'boolean' },
      dev: {
        anyOf: [
          { type: 'boolean' },
          {
            type: 'object',
            properties: {
              disableLiveReload: { type: 'boolean' },
              disableHotTypesReload: { type: 'boolean' },
              disableDynamicRemoteTypeHints: { type: 'boolean' },
            },
          },
        ],
      },
      dts: {
        anyOf: [
          { type: 'boolean' },
          {
            type: 'object',
            properties: {
              generateTypes: {
                anyOf: [
                  { type: 'boolean' },
                  {
                    type: 'object',
                    properties: {
                      tsConfigPath: { type: 'string' },
                      typesFolder: { type: 'string' },
                      compiledTypesFolder: { type: 'string' },
                      deleteTypesFolder: { type: 'boolean' },
                      additionalFilesToCompile: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                      compileInChildProcess: { type: 'boolean' },
                      compilerInstance: { enum: ['tsc', 'vue-tsc'] },
                      generateAPITypes: { type: 'boolean' },
                      extractThirdParty: { type: 'boolean' },
                      extractRemoteTypes: { type: 'boolean' },
                      abortOnError: { type: 'boolean' },
                    },
                  },
                ],
              },
              consumeTypes: {
                anyOf: [
                  { type: 'boolean' },
                  {
                    type: 'object',
                    properties: {
                      typesFolder: { type: 'string' },
                      abortOnError: { type: 'boolean' },
                      remoteTypesFolder: { type: 'string' },
                      deleteTypesFolder: { type: 'boolean' },
                      maxRetries: { type: 'number' },
                      consumeAPITypes: { type: 'boolean' },
                      runtimePkgs: { type: 'array', items: { type: 'string' } },
                    },
                  },
                ],
              },
              tsConfigPath: { type: 'string' },
              extraOptions: { type: 'object' },
              implementation: { type: 'string' },
              cwd: { type: 'string' },
              displayErrorInTerminal: { type: 'boolean' },
            },
          },
        ],
      },
      experiments: {
        type: 'object',
        properties: {
          federationRuntime: {
            anyOf: [
              { type: 'boolean', enum: [!1] },
              { type: 'string', enum: ['hoisted'] },
            ],
          },
          externalRuntime: { type: 'boolean' },
          provideExternalRuntime: { type: 'boolean' },
        },
      },
      bridge: {
        type: 'object',
        properties: { disableAlias: { type: 'boolean', default: !1 } },
      },
    },
  },
  r = {
    enum: [
      'var',
      'module',
      'assign',
      'this',
      'window',
      'self',
      'global',
      'commonjs',
      'commonjs2',
      'commonjs-module',
      'commonjs-static',
      'amd',
      'amd-require',
      'umd',
      'umd2',
      'jsonp',
      'system',
      'promise',
      'import',
      'script',
      'module-import',
      'node-commonjs',
    ],
  },
  n = { anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }] },
  s = Object.prototype.hasOwnProperty,
  o = require('ajv/dist/runtime/ucs2length').default;
function a(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  if (!Array.isArray(e))
    return (a.errors = [{ params: { type: 'array' } }]), !1;
  {
    const t = e.length;
    for (let r = 0; r < t; r++) {
      let t = e[r];
      const n = 0;
      if ('string' != typeof t)
        return (a.errors = [{ params: { type: 'string' } }]), !1;
      if (o(t) < 1) return (a.errors = [{ params: { limit: 1 } }]), !1;
      if (0 !== n) break;
    }
  }
  return (a.errors = null), !0;
}
function i(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (i.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.import && (r = 'import'))
        return (i.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = p;
        for (const t in e)
          if ('import' !== t && 'name' !== t)
            return (i.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === p) {
          if (void 0 !== e.import) {
            let r = e.import;
            const n = p,
              u = p;
            let y = !1;
            const c = p;
            if (p == p)
              if ('string' == typeof r) {
                if (o(r) < 1) {
                  const e = { params: { limit: 1 } };
                  null === l ? (l = [e]) : l.push(e), p++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === l ? (l = [e]) : l.push(e), p++;
              }
            var f = c === p;
            if (((y = y || f), !y)) {
              const n = p;
              a(r, {
                instancePath: t + '/import',
                parentData: e,
                parentDataProperty: 'import',
                rootData: s,
              }) ||
                ((l = null === l ? a.errors : l.concat(a.errors)),
                (p = l.length)),
                (f = n === p),
                (y = y || f);
            }
            if (!y) {
              const e = { params: {} };
              return (
                null === l ? (l = [e]) : l.push(e), p++, (i.errors = l), !1
              );
            }
            (p = u), null !== l && (u ? (l.length = u) : (l = null));
            var m = n === p;
          } else m = !0;
          if (m)
            if (void 0 !== e.name) {
              const t = p;
              if ('string' != typeof e.name)
                return (i.errors = [{ params: { type: 'string' } }]), !1;
              m = t === p;
            } else m = !0;
        }
      }
    }
  }
  return (i.errors = l), 0 === p;
}
function l(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let p = null,
    f = 0;
  if (0 === f) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (l.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let n = e[r];
      const u = f,
        y = f;
      let c = !1;
      const d = f;
      i(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((p = null === p ? i.errors : p.concat(i.errors)), (f = p.length));
      var m = d === f;
      if (((c = c || m), !c)) {
        const i = f;
        if (f == f)
          if ('string' == typeof n) {
            if (o(n) < 1) {
              const e = { params: { limit: 1 } };
              null === p ? (p = [e]) : p.push(e), f++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === p ? (p = [e]) : p.push(e), f++;
          }
        if (((m = i === f), (c = c || m), !c)) {
          const o = f;
          a(n, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: s,
          }) ||
            ((p = null === p ? a.errors : p.concat(a.errors)), (f = p.length)),
            (m = o === f),
            (c = c || m);
        }
      }
      if (!c) {
        const e = { params: {} };
        return null === p ? (p = [e]) : p.push(e), f++, (l.errors = p), !1;
      }
      if (((f = y), null !== p && (y ? (p.length = y) : (p = null)), u !== f))
        break;
    }
  }
  return (l.errors = p), 0 === f;
}
function p(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    i = 0;
  const f = i;
  let m = !1;
  const u = i;
  if (i === u)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const p = i,
          f = i;
        let m = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof r) {
            if (o(r) < 1) {
              const e = { params: { limit: 1 } };
              null === a ? (a = [e]) : a.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), i++;
          }
        var y = u === i;
        if (((m = m || y), !m)) {
          const o = i;
          l(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((a = null === a ? l.errors : a.concat(l.errors)), (i = a.length)),
            (y = o === i),
            (m = m || y);
        }
        if (m) (i = f), null !== a && (f ? (a.length = f) : (a = null));
        else {
          const e = { params: {} };
          null === a ? (a = [e]) : a.push(e), i++;
        }
        if (p !== i) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === a ? (a = [e]) : a.push(e), i++;
    }
  var c = u === i;
  if (((m = m || c), !m)) {
    const o = i;
    l(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((a = null === a ? l.errors : a.concat(l.errors)), (i = a.length)),
      (c = o === i),
      (m = m || c);
  }
  if (!m) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), i++, (p.errors = a), !1;
  }
  return (
    (i = f),
    null !== a && (f ? (a.length = f) : (a = null)),
    (p.errors = a),
    0 === i
  );
}
const f = {
  anyOf: [
    {
      enum: [
        'var',
        'module',
        'assign',
        'assign-properties',
        'this',
        'window',
        'self',
        'global',
        'commonjs',
        'commonjs2',
        'commonjs-module',
        'commonjs-static',
        'amd',
        'amd-require',
        'umd',
        'umd2',
        'jsonp',
        'system',
      ],
    },
    { type: 'string' },
  ],
};
function m(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let o = null,
    a = 0;
  const i = a;
  let l = !1;
  const p = a;
  if ('string' != typeof e) {
    const e = { params: { type: 'string' } };
    null === o ? (o = [e]) : o.push(e), a++;
  }
  var f = p === a;
  if (((l = l || f), !l)) {
    const t = a;
    if (a == a)
      if (e && 'object' == typeof e && !Array.isArray(e)) {
        const t = a;
        for (const t in e)
          if (
            'amd' !== t &&
            'commonjs' !== t &&
            'commonjs2' !== t &&
            'root' !== t
          ) {
            const e = { params: { additionalProperty: t } };
            null === o ? (o = [e]) : o.push(e), a++;
            break;
          }
        if (t === a) {
          if (void 0 !== e.amd) {
            const t = a;
            if ('string' != typeof e.amd) {
              const e = { params: { type: 'string' } };
              null === o ? (o = [e]) : o.push(e), a++;
            }
            var u = t === a;
          } else u = !0;
          if (u) {
            if (void 0 !== e.commonjs) {
              const t = a;
              if ('string' != typeof e.commonjs) {
                const e = { params: { type: 'string' } };
                null === o ? (o = [e]) : o.push(e), a++;
              }
              u = t === a;
            } else u = !0;
            if (u) {
              if (void 0 !== e.commonjs2) {
                const t = a;
                if ('string' != typeof e.commonjs2) {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), a++;
                }
                u = t === a;
              } else u = !0;
              if (u)
                if (void 0 !== e.root) {
                  const t = a;
                  if ('string' != typeof e.root) {
                    const e = { params: { type: 'string' } };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                  u = t === a;
                } else u = !0;
            }
          }
        }
      } else {
        const e = { params: { type: 'object' } };
        null === o ? (o = [e]) : o.push(e), a++;
      }
    (f = t === a), (l = l || f);
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), a++, (m.errors = o), !1;
  }
  return (
    (a = i),
    null !== o && (i ? (o.length = i) : (o = null)),
    (m.errors = o),
    0 === a
  );
}
function u(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    i = 0;
  const l = i;
  let p = !1;
  const f = i;
  if (i === f)
    if (Array.isArray(e))
      if (e.length < 1) {
        const e = { params: { limit: 1 } };
        null === a ? (a = [e]) : a.push(e), i++;
      } else {
        const t = e.length;
        for (let r = 0; r < t; r++) {
          let t = e[r];
          const n = i;
          if (i === n)
            if ('string' == typeof t) {
              if (o(t) < 1) {
                const e = { params: { limit: 1 } };
                null === a ? (a = [e]) : a.push(e), i++;
              }
            } else {
              const e = { params: { type: 'string' } };
              null === a ? (a = [e]) : a.push(e), i++;
            }
          if (n !== i) break;
        }
      }
    else {
      const e = { params: { type: 'array' } };
      null === a ? (a = [e]) : a.push(e), i++;
    }
  var m = f === i;
  if (((p = p || m), !p)) {
    const t = i;
    if (i === t)
      if ('string' == typeof e) {
        if (o(e) < 1) {
          const e = { params: { limit: 1 } };
          null === a ? (a = [e]) : a.push(e), i++;
        }
      } else {
        const e = { params: { type: 'string' } };
        null === a ? (a = [e]) : a.push(e), i++;
      }
    if (((m = t === i), (p = p || m), !p)) {
      const t = i;
      if (i == i)
        if (e && 'object' == typeof e && !Array.isArray(e)) {
          const t = i;
          for (const t in e)
            if ('amd' !== t && 'commonjs' !== t && 'root' !== t) {
              const e = { params: { additionalProperty: t } };
              null === a ? (a = [e]) : a.push(e), i++;
              break;
            }
          if (t === i) {
            if (void 0 !== e.amd) {
              let t = e.amd;
              const r = i;
              if (i === r)
                if ('string' == typeof t) {
                  if (o(t) < 1) {
                    const e = { params: { limit: 1 } };
                    null === a ? (a = [e]) : a.push(e), i++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === a ? (a = [e]) : a.push(e), i++;
                }
              var y = r === i;
            } else y = !0;
            if (y) {
              if (void 0 !== e.commonjs) {
                let t = e.commonjs;
                const r = i;
                if (i === r)
                  if ('string' == typeof t) {
                    if (o(t) < 1) {
                      const e = { params: { limit: 1 } };
                      null === a ? (a = [e]) : a.push(e), i++;
                    }
                  } else {
                    const e = { params: { type: 'string' } };
                    null === a ? (a = [e]) : a.push(e), i++;
                  }
                y = r === i;
              } else y = !0;
              if (y)
                if (void 0 !== e.root) {
                  let t = e.root;
                  const r = i,
                    n = i;
                  let s = !1;
                  const l = i;
                  if (i === l)
                    if (Array.isArray(t)) {
                      const e = t.length;
                      for (let r = 0; r < e; r++) {
                        let e = t[r];
                        const n = i;
                        if (i === n)
                          if ('string' == typeof e) {
                            if (o(e) < 1) {
                              const e = { params: { limit: 1 } };
                              null === a ? (a = [e]) : a.push(e), i++;
                            }
                          } else {
                            const e = { params: { type: 'string' } };
                            null === a ? (a = [e]) : a.push(e), i++;
                          }
                        if (n !== i) break;
                      }
                    } else {
                      const e = { params: { type: 'array' } };
                      null === a ? (a = [e]) : a.push(e), i++;
                    }
                  var c = l === i;
                  if (((s = s || c), !s)) {
                    const e = i;
                    if (i === e)
                      if ('string' == typeof t) {
                        if (o(t) < 1) {
                          const e = { params: { limit: 1 } };
                          null === a ? (a = [e]) : a.push(e), i++;
                        }
                      } else {
                        const e = { params: { type: 'string' } };
                        null === a ? (a = [e]) : a.push(e), i++;
                      }
                    (c = e === i), (s = s || c);
                  }
                  if (s)
                    (i = n), null !== a && (n ? (a.length = n) : (a = null));
                  else {
                    const e = { params: {} };
                    null === a ? (a = [e]) : a.push(e), i++;
                  }
                  y = r === i;
                } else y = !0;
            }
          }
        } else {
          const e = { params: { type: 'object' } };
          null === a ? (a = [e]) : a.push(e), i++;
        }
      (m = t === i), (p = p || m);
    }
  }
  if (!p) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), i++, (u.errors = a), !1;
  }
  return (
    (i = l),
    null !== a && (l ? (a.length = l) : (a = null)),
    (u.errors = a),
    0 === i
  );
}
function y(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (y.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.type && (r = 'type'))
        return (y.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = i;
        for (const t in e)
          if (
            'amdContainer' !== t &&
            'auxiliaryComment' !== t &&
            'export' !== t &&
            'name' !== t &&
            'type' !== t &&
            'umdNamedDefine' !== t
          )
            return (y.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === i) {
          if (void 0 !== e.amdContainer) {
            let t = e.amdContainer;
            const r = i;
            if (i == i) {
              if ('string' != typeof t)
                return (y.errors = [{ params: { type: 'string' } }]), !1;
              if (o(t) < 1) return (y.errors = [{ params: { limit: 1 } }]), !1;
            }
            var l = r === i;
          } else l = !0;
          if (l) {
            if (void 0 !== e.auxiliaryComment) {
              const r = i;
              m(e.auxiliaryComment, {
                instancePath: t + '/auxiliaryComment',
                parentData: e,
                parentDataProperty: 'auxiliaryComment',
                rootData: s,
              }) ||
                ((a = null === a ? m.errors : a.concat(m.errors)),
                (i = a.length)),
                (l = r === i);
            } else l = !0;
            if (l) {
              if (void 0 !== e.export) {
                let t = e.export;
                const r = i,
                  n = i;
                let s = !1;
                const f = i;
                if (i === f)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let r = 0; r < e; r++) {
                      let e = t[r];
                      const n = i;
                      if (i === n)
                        if ('string' == typeof e) {
                          if (o(e) < 1) {
                            const e = { params: { limit: 1 } };
                            null === a ? (a = [e]) : a.push(e), i++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === a ? (a = [e]) : a.push(e), i++;
                        }
                      if (n !== i) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === a ? (a = [e]) : a.push(e), i++;
                  }
                var p = f === i;
                if (((s = s || p), !s)) {
                  const e = i;
                  if (i === e)
                    if ('string' == typeof t) {
                      if (o(t) < 1) {
                        const e = { params: { limit: 1 } };
                        null === a ? (a = [e]) : a.push(e), i++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === a ? (a = [e]) : a.push(e), i++;
                    }
                  (p = e === i), (s = s || p);
                }
                if (!s) {
                  const e = { params: {} };
                  return (
                    null === a ? (a = [e]) : a.push(e), i++, (y.errors = a), !1
                  );
                }
                (i = n),
                  null !== a && (n ? (a.length = n) : (a = null)),
                  (l = r === i);
              } else l = !0;
              if (l) {
                if (void 0 !== e.name) {
                  const r = i;
                  u(e.name, {
                    instancePath: t + '/name',
                    parentData: e,
                    parentDataProperty: 'name',
                    rootData: s,
                  }) ||
                    ((a = null === a ? u.errors : a.concat(u.errors)),
                    (i = a.length)),
                    (l = r === i);
                } else l = !0;
                if (l) {
                  if (void 0 !== e.type) {
                    let t = e.type;
                    const r = i,
                      n = i;
                    let s = !1;
                    const o = i;
                    if (
                      'var' !== t &&
                      'module' !== t &&
                      'assign' !== t &&
                      'assign-properties' !== t &&
                      'this' !== t &&
                      'window' !== t &&
                      'self' !== t &&
                      'global' !== t &&
                      'commonjs' !== t &&
                      'commonjs2' !== t &&
                      'commonjs-module' !== t &&
                      'commonjs-static' !== t &&
                      'amd' !== t &&
                      'amd-require' !== t &&
                      'umd' !== t &&
                      'umd2' !== t &&
                      'jsonp' !== t &&
                      'system' !== t
                    ) {
                      const e = { params: { allowedValues: f.anyOf[0].enum } };
                      null === a ? (a = [e]) : a.push(e), i++;
                    }
                    var c = o === i;
                    if (((s = s || c), !s)) {
                      const e = i;
                      if ('string' != typeof t) {
                        const e = { params: { type: 'string' } };
                        null === a ? (a = [e]) : a.push(e), i++;
                      }
                      (c = e === i), (s = s || c);
                    }
                    if (!s) {
                      const e = { params: {} };
                      return (
                        null === a ? (a = [e]) : a.push(e),
                        i++,
                        (y.errors = a),
                        !1
                      );
                    }
                    (i = n),
                      null !== a && (n ? (a.length = n) : (a = null)),
                      (l = r === i);
                  } else l = !0;
                  if (l)
                    if (void 0 !== e.umdNamedDefine) {
                      const t = i;
                      if ('boolean' != typeof e.umdNamedDefine)
                        return (
                          (y.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      l = t === i;
                    } else l = !0;
                }
              }
            }
          }
        }
      }
    }
  }
  return (y.errors = a), 0 === i;
}
function c(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  if (!Array.isArray(e))
    return (c.errors = [{ params: { type: 'array' } }]), !1;
  {
    const t = e.length;
    for (let r = 0; r < t; r++) {
      let t = e[r];
      const n = 0;
      if ('string' != typeof t)
        return (c.errors = [{ params: { type: 'string' } }]), !1;
      if (o(t) < 1) return (c.errors = [{ params: { limit: 1 } }]), !1;
      if (0 !== n) break;
    }
  }
  return (c.errors = null), !0;
}
function d(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (d.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.external && (r = 'external'))
        return (d.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = i;
        for (const t in e)
          if ('external' !== t && 'shareScope' !== t)
            return (d.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === i) {
          if (void 0 !== e.external) {
            let r = e.external;
            const n = i,
              f = i;
            let m = !1;
            const u = i;
            if (i == i)
              if ('string' == typeof r) {
                if (o(r) < 1) {
                  const e = { params: { limit: 1 } };
                  null === a ? (a = [e]) : a.push(e), i++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === a ? (a = [e]) : a.push(e), i++;
              }
            var l = u === i;
            if (((m = m || l), !m)) {
              const n = i;
              c(r, {
                instancePath: t + '/external',
                parentData: e,
                parentDataProperty: 'external',
                rootData: s,
              }) ||
                ((a = null === a ? c.errors : a.concat(c.errors)),
                (i = a.length)),
                (l = n === i),
                (m = m || l);
            }
            if (!m) {
              const e = { params: {} };
              return (
                null === a ? (a = [e]) : a.push(e), i++, (d.errors = a), !1
              );
            }
            (i = f), null !== a && (f ? (a.length = f) : (a = null));
            var p = n === i;
          } else p = !0;
          if (p)
            if (void 0 !== e.shareScope) {
              let t = e.shareScope;
              const r = i;
              if (i === r) {
                if ('string' != typeof t)
                  return (d.errors = [{ params: { type: 'string' } }]), !1;
                if (o(t) < 1)
                  return (d.errors = [{ params: { limit: 1 } }]), !1;
              }
              p = r === i;
            } else p = !0;
        }
      }
    }
  }
  return (d.errors = a), 0 === i;
}
function g(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (g.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let n = e[r];
      const p = i,
        f = i;
      let m = !1;
      const u = i;
      d(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((a = null === a ? d.errors : a.concat(d.errors)), (i = a.length));
      var l = u === i;
      if (((m = m || l), !m)) {
        const p = i;
        if (i == i)
          if ('string' == typeof n) {
            if (o(n) < 1) {
              const e = { params: { limit: 1 } };
              null === a ? (a = [e]) : a.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), i++;
          }
        if (((l = p === i), (m = m || l), !m)) {
          const o = i;
          c(n, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: s,
          }) ||
            ((a = null === a ? c.errors : a.concat(c.errors)), (i = a.length)),
            (l = o === i),
            (m = m || l);
        }
      }
      if (!m) {
        const e = { params: {} };
        return null === a ? (a = [e]) : a.push(e), i++, (g.errors = a), !1;
      }
      if (((i = f), null !== a && (f ? (a.length = f) : (a = null)), p !== i))
        break;
    }
  }
  return (g.errors = a), 0 === i;
}
function h(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    i = 0;
  const l = i;
  let p = !1;
  const f = i;
  if (i === f)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const l = i,
          p = i;
        let f = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof r) {
            if (o(r) < 1) {
              const e = { params: { limit: 1 } };
              null === a ? (a = [e]) : a.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), i++;
          }
        var m = u === i;
        if (((f = f || m), !f)) {
          const o = i;
          g(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((a = null === a ? g.errors : a.concat(g.errors)), (i = a.length)),
            (m = o === i),
            (f = f || m);
        }
        if (f) (i = p), null !== a && (p ? (a.length = p) : (a = null));
        else {
          const e = { params: {} };
          null === a ? (a = [e]) : a.push(e), i++;
        }
        if (l !== i) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === a ? (a = [e]) : a.push(e), i++;
    }
  var u = f === i;
  if (((p = p || u), !p)) {
    const o = i;
    g(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((a = null === a ? g.errors : a.concat(g.errors)), (i = a.length)),
      (u = o === i),
      (p = p || u);
  }
  if (!p) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), i++, (h.errors = a), !1;
  }
  return (
    (i = l),
    null !== a && (l ? (a.length = l) : (a = null)),
    (h.errors = a),
    0 === i
  );
}
const b = {
  type: 'object',
  additionalProperties: !1,
  properties: {
    eager: { type: 'boolean' },
    import: { anyOf: [{ enum: [!1] }, { $ref: '#/definitions/SharedItem' }] },
    packageName: { type: 'string', minLength: 1 },
    requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
    shareKey: { type: 'string', minLength: 1 },
    shareScope: { type: 'string', minLength: 1 },
    shareStrategy: { enum: ['version-first', 'loaded-first'] },
    singleton: { type: 'boolean' },
    strictVersion: { type: 'boolean' },
    version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
  },
};
function v(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: a = e,
  } = {},
) {
  let i = null,
    l = 0;
  if (0 === l) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (v.errors = [{ params: { type: 'object' } }]), !1;
    {
      const t = l;
      for (const t in e)
        if (!s.call(b.properties, t))
          return (v.errors = [{ params: { additionalProperty: t } }]), !1;
      if (t === l) {
        if (void 0 !== e.eager) {
          const t = l;
          if ('boolean' != typeof e.eager)
            return (v.errors = [{ params: { type: 'boolean' } }]), !1;
          var p = t === l;
        } else p = !0;
        if (p) {
          if (void 0 !== e.import) {
            let t = e.import;
            const r = l,
              n = l;
            let s = !1;
            const a = l;
            if (!1 !== t) {
              const e = {
                params: { allowedValues: b.properties.import.anyOf[0].enum },
              };
              null === i ? (i = [e]) : i.push(e), l++;
            }
            var f = a === l;
            if (((s = s || f), !s)) {
              const e = l;
              if (l == l)
                if ('string' == typeof t) {
                  if (o(t) < 1) {
                    const e = { params: { limit: 1 } };
                    null === i ? (i = [e]) : i.push(e), l++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === i ? (i = [e]) : i.push(e), l++;
                }
              (f = e === l), (s = s || f);
            }
            if (!s) {
              const e = { params: {} };
              return (
                null === i ? (i = [e]) : i.push(e), l++, (v.errors = i), !1
              );
            }
            (l = n),
              null !== i && (n ? (i.length = n) : (i = null)),
              (p = r === l);
          } else p = !0;
          if (p) {
            if (void 0 !== e.packageName) {
              let t = e.packageName;
              const r = l;
              if (l === r) {
                if ('string' != typeof t)
                  return (v.errors = [{ params: { type: 'string' } }]), !1;
                if (o(t) < 1)
                  return (v.errors = [{ params: { limit: 1 } }]), !1;
              }
              p = r === l;
            } else p = !0;
            if (p) {
              if (void 0 !== e.requiredVersion) {
                let t = e.requiredVersion;
                const r = l,
                  n = l;
                let s = !1;
                const o = l;
                if (!1 !== t) {
                  const e = {
                    params: {
                      allowedValues: b.properties.requiredVersion.anyOf[0].enum,
                    },
                  };
                  null === i ? (i = [e]) : i.push(e), l++;
                }
                var m = o === l;
                if (((s = s || m), !s)) {
                  const e = l;
                  if ('string' != typeof t) {
                    const e = { params: { type: 'string' } };
                    null === i ? (i = [e]) : i.push(e), l++;
                  }
                  (m = e === l), (s = s || m);
                }
                if (!s) {
                  const e = { params: {} };
                  return (
                    null === i ? (i = [e]) : i.push(e), l++, (v.errors = i), !1
                  );
                }
                (l = n),
                  null !== i && (n ? (i.length = n) : (i = null)),
                  (p = r === l);
              } else p = !0;
              if (p) {
                if (void 0 !== e.shareKey) {
                  let t = e.shareKey;
                  const r = l;
                  if (l === r) {
                    if ('string' != typeof t)
                      return (v.errors = [{ params: { type: 'string' } }]), !1;
                    if (o(t) < 1)
                      return (v.errors = [{ params: { limit: 1 } }]), !1;
                  }
                  p = r === l;
                } else p = !0;
                if (p) {
                  if (void 0 !== e.shareScope) {
                    let t = e.shareScope;
                    const r = l;
                    if (l === r) {
                      if ('string' != typeof t)
                        return (
                          (v.errors = [{ params: { type: 'string' } }]), !1
                        );
                      if (o(t) < 1)
                        return (v.errors = [{ params: { limit: 1 } }]), !1;
                    }
                    p = r === l;
                  } else p = !0;
                  if (p) {
                    if (void 0 !== e.shareStrategy) {
                      let t = e.shareStrategy;
                      const r = l;
                      if ('version-first' !== t && 'loaded-first' !== t)
                        return (
                          (v.errors = [
                            {
                              params: {
                                allowedValues: b.properties.shareStrategy.enum,
                              },
                            },
                          ]),
                          !1
                        );
                      p = r === l;
                    } else p = !0;
                    if (p) {
                      if (void 0 !== e.singleton) {
                        const t = l;
                        if ('boolean' != typeof e.singleton)
                          return (
                            (v.errors = [{ params: { type: 'boolean' } }]), !1
                          );
                        p = t === l;
                      } else p = !0;
                      if (p) {
                        if (void 0 !== e.strictVersion) {
                          const t = l;
                          if ('boolean' != typeof e.strictVersion)
                            return (
                              (v.errors = [{ params: { type: 'boolean' } }]), !1
                            );
                          p = t === l;
                        } else p = !0;
                        if (p)
                          if (void 0 !== e.version) {
                            let t = e.version;
                            const r = l,
                              n = l;
                            let s = !1;
                            const o = l;
                            if (!1 !== t) {
                              const e = {
                                params: {
                                  allowedValues:
                                    b.properties.version.anyOf[0].enum,
                                },
                              };
                              null === i ? (i = [e]) : i.push(e), l++;
                            }
                            var u = o === l;
                            if (((s = s || u), !s)) {
                              const e = l;
                              if ('string' != typeof t) {
                                const e = { params: { type: 'string' } };
                                null === i ? (i = [e]) : i.push(e), l++;
                              }
                              (u = e === l), (s = s || u);
                            }
                            if (!s) {
                              const e = { params: {} };
                              return (
                                null === i ? (i = [e]) : i.push(e),
                                l++,
                                (v.errors = i),
                                !1
                              );
                            }
                            (l = n),
                              null !== i && (n ? (i.length = n) : (i = null)),
                              (p = r === l);
                          } else p = !0;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return (v.errors = i), 0 === l;
}
function P(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (P.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let n = e[r];
      const p = i,
        f = i;
      let m = !1;
      const u = i;
      v(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((a = null === a ? v.errors : a.concat(v.errors)), (i = a.length));
      var l = u === i;
      if (((m = m || l), !m)) {
        const e = i;
        if (i == i)
          if ('string' == typeof n) {
            if (o(n) < 1) {
              const e = { params: { limit: 1 } };
              null === a ? (a = [e]) : a.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), i++;
          }
        (l = e === i), (m = m || l);
      }
      if (!m) {
        const e = { params: {} };
        return null === a ? (a = [e]) : a.push(e), i++, (P.errors = a), !1;
      }
      if (((i = f), null !== a && (f ? (a.length = f) : (a = null)), p !== i))
        break;
    }
  }
  return (P.errors = a), 0 === i;
}
function j(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    i = 0;
  const l = i;
  let p = !1;
  const f = i;
  if (i === f)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const l = i,
          p = i;
        let f = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof r) {
            if (o(r) < 1) {
              const e = { params: { limit: 1 } };
              null === a ? (a = [e]) : a.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), i++;
          }
        var m = u === i;
        if (((f = f || m), !f)) {
          const o = i;
          P(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((a = null === a ? P.errors : a.concat(P.errors)), (i = a.length)),
            (m = o === i),
            (f = f || m);
        }
        if (f) (i = p), null !== a && (p ? (a.length = p) : (a = null));
        else {
          const e = { params: {} };
          null === a ? (a = [e]) : a.push(e), i++;
        }
        if (l !== i) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === a ? (a = [e]) : a.push(e), i++;
    }
  var u = f === i;
  if (((p = p || u), !p)) {
    const o = i;
    P(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((a = null === a ? P.errors : a.concat(P.errors)), (i = a.length)),
      (u = o === i),
      (p = p || u);
  }
  if (!p) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), i++, (j.errors = a), !1;
  }
  return (
    (i = l),
    null !== a && (l ? (a.length = l) : (a = null)),
    (j.errors = a),
    0 === i
  );
}
function D(
  a,
  {
    instancePath: i = '',
    parentData: l,
    parentDataProperty: f,
    rootData: m = a,
  } = {},
) {
  let u = null,
    c = 0;
  if (0 === c) {
    if (!a || 'object' != typeof a || Array.isArray(a))
      return (D.errors = [{ params: { type: 'object' } }]), !1;
    {
      const l = c;
      for (const e in a)
        if (!s.call(t.properties, e))
          return (D.errors = [{ params: { additionalProperty: e } }]), !1;
      if (l === c) {
        if (void 0 !== a.dataPrefetch) {
          const e = c;
          if ('boolean' != typeof a.dataPrefetch)
            return (D.errors = [{ params: { type: 'boolean' } }]), !1;
          var d = e === c;
        } else d = !0;
        if (d) {
          if (void 0 !== a.exposes) {
            const e = c;
            p(a.exposes, {
              instancePath: i + '/exposes',
              parentData: a,
              parentDataProperty: 'exposes',
              rootData: m,
            }) ||
              ((u = null === u ? p.errors : u.concat(p.errors)),
              (c = u.length)),
              (d = e === c);
          } else d = !0;
          if (d) {
            if (void 0 !== a.filename) {
              let t = a.filename;
              const r = c;
              if (c === r) {
                if ('string' != typeof t)
                  return (D.errors = [{ params: { type: 'string' } }]), !1;
                if (t.includes('!') || !1 !== e.test(t))
                  return (D.errors = [{ params: {} }]), !1;
              }
              d = r === c;
            } else d = !0;
            if (d) {
              if (void 0 !== a.getPublicPath) {
                const e = c;
                if ('string' != typeof a.getPublicPath)
                  return (D.errors = [{ params: { type: 'string' } }]), !1;
                d = e === c;
              } else d = !0;
              if (d) {
                if (void 0 !== a.implementation) {
                  const e = c;
                  if ('string' != typeof a.implementation)
                    return (D.errors = [{ params: { type: 'string' } }]), !1;
                  d = e === c;
                } else d = !0;
                if (d) {
                  if (void 0 !== a.library) {
                    const e = c;
                    y(a.library, {
                      instancePath: i + '/library',
                      parentData: a,
                      parentDataProperty: 'library',
                      rootData: m,
                    }) ||
                      ((u = null === u ? y.errors : u.concat(y.errors)),
                      (c = u.length)),
                      (d = e === c);
                  } else d = !0;
                  if (d) {
                    if (void 0 !== a.manifest) {
                      let e = a.manifest;
                      const t = c,
                        r = c;
                      let n = !1;
                      const s = c;
                      if ('boolean' != typeof e) {
                        const e = { params: { type: 'boolean' } };
                        null === u ? (u = [e]) : u.push(e), c++;
                      }
                      var g = s === c;
                      if (((n = n || g), !n)) {
                        const t = c;
                        if (c === t)
                          if (e && 'object' == typeof e && !Array.isArray(e)) {
                            if (void 0 !== e.filePath) {
                              const t = c;
                              if ('string' != typeof e.filePath) {
                                const e = { params: { type: 'string' } };
                                null === u ? (u = [e]) : u.push(e), c++;
                              }
                              var b = t === c;
                            } else b = !0;
                            if (b) {
                              if (void 0 !== e.disableAssetsAnalyze) {
                                const t = c;
                                if (
                                  'boolean' != typeof e.disableAssetsAnalyze
                                ) {
                                  const e = { params: { type: 'boolean' } };
                                  null === u ? (u = [e]) : u.push(e), c++;
                                }
                                b = t === c;
                              } else b = !0;
                              if (b) {
                                if (void 0 !== e.fileName) {
                                  const t = c;
                                  if ('string' != typeof e.fileName) {
                                    const e = { params: { type: 'string' } };
                                    null === u ? (u = [e]) : u.push(e), c++;
                                  }
                                  b = t === c;
                                } else b = !0;
                                if (b)
                                  if (void 0 !== e.additionalData) {
                                    const t = c;
                                    if ('string' != typeof e.additionalData) {
                                      const e = { params: { type: 'string' } };
                                      null === u ? (u = [e]) : u.push(e), c++;
                                    }
                                    b = t === c;
                                  } else b = !0;
                              }
                            }
                          } else {
                            const e = { params: { type: 'object' } };
                            null === u ? (u = [e]) : u.push(e), c++;
                          }
                        (g = t === c), (n = n || g);
                      }
                      if (!n) {
                        const e = { params: {} };
                        return (
                          null === u ? (u = [e]) : u.push(e),
                          c++,
                          (D.errors = u),
                          !1
                        );
                      }
                      (c = r),
                        null !== u && (r ? (u.length = r) : (u = null)),
                        (d = t === c);
                    } else d = !0;
                    if (d) {
                      if (void 0 !== a.name) {
                        const e = c;
                        if ('string' != typeof a.name)
                          return (
                            (D.errors = [{ params: { type: 'string' } }]), !1
                          );
                        d = e === c;
                      } else d = !0;
                      if (d) {
                        if (void 0 !== a.remoteType) {
                          let e = a.remoteType;
                          const t = c,
                            n = c;
                          let s = !1,
                            o = null;
                          const i = c;
                          if (
                            'var' !== e &&
                            'module' !== e &&
                            'assign' !== e &&
                            'this' !== e &&
                            'window' !== e &&
                            'self' !== e &&
                            'global' !== e &&
                            'commonjs' !== e &&
                            'commonjs2' !== e &&
                            'commonjs-module' !== e &&
                            'commonjs-static' !== e &&
                            'amd' !== e &&
                            'amd-require' !== e &&
                            'umd' !== e &&
                            'umd2' !== e &&
                            'jsonp' !== e &&
                            'system' !== e &&
                            'promise' !== e &&
                            'import' !== e &&
                            'script' !== e &&
                            'module-import' !== e &&
                            'node-commonjs' !== e
                          ) {
                            const e = { params: { allowedValues: r.enum } };
                            null === u ? (u = [e]) : u.push(e), c++;
                          }
                          if ((i === c && ((s = !0), (o = 0)), !s)) {
                            const e = { params: { passingSchemas: o } };
                            return (
                              null === u ? (u = [e]) : u.push(e),
                              c++,
                              (D.errors = u),
                              !1
                            );
                          }
                          (c = n),
                            null !== u && (n ? (u.length = n) : (u = null)),
                            (d = t === c);
                        } else d = !0;
                        if (d) {
                          if (void 0 !== a.remotes) {
                            const e = c;
                            h(a.remotes, {
                              instancePath: i + '/remotes',
                              parentData: a,
                              parentDataProperty: 'remotes',
                              rootData: m,
                            }) ||
                              ((u = null === u ? h.errors : u.concat(h.errors)),
                              (c = u.length)),
                              (d = e === c);
                          } else d = !0;
                          if (d) {
                            if (void 0 !== a.runtime) {
                              let e = a.runtime;
                              const t = c,
                                r = c;
                              let s = !1;
                              const i = c;
                              if (!1 !== e) {
                                const e = {
                                  params: { allowedValues: n.anyOf[0].enum },
                                };
                                null === u ? (u = [e]) : u.push(e), c++;
                              }
                              var v = i === c;
                              if (((s = s || v), !s)) {
                                const t = c;
                                if (c === t)
                                  if ('string' == typeof e) {
                                    if (o(e) < 1) {
                                      const e = { params: { limit: 1 } };
                                      null === u ? (u = [e]) : u.push(e), c++;
                                    }
                                  } else {
                                    const e = { params: { type: 'string' } };
                                    null === u ? (u = [e]) : u.push(e), c++;
                                  }
                                (v = t === c), (s = s || v);
                              }
                              if (!s) {
                                const e = { params: {} };
                                return (
                                  null === u ? (u = [e]) : u.push(e),
                                  c++,
                                  (D.errors = u),
                                  !1
                                );
                              }
                              (c = r),
                                null !== u && (r ? (u.length = r) : (u = null)),
                                (d = t === c);
                            } else d = !0;
                            if (d) {
                              if (void 0 !== a.runtimePlugins) {
                                let e = a.runtimePlugins;
                                const t = c;
                                if (c === t) {
                                  if (!Array.isArray(e))
                                    return (
                                      (D.errors = [
                                        { params: { type: 'array' } },
                                      ]),
                                      !1
                                    );
                                  {
                                    const t = e.length;
                                    for (let r = 0; r < t; r++) {
                                      const t = c;
                                      if ('string' != typeof e[r])
                                        return (
                                          (D.errors = [
                                            { params: { type: 'string' } },
                                          ]),
                                          !1
                                        );
                                      if (t !== c) break;
                                    }
                                  }
                                }
                                d = t === c;
                              } else d = !0;
                              if (d) {
                                if (void 0 !== a.shareScope) {
                                  let e = a.shareScope;
                                  const t = c;
                                  if (c === t) {
                                    if ('string' != typeof e)
                                      return (
                                        (D.errors = [
                                          { params: { type: 'string' } },
                                        ]),
                                        !1
                                      );
                                    if (o(e) < 1)
                                      return (
                                        (D.errors = [{ params: { limit: 1 } }]),
                                        !1
                                      );
                                  }
                                  d = t === c;
                                } else d = !0;
                                if (d) {
                                  if (void 0 !== a.shareStrategy) {
                                    let e = a.shareStrategy;
                                    const r = c;
                                    if (
                                      'version-first' !== e &&
                                      'loaded-first' !== e
                                    )
                                      return (
                                        (D.errors = [
                                          {
                                            params: {
                                              allowedValues:
                                                t.properties.shareStrategy.enum,
                                            },
                                          },
                                        ]),
                                        !1
                                      );
                                    d = r === c;
                                  } else d = !0;
                                  if (d) {
                                    if (void 0 !== a.shared) {
                                      const e = c;
                                      j(a.shared, {
                                        instancePath: i + '/shared',
                                        parentData: a,
                                        parentDataProperty: 'shared',
                                        rootData: m,
                                      }) ||
                                        ((u =
                                          null === u
                                            ? j.errors
                                            : u.concat(j.errors)),
                                        (c = u.length)),
                                        (d = e === c);
                                    } else d = !0;
                                    if (d) {
                                      if (void 0 !== a.virtualRuntimeEntry) {
                                        const e = c;
                                        if (
                                          'boolean' !=
                                          typeof a.virtualRuntimeEntry
                                        )
                                          return (
                                            (D.errors = [
                                              { params: { type: 'boolean' } },
                                            ]),
                                            !1
                                          );
                                        d = e === c;
                                      } else d = !0;
                                      if (d) {
                                        if (void 0 !== a.dev) {
                                          let e = a.dev;
                                          const t = c,
                                            r = c;
                                          let n = !1;
                                          const s = c;
                                          if ('boolean' != typeof e) {
                                            const e = {
                                              params: { type: 'boolean' },
                                            };
                                            null === u ? (u = [e]) : u.push(e),
                                              c++;
                                          }
                                          var P = s === c;
                                          if (((n = n || P), !n)) {
                                            const t = c;
                                            if (c === t)
                                              if (
                                                e &&
                                                'object' == typeof e &&
                                                !Array.isArray(e)
                                              ) {
                                                if (
                                                  void 0 !== e.disableLiveReload
                                                ) {
                                                  const t = c;
                                                  if (
                                                    'boolean' !=
                                                    typeof e.disableLiveReload
                                                  ) {
                                                    const e = {
                                                      params: {
                                                        type: 'boolean',
                                                      },
                                                    };
                                                    null === u
                                                      ? (u = [e])
                                                      : u.push(e),
                                                      c++;
                                                  }
                                                  var A = t === c;
                                                } else A = !0;
                                                if (A) {
                                                  if (
                                                    void 0 !==
                                                    e.disableHotTypesReload
                                                  ) {
                                                    const t = c;
                                                    if (
                                                      'boolean' !=
                                                      typeof e.disableHotTypesReload
                                                    ) {
                                                      const e = {
                                                        params: {
                                                          type: 'boolean',
                                                        },
                                                      };
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                        c++;
                                                    }
                                                    A = t === c;
                                                  } else A = !0;
                                                  if (A)
                                                    if (
                                                      void 0 !==
                                                      e.disableDynamicRemoteTypeHints
                                                    ) {
                                                      const t = c;
                                                      if (
                                                        'boolean' !=
                                                        typeof e.disableDynamicRemoteTypeHints
                                                      ) {
                                                        const e = {
                                                          params: {
                                                            type: 'boolean',
                                                          },
                                                        };
                                                        null === u
                                                          ? (u = [e])
                                                          : u.push(e),
                                                          c++;
                                                      }
                                                      A = t === c;
                                                    } else A = !0;
                                                }
                                              } else {
                                                const e = {
                                                  params: { type: 'object' },
                                                };
                                                null === u
                                                  ? (u = [e])
                                                  : u.push(e),
                                                  c++;
                                              }
                                            (P = t === c), (n = n || P);
                                          }
                                          if (!n) {
                                            const e = { params: {} };
                                            return (
                                              null === u
                                                ? (u = [e])
                                                : u.push(e),
                                              c++,
                                              (D.errors = u),
                                              !1
                                            );
                                          }
                                          (c = r),
                                            null !== u &&
                                              (r ? (u.length = r) : (u = null)),
                                            (d = t === c);
                                        } else d = !0;
                                        if (d) {
                                          if (void 0 !== a.dts) {
                                            let e = a.dts;
                                            const r = c,
                                              n = c;
                                            let s = !1;
                                            const o = c;
                                            if ('boolean' != typeof e) {
                                              const e = {
                                                params: { type: 'boolean' },
                                              };
                                              null === u
                                                ? (u = [e])
                                                : u.push(e),
                                                c++;
                                            }
                                            var x = o === c;
                                            if (((s = s || x), !s)) {
                                              const r = c;
                                              if (c === r)
                                                if (
                                                  e &&
                                                  'object' == typeof e &&
                                                  !Array.isArray(e)
                                                ) {
                                                  if (
                                                    void 0 !== e.generateTypes
                                                  ) {
                                                    let r = e.generateTypes;
                                                    const n = c,
                                                      s = c;
                                                    let o = !1;
                                                    const a = c;
                                                    if ('boolean' != typeof r) {
                                                      const e = {
                                                        params: {
                                                          type: 'boolean',
                                                        },
                                                      };
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                        c++;
                                                    }
                                                    var O = a === c;
                                                    if (((o = o || O), !o)) {
                                                      const e = c;
                                                      if (c === e)
                                                        if (
                                                          r &&
                                                          'object' ==
                                                            typeof r &&
                                                          !Array.isArray(r)
                                                        ) {
                                                          if (
                                                            void 0 !==
                                                            r.tsConfigPath
                                                          ) {
                                                            const e = c;
                                                            if (
                                                              'string' !=
                                                              typeof r.tsConfigPath
                                                            ) {
                                                              const e = {
                                                                params: {
                                                                  type: 'string',
                                                                },
                                                              };
                                                              null === u
                                                                ? (u = [e])
                                                                : u.push(e),
                                                                c++;
                                                            }
                                                            var T = e === c;
                                                          } else T = !0;
                                                          if (T) {
                                                            if (
                                                              void 0 !==
                                                              r.typesFolder
                                                            ) {
                                                              const e = c;
                                                              if (
                                                                'string' !=
                                                                typeof r.typesFolder
                                                              ) {
                                                                const e = {
                                                                  params: {
                                                                    type: 'string',
                                                                  },
                                                                };
                                                                null === u
                                                                  ? (u = [e])
                                                                  : u.push(e),
                                                                  c++;
                                                              }
                                                              T = e === c;
                                                            } else T = !0;
                                                            if (T) {
                                                              if (
                                                                void 0 !==
                                                                r.compiledTypesFolder
                                                              ) {
                                                                const e = c;
                                                                if (
                                                                  'string' !=
                                                                  typeof r.compiledTypesFolder
                                                                ) {
                                                                  const e = {
                                                                    params: {
                                                                      type: 'string',
                                                                    },
                                                                  };
                                                                  null === u
                                                                    ? (u = [e])
                                                                    : u.push(e),
                                                                    c++;
                                                                }
                                                                T = e === c;
                                                              } else T = !0;
                                                              if (T) {
                                                                if (
                                                                  void 0 !==
                                                                  r.deleteTypesFolder
                                                                ) {
                                                                  const e = c;
                                                                  if (
                                                                    'boolean' !=
                                                                    typeof r.deleteTypesFolder
                                                                  ) {
                                                                    const e = {
                                                                      params: {
                                                                        type: 'boolean',
                                                                      },
                                                                    };
                                                                    null === u
                                                                      ? (u = [
                                                                          e,
                                                                        ])
                                                                      : u.push(
                                                                          e,
                                                                        ),
                                                                      c++;
                                                                  }
                                                                  T = e === c;
                                                                } else T = !0;
                                                                if (T) {
                                                                  if (
                                                                    void 0 !==
                                                                    r.additionalFilesToCompile
                                                                  ) {
                                                                    let e =
                                                                      r.additionalFilesToCompile;
                                                                    const t = c;
                                                                    if (c === t)
                                                                      if (
                                                                        Array.isArray(
                                                                          e,
                                                                        )
                                                                      ) {
                                                                        const t =
                                                                          e.length;
                                                                        for (
                                                                          let r = 0;
                                                                          r < t;
                                                                          r++
                                                                        ) {
                                                                          const t =
                                                                            c;
                                                                          if (
                                                                            'string' !=
                                                                            typeof e[
                                                                              r
                                                                            ]
                                                                          ) {
                                                                            const e =
                                                                              {
                                                                                params:
                                                                                  {
                                                                                    type: 'string',
                                                                                  },
                                                                              };
                                                                            null ===
                                                                            u
                                                                              ? (u =
                                                                                  [
                                                                                    e,
                                                                                  ])
                                                                              : u.push(
                                                                                  e,
                                                                                ),
                                                                              c++;
                                                                          }
                                                                          if (
                                                                            t !==
                                                                            c
                                                                          )
                                                                            break;
                                                                        }
                                                                      } else {
                                                                        const e =
                                                                          {
                                                                            params:
                                                                              {
                                                                                type: 'array',
                                                                              },
                                                                          };
                                                                        null ===
                                                                        u
                                                                          ? (u =
                                                                              [
                                                                                e,
                                                                              ])
                                                                          : u.push(
                                                                              e,
                                                                            ),
                                                                          c++;
                                                                      }
                                                                    T = t === c;
                                                                  } else T = !0;
                                                                  if (T) {
                                                                    if (
                                                                      void 0 !==
                                                                      r.compileInChildProcess
                                                                    ) {
                                                                      const e =
                                                                        c;
                                                                      if (
                                                                        'boolean' !=
                                                                        typeof r.compileInChildProcess
                                                                      ) {
                                                                        const e =
                                                                          {
                                                                            params:
                                                                              {
                                                                                type: 'boolean',
                                                                              },
                                                                          };
                                                                        null ===
                                                                        u
                                                                          ? (u =
                                                                              [
                                                                                e,
                                                                              ])
                                                                          : u.push(
                                                                              e,
                                                                            ),
                                                                          c++;
                                                                      }
                                                                      T =
                                                                        e === c;
                                                                    } else
                                                                      T = !0;
                                                                    if (T) {
                                                                      if (
                                                                        void 0 !==
                                                                        r.compilerInstance
                                                                      ) {
                                                                        let e =
                                                                          r.compilerInstance;
                                                                        const n =
                                                                          c;
                                                                        if (
                                                                          'tsc' !==
                                                                            e &&
                                                                          'vue-tsc' !==
                                                                            e
                                                                        ) {
                                                                          const e =
                                                                            {
                                                                              params:
                                                                                {
                                                                                  allowedValues:
                                                                                    t
                                                                                      .properties
                                                                                      .dts
                                                                                      .anyOf[1]
                                                                                      .properties
                                                                                      .generateTypes
                                                                                      .anyOf[1]
                                                                                      .properties
                                                                                      .compilerInstance
                                                                                      .enum,
                                                                                },
                                                                            };
                                                                          null ===
                                                                          u
                                                                            ? (u =
                                                                                [
                                                                                  e,
                                                                                ])
                                                                            : u.push(
                                                                                e,
                                                                              ),
                                                                            c++;
                                                                        }
                                                                        T =
                                                                          n ===
                                                                          c;
                                                                      } else
                                                                        T = !0;
                                                                      if (T) {
                                                                        if (
                                                                          void 0 !==
                                                                          r.generateAPITypes
                                                                        ) {
                                                                          const e =
                                                                            c;
                                                                          if (
                                                                            'boolean' !=
                                                                            typeof r.generateAPITypes
                                                                          ) {
                                                                            const e =
                                                                              {
                                                                                params:
                                                                                  {
                                                                                    type: 'boolean',
                                                                                  },
                                                                              };
                                                                            null ===
                                                                            u
                                                                              ? (u =
                                                                                  [
                                                                                    e,
                                                                                  ])
                                                                              : u.push(
                                                                                  e,
                                                                                ),
                                                                              c++;
                                                                          }
                                                                          T =
                                                                            e ===
                                                                            c;
                                                                        } else
                                                                          T =
                                                                            !0;
                                                                        if (T) {
                                                                          if (
                                                                            void 0 !==
                                                                            r.extractThirdParty
                                                                          ) {
                                                                            const e =
                                                                              c;
                                                                            if (
                                                                              'boolean' !=
                                                                              typeof r.extractThirdParty
                                                                            ) {
                                                                              const e =
                                                                                {
                                                                                  params:
                                                                                    {
                                                                                      type: 'boolean',
                                                                                    },
                                                                                };
                                                                              null ===
                                                                              u
                                                                                ? (u =
                                                                                    [
                                                                                      e,
                                                                                    ])
                                                                                : u.push(
                                                                                    e,
                                                                                  ),
                                                                                c++;
                                                                            }
                                                                            T =
                                                                              e ===
                                                                              c;
                                                                          } else
                                                                            T =
                                                                              !0;
                                                                          if (
                                                                            T
                                                                          ) {
                                                                            if (
                                                                              void 0 !==
                                                                              r.extractRemoteTypes
                                                                            ) {
                                                                              const e =
                                                                                c;
                                                                              if (
                                                                                'boolean' !=
                                                                                typeof r.extractRemoteTypes
                                                                              ) {
                                                                                const e =
                                                                                  {
                                                                                    params:
                                                                                      {
                                                                                        type: 'boolean',
                                                                                      },
                                                                                  };
                                                                                null ===
                                                                                u
                                                                                  ? (u =
                                                                                      [
                                                                                        e,
                                                                                      ])
                                                                                  : u.push(
                                                                                      e,
                                                                                    ),
                                                                                  c++;
                                                                              }
                                                                              T =
                                                                                e ===
                                                                                c;
                                                                            } else
                                                                              T =
                                                                                !0;
                                                                            if (
                                                                              T
                                                                            )
                                                                              if (
                                                                                void 0 !==
                                                                                r.abortOnError
                                                                              ) {
                                                                                const e =
                                                                                  c;
                                                                                if (
                                                                                  'boolean' !=
                                                                                  typeof r.abortOnError
                                                                                ) {
                                                                                  const e =
                                                                                    {
                                                                                      params:
                                                                                        {
                                                                                          type: 'boolean',
                                                                                        },
                                                                                    };
                                                                                  null ===
                                                                                  u
                                                                                    ? (u =
                                                                                        [
                                                                                          e,
                                                                                        ])
                                                                                    : u.push(
                                                                                        e,
                                                                                      ),
                                                                                    c++;
                                                                                }
                                                                                T =
                                                                                  e ===
                                                                                  c;
                                                                              } else
                                                                                T =
                                                                                  !0;
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        } else {
                                                          const e = {
                                                            params: {
                                                              type: 'object',
                                                            },
                                                          };
                                                          null === u
                                                            ? (u = [e])
                                                            : u.push(e),
                                                            c++;
                                                        }
                                                      (O = e === c),
                                                        (o = o || O);
                                                    }
                                                    if (o)
                                                      (c = s),
                                                        null !== u &&
                                                          (s
                                                            ? (u.length = s)
                                                            : (u = null));
                                                    else {
                                                      const e = { params: {} };
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                        c++;
                                                    }
                                                    var R = n === c;
                                                  } else R = !0;
                                                  if (R) {
                                                    if (
                                                      void 0 !== e.consumeTypes
                                                    ) {
                                                      let t = e.consumeTypes;
                                                      const r = c,
                                                        n = c;
                                                      let s = !1;
                                                      const o = c;
                                                      if (
                                                        'boolean' != typeof t
                                                      ) {
                                                        const e = {
                                                          params: {
                                                            type: 'boolean',
                                                          },
                                                        };
                                                        null === u
                                                          ? (u = [e])
                                                          : u.push(e),
                                                          c++;
                                                      }
                                                      var $ = o === c;
                                                      if (((s = s || $), !s)) {
                                                        const e = c;
                                                        if (c === e)
                                                          if (
                                                            t &&
                                                            'object' ==
                                                              typeof t &&
                                                            !Array.isArray(t)
                                                          ) {
                                                            if (
                                                              void 0 !==
                                                              t.typesFolder
                                                            ) {
                                                              const e = c;
                                                              if (
                                                                'string' !=
                                                                typeof t.typesFolder
                                                              ) {
                                                                const e = {
                                                                  params: {
                                                                    type: 'string',
                                                                  },
                                                                };
                                                                null === u
                                                                  ? (u = [e])
                                                                  : u.push(e),
                                                                  c++;
                                                              }
                                                              var C = e === c;
                                                            } else C = !0;
                                                            if (C) {
                                                              if (
                                                                void 0 !==
                                                                t.abortOnError
                                                              ) {
                                                                const e = c;
                                                                if (
                                                                  'boolean' !=
                                                                  typeof t.abortOnError
                                                                ) {
                                                                  const e = {
                                                                    params: {
                                                                      type: 'boolean',
                                                                    },
                                                                  };
                                                                  null === u
                                                                    ? (u = [e])
                                                                    : u.push(e),
                                                                    c++;
                                                                }
                                                                C = e === c;
                                                              } else C = !0;
                                                              if (C) {
                                                                if (
                                                                  void 0 !==
                                                                  t.remoteTypesFolder
                                                                ) {
                                                                  const e = c;
                                                                  if (
                                                                    'string' !=
                                                                    typeof t.remoteTypesFolder
                                                                  ) {
                                                                    const e = {
                                                                      params: {
                                                                        type: 'string',
                                                                      },
                                                                    };
                                                                    null === u
                                                                      ? (u = [
                                                                          e,
                                                                        ])
                                                                      : u.push(
                                                                          e,
                                                                        ),
                                                                      c++;
                                                                  }
                                                                  C = e === c;
                                                                } else C = !0;
                                                                if (C) {
                                                                  if (
                                                                    void 0 !==
                                                                    t.deleteTypesFolder
                                                                  ) {
                                                                    const e = c;
                                                                    if (
                                                                      'boolean' !=
                                                                      typeof t.deleteTypesFolder
                                                                    ) {
                                                                      const e =
                                                                        {
                                                                          params:
                                                                            {
                                                                              type: 'boolean',
                                                                            },
                                                                        };
                                                                      null === u
                                                                        ? (u = [
                                                                            e,
                                                                          ])
                                                                        : u.push(
                                                                            e,
                                                                          ),
                                                                        c++;
                                                                    }
                                                                    C = e === c;
                                                                  } else C = !0;
                                                                  if (C) {
                                                                    if (
                                                                      void 0 !==
                                                                      t.maxRetries
                                                                    ) {
                                                                      const e =
                                                                        c;
                                                                      if (
                                                                        'number' !=
                                                                        typeof t.maxRetries
                                                                      ) {
                                                                        const e =
                                                                          {
                                                                            params:
                                                                              {
                                                                                type: 'number',
                                                                              },
                                                                          };
                                                                        null ===
                                                                        u
                                                                          ? (u =
                                                                              [
                                                                                e,
                                                                              ])
                                                                          : u.push(
                                                                              e,
                                                                            ),
                                                                          c++;
                                                                      }
                                                                      C =
                                                                        e === c;
                                                                    } else
                                                                      C = !0;
                                                                    if (C) {
                                                                      if (
                                                                        void 0 !==
                                                                        t.consumeAPITypes
                                                                      ) {
                                                                        const e =
                                                                          c;
                                                                        if (
                                                                          'boolean' !=
                                                                          typeof t.consumeAPITypes
                                                                        ) {
                                                                          const e =
                                                                            {
                                                                              params:
                                                                                {
                                                                                  type: 'boolean',
                                                                                },
                                                                            };
                                                                          null ===
                                                                          u
                                                                            ? (u =
                                                                                [
                                                                                  e,
                                                                                ])
                                                                            : u.push(
                                                                                e,
                                                                              ),
                                                                            c++;
                                                                        }
                                                                        C =
                                                                          e ===
                                                                          c;
                                                                      } else
                                                                        C = !0;
                                                                      if (C)
                                                                        if (
                                                                          void 0 !==
                                                                          t.runtimePkgs
                                                                        ) {
                                                                          let e =
                                                                            t.runtimePkgs;
                                                                          const r =
                                                                            c;
                                                                          if (
                                                                            c ===
                                                                            r
                                                                          )
                                                                            if (
                                                                              Array.isArray(
                                                                                e,
                                                                              )
                                                                            ) {
                                                                              const t =
                                                                                e.length;
                                                                              for (
                                                                                let r = 0;
                                                                                r <
                                                                                t;
                                                                                r++
                                                                              ) {
                                                                                const t =
                                                                                  c;
                                                                                if (
                                                                                  'string' !=
                                                                                  typeof e[
                                                                                    r
                                                                                  ]
                                                                                ) {
                                                                                  const e =
                                                                                    {
                                                                                      params:
                                                                                        {
                                                                                          type: 'string',
                                                                                        },
                                                                                    };
                                                                                  null ===
                                                                                  u
                                                                                    ? (u =
                                                                                        [
                                                                                          e,
                                                                                        ])
                                                                                    : u.push(
                                                                                        e,
                                                                                      ),
                                                                                    c++;
                                                                                }
                                                                                if (
                                                                                  t !==
                                                                                  c
                                                                                )
                                                                                  break;
                                                                              }
                                                                            } else {
                                                                              const e =
                                                                                {
                                                                                  params:
                                                                                    {
                                                                                      type: 'array',
                                                                                    },
                                                                                };
                                                                              null ===
                                                                              u
                                                                                ? (u =
                                                                                    [
                                                                                      e,
                                                                                    ])
                                                                                : u.push(
                                                                                    e,
                                                                                  ),
                                                                                c++;
                                                                            }
                                                                          C =
                                                                            r ===
                                                                            c;
                                                                        } else
                                                                          C =
                                                                            !0;
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          } else {
                                                            const e = {
                                                              params: {
                                                                type: 'object',
                                                              },
                                                            };
                                                            null === u
                                                              ? (u = [e])
                                                              : u.push(e),
                                                              c++;
                                                          }
                                                        ($ = e === c),
                                                          (s = s || $);
                                                      }
                                                      if (s)
                                                        (c = n),
                                                          null !== u &&
                                                            (n
                                                              ? (u.length = n)
                                                              : (u = null));
                                                      else {
                                                        const e = {
                                                          params: {},
                                                        };
                                                        null === u
                                                          ? (u = [e])
                                                          : u.push(e),
                                                          c++;
                                                      }
                                                      R = r === c;
                                                    } else R = !0;
                                                    if (R) {
                                                      if (
                                                        void 0 !==
                                                        e.tsConfigPath
                                                      ) {
                                                        const t = c;
                                                        if (
                                                          'string' !=
                                                          typeof e.tsConfigPath
                                                        ) {
                                                          const e = {
                                                            params: {
                                                              type: 'string',
                                                            },
                                                          };
                                                          null === u
                                                            ? (u = [e])
                                                            : u.push(e),
                                                            c++;
                                                        }
                                                        R = t === c;
                                                      } else R = !0;
                                                      if (R) {
                                                        if (
                                                          void 0 !==
                                                          e.extraOptions
                                                        ) {
                                                          let t =
                                                            e.extraOptions;
                                                          const r = c;
                                                          if (
                                                            !t ||
                                                            'object' !=
                                                              typeof t ||
                                                            Array.isArray(t)
                                                          ) {
                                                            const e = {
                                                              params: {
                                                                type: 'object',
                                                              },
                                                            };
                                                            null === u
                                                              ? (u = [e])
                                                              : u.push(e),
                                                              c++;
                                                          }
                                                          R = r === c;
                                                        } else R = !0;
                                                        if (R) {
                                                          if (
                                                            void 0 !==
                                                            e.implementation
                                                          ) {
                                                            const t = c;
                                                            if (
                                                              'string' !=
                                                              typeof e.implementation
                                                            ) {
                                                              const e = {
                                                                params: {
                                                                  type: 'string',
                                                                },
                                                              };
                                                              null === u
                                                                ? (u = [e])
                                                                : u.push(e),
                                                                c++;
                                                            }
                                                            R = t === c;
                                                          } else R = !0;
                                                          if (R) {
                                                            if (
                                                              void 0 !== e.cwd
                                                            ) {
                                                              const t = c;
                                                              if (
                                                                'string' !=
                                                                typeof e.cwd
                                                              ) {
                                                                const e = {
                                                                  params: {
                                                                    type: 'string',
                                                                  },
                                                                };
                                                                null === u
                                                                  ? (u = [e])
                                                                  : u.push(e),
                                                                  c++;
                                                              }
                                                              R = t === c;
                                                            } else R = !0;
                                                            if (R)
                                                              if (
                                                                void 0 !==
                                                                e.displayErrorInTerminal
                                                              ) {
                                                                const t = c;
                                                                if (
                                                                  'boolean' !=
                                                                  typeof e.displayErrorInTerminal
                                                                ) {
                                                                  const e = {
                                                                    params: {
                                                                      type: 'boolean',
                                                                    },
                                                                  };
                                                                  null === u
                                                                    ? (u = [e])
                                                                    : u.push(e),
                                                                    c++;
                                                                }
                                                                R = t === c;
                                                              } else R = !0;
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                } else {
                                                  const e = {
                                                    params: { type: 'object' },
                                                  };
                                                  null === u
                                                    ? (u = [e])
                                                    : u.push(e),
                                                    c++;
                                                }
                                              (x = r === c), (s = s || x);
                                            }
                                            if (!s) {
                                              const e = { params: {} };
                                              return (
                                                null === u
                                                  ? (u = [e])
                                                  : u.push(e),
                                                c++,
                                                (D.errors = u),
                                                !1
                                              );
                                            }
                                            (c = n),
                                              null !== u &&
                                                (n
                                                  ? (u.length = n)
                                                  : (u = null)),
                                              (d = r === c);
                                          } else d = !0;
                                          if (d) {
                                            if (void 0 !== a.experiments) {
                                              let e = a.experiments;
                                              const r = c;
                                              if (c === r) {
                                                if (
                                                  !e ||
                                                  'object' != typeof e ||
                                                  Array.isArray(e)
                                                )
                                                  return (
                                                    (D.errors = [
                                                      {
                                                        params: {
                                                          type: 'object',
                                                        },
                                                      },
                                                    ]),
                                                    !1
                                                  );
                                                if (
                                                  void 0 !== e.federationRuntime
                                                ) {
                                                  let r = e.federationRuntime;
                                                  const n = c,
                                                    s = c;
                                                  let o = !1;
                                                  const a = c;
                                                  if ('boolean' != typeof r) {
                                                    const e = {
                                                      params: {
                                                        type: 'boolean',
                                                      },
                                                    };
                                                    null === u
                                                      ? (u = [e])
                                                      : u.push(e),
                                                      c++;
                                                  }
                                                  if (!1 !== r) {
                                                    const e = {
                                                      params: {
                                                        allowedValues:
                                                          t.properties
                                                            .experiments
                                                            .properties
                                                            .federationRuntime
                                                            .anyOf[0].enum,
                                                      },
                                                    };
                                                    null === u
                                                      ? (u = [e])
                                                      : u.push(e),
                                                      c++;
                                                  }
                                                  var I = a === c;
                                                  if (((o = o || I), !o)) {
                                                    const e = c;
                                                    if ('string' != typeof r) {
                                                      const e = {
                                                        params: {
                                                          type: 'string',
                                                        },
                                                      };
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                        c++;
                                                    }
                                                    if ('hoisted' !== r) {
                                                      const e = {
                                                        params: {
                                                          allowedValues:
                                                            t.properties
                                                              .experiments
                                                              .properties
                                                              .federationRuntime
                                                              .anyOf[1].enum,
                                                        },
                                                      };
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                        c++;
                                                    }
                                                    (I = e === c), (o = o || I);
                                                  }
                                                  if (!o) {
                                                    const e = { params: {} };
                                                    return (
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                      c++,
                                                      (D.errors = u),
                                                      !1
                                                    );
                                                  }
                                                  (c = s),
                                                    null !== u &&
                                                      (s
                                                        ? (u.length = s)
                                                        : (u = null));
                                                  var L = n === c;
                                                } else L = !0;
                                                if (L) {
                                                  if (
                                                    void 0 !== e.externalRuntime
                                                  ) {
                                                    const t = c;
                                                    if (
                                                      'boolean' !=
                                                      typeof e.externalRuntime
                                                    )
                                                      return (
                                                        (D.errors = [
                                                          {
                                                            params: {
                                                              type: 'boolean',
                                                            },
                                                          },
                                                        ]),
                                                        !1
                                                      );
                                                    L = t === c;
                                                  } else L = !0;
                                                  if (L)
                                                    if (
                                                      void 0 !==
                                                      e.provideExternalRuntime
                                                    ) {
                                                      const t = c;
                                                      if (
                                                        'boolean' !=
                                                        typeof e.provideExternalRuntime
                                                      )
                                                        return (
                                                          (D.errors = [
                                                            {
                                                              params: {
                                                                type: 'boolean',
                                                              },
                                                            },
                                                          ]),
                                                          !1
                                                        );
                                                      L = t === c;
                                                    } else L = !0;
                                                }
                                              }
                                              d = r === c;
                                            } else d = !0;
                                            if (d)
                                              if (void 0 !== a.bridge) {
                                                let e = a.bridge;
                                                const t = c;
                                                if (c === t) {
                                                  if (
                                                    !e ||
                                                    'object' != typeof e ||
                                                    Array.isArray(e)
                                                  )
                                                    return (
                                                      (D.errors = [
                                                        {
                                                          params: {
                                                            type: 'object',
                                                          },
                                                        },
                                                      ]),
                                                      !1
                                                    );
                                                  if (
                                                    void 0 !== e.disableAlias &&
                                                    'boolean' !=
                                                      typeof e.disableAlias
                                                  )
                                                    return (
                                                      (D.errors = [
                                                        {
                                                          params: {
                                                            type: 'boolean',
                                                          },
                                                        },
                                                      ]),
                                                      !1
                                                    );
                                                }
                                                d = t === c;
                                              } else d = !0;
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return (D.errors = u), 0 === c;
}
