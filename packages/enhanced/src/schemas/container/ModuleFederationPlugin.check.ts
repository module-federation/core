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
          'module-import',
          'script',
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
          shareScope: {
            anyOf: [
              { type: 'string', minLength: 1 },
              { type: 'array', items: { type: 'string', minLength: 1 } },
            ],
          },
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
          exclude: { $ref: '#/definitions/IncludeExcludeOptions' },
          include: { $ref: '#/definitions/IncludeExcludeOptions' },
          import: {
            anyOf: [{ enum: [!1] }, { $ref: '#/definitions/SharedItem' }],
          },
          request: { type: 'string', minLength: 1 },
          layer: { type: 'string', minLength: 1 },
          issuerLayer: { type: 'string', minLength: 1 },
          packageName: { type: 'string', minLength: 1 },
          requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
          shareKey: { type: 'string', minLength: 1 },
          shareScope: {
            anyOf: [
              { type: 'string', minLength: 1 },
              { type: 'array', items: { type: 'string', minLength: 1 } },
            ],
          },
          shareStrategy: {
            enum: ['version-first', 'loaded-first'],
            type: 'string',
          },
          singleton: { type: 'boolean' },
          strictVersion: { type: 'boolean' },
          version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
          allowNodeModulesSuffixMatch: { type: 'boolean' },
          treeshake: {
            anyOf: [
              { type: 'boolean' },
              { $ref: '#/definitions/TreeshakeConfig' },
            ],
          },
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
      IncludeExcludeOptions: {
        type: 'object',
        properties: {
          request: { type: ['string', 'object'] },
          version: { type: 'string' },
          fallbackVersion: { type: 'string' },
        },
        additionalProperties: !1,
        anyOf: [
          { required: ['request'] },
          { required: ['version'] },
          { required: ['fallbackVersion'] },
        ],
      },
      Exclude: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          request: { instanceof: 'RegExp' },
          version: { type: 'string' },
          fallbackVersion: { type: 'string' },
        },
      },
      TreeshakeConfig: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          usedExports: {
            type: 'array',
            items: { type: 'string', minLength: 1 },
          },
          strategy: { type: 'string', enum: ['server', 'infer'] },
          filename: { type: 'string' },
        },
      },
    },
    type: 'object',
    additionalProperties: !1,
    properties: {
      async: {
        anyOf: [
          { type: 'boolean' },
          {
            type: 'object',
            properties: {
              eager: {
                anyOf: [{ instanceof: 'RegExp' }, { instanceof: 'Function' }],
              },
              excludeChunk: { instanceof: 'Function' },
            },
            additionalProperties: !1,
          },
        ],
      },
      exposes: { $ref: '#/definitions/Exposes' },
      filename: { type: 'string', absolutePath: !1, minLength: 1 },
      treeshakeSharedExcludedPlugins: {
        type: 'array',
        items: { type: 'string', minLength: 1 },
      },
      treeshakeSharedPlugins: {
        type: 'array',
        items: { type: 'string', minLength: 1 },
      },
      library: { $ref: '#/definitions/LibraryOptions' },
      name: { type: 'string', minLength: 1 },
      remoteType: { oneOf: [{ $ref: '#/definitions/ExternalsType' }] },
      remotes: { $ref: '#/definitions/Remotes' },
      runtime: { $ref: '#/definitions/EntryRuntime' },
      shareScope: {
        anyOf: [
          { type: 'string', minLength: 1 },
          { type: 'array', items: { type: 'string', minLength: 1 } },
        ],
      },
      shareStrategy: {
        enum: ['version-first', 'loaded-first'],
        type: 'string',
      },
      shared: { $ref: '#/definitions/Shared' },
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
                      compilerInstance: { type: 'string' },
                      generateAPITypes: { type: 'boolean' },
                      extractThirdParty: {
                        anyOf: [
                          { type: 'boolean' },
                          {
                            type: 'object',
                            properties: {
                              exclude: {
                                type: 'array',
                                items: {
                                  anyOf: [
                                    { type: 'string' },
                                    { instanceof: 'RegExp' },
                                  ],
                                },
                              },
                            },
                            additionalProperties: !1,
                          },
                        ],
                      },
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
                      remoteTypeUrls: {
                        anyOf: [
                          { instanceof: 'Function' },
                          {
                            type: 'object',
                            additionalProperties: {
                              type: 'object',
                              properties: {
                                alias: { type: 'string' },
                                api: { type: 'string' },
                                zip: { type: 'string' },
                              },
                              required: ['api', 'zip'],
                              additionalProperties: !1,
                            },
                          },
                        ],
                      },
                      timeout: { type: 'number' },
                      family: { enum: [4, 6] },
                      typesOnBuild: { type: 'boolean' },
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
          asyncStartup: { type: 'boolean' },
          externalRuntime: { type: 'boolean' },
          provideExternalRuntime: { type: 'boolean' },
          optimization: {
            type: 'object',
            properties: {
              disableSnapshot: { type: 'boolean' },
              target: { enum: ['web', 'node'] },
            },
            additionalProperties: !1,
          },
        },
      },
      bridge: {
        type: 'object',
        properties: {
          enableBridgeRouter: { type: 'boolean', default: !1 },
          disableAlias: { type: 'boolean', default: !1 },
        },
        additionalProperties: !1,
      },
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
            additionalProperties: !1,
          },
        ],
      },
      manifest: {
        anyOf: [
          { type: 'boolean' },
          {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              disableAssetsAnalyze: { type: 'boolean' },
              fileName: { type: 'string' },
              additionalData: { instanceof: 'Function' },
            },
            additionalProperties: !1,
          },
        ],
      },
      runtimePlugins: {
        type: 'array',
        items: {
          anyOf: [
            { type: 'string' },
            {
              type: 'array',
              items: [{ type: 'string' }, { type: 'object' }],
              minItems: 2,
              maxItems: 2,
            },
          ],
        },
      },
      getPublicPath: { type: 'string' },
      dataPrefetch: { type: 'boolean' },
      implementation: { type: 'string' },
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
      'module-import',
      'script',
      'node-commonjs',
    ],
  },
  s = { anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }] },
  n = Object.prototype.hasOwnProperty;
function o(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  if (!Array.isArray(e))
    return (o.errors = [{ params: { type: 'array' } }]), !1;
  {
    const t = e.length;
    for (let r = 0; r < t; r++) {
      let t = e[r];
      const s = 0;
      if ('string' != typeof t)
        return (o.errors = [{ params: { type: 'string' } }]), !1;
      if (t.length < 1) return (o.errors = [{ params: {} }]), !1;
      if (0 !== s) break;
    }
  }
  return (o.errors = null), !0;
}
function i(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let a = null,
    l = 0;
  if (0 === l) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (i.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.import && (r = 'import'))
        return (i.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = l;
        for (const t in e)
          if ('import' !== t && 'name' !== t)
            return (i.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === l) {
          if (void 0 !== e.import) {
            let r = e.import;
            const s = l,
              u = l;
            let y = !1;
            const c = l;
            if (l == l)
              if ('string' == typeof r) {
                if (r.length < 1) {
                  const e = { params: {} };
                  null === a ? (a = [e]) : a.push(e), l++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === a ? (a = [e]) : a.push(e), l++;
              }
            var p = c === l;
            if (((y = y || p), !y)) {
              const s = l;
              o(r, {
                instancePath: t + '/import',
                parentData: e,
                parentDataProperty: 'import',
                rootData: n,
              }) ||
                ((a = null === a ? o.errors : a.concat(o.errors)),
                (l = a.length)),
                (p = s === l),
                (y = y || p);
            }
            if (!y) {
              const e = { params: {} };
              return (
                null === a ? (a = [e]) : a.push(e), l++, (i.errors = a), !1
              );
            }
            (l = u), null !== a && (u ? (a.length = u) : (a = null));
            var f = s === l;
          } else f = !0;
          if (f)
            if (void 0 !== e.name) {
              const t = l;
              if ('string' != typeof e.name)
                return (i.errors = [{ params: { type: 'string' } }]), !1;
              f = t === l;
            } else f = !0;
        }
      }
    }
  }
  return (i.errors = a), 0 === l;
}
function a(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let s = e[r];
      const u = p,
        y = p;
      let c = !1;
      const m = p;
      i(s, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: n,
      }) || ((l = null === l ? i.errors : l.concat(i.errors)), (p = l.length));
      var f = m === p;
      if (((c = c || f), !c)) {
        const i = p;
        if (p == p)
          if ('string' == typeof s) {
            if (s.length < 1) {
              const e = { params: {} };
              null === l ? (l = [e]) : l.push(e), p++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === l ? (l = [e]) : l.push(e), p++;
          }
        if (((f = i === p), (c = c || f), !c)) {
          const i = p;
          o(s, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: n,
          }) ||
            ((l = null === l ? o.errors : l.concat(o.errors)), (p = l.length)),
            (f = i === p),
            (c = c || f);
        }
      }
      if (!c) {
        const e = { params: {} };
        return null === l ? (l = [e]) : l.push(e), p++, (a.errors = l), !1;
      }
      if (((p = y), null !== l && (y ? (l.length = y) : (l = null)), u !== p))
        break;
    }
  }
  return (a.errors = l), 0 === p;
}
function l(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let o = null,
    i = 0;
  const p = i;
  let f = !1;
  const u = i;
  if (i === u)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let s = 0; s < r; s++) {
        let r = e[s];
        const l = i,
          p = i;
        let f = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), i++;
          }
        var y = u === i;
        if (((f = f || y), !f)) {
          const l = i;
          a(r, {
            instancePath: t + '/' + s,
            parentData: e,
            parentDataProperty: s,
            rootData: n,
          }) ||
            ((o = null === o ? a.errors : o.concat(a.errors)), (i = o.length)),
            (y = l === i),
            (f = f || y);
        }
        if (f) (i = p), null !== o && (p ? (o.length = p) : (o = null));
        else {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), i++;
        }
        if (l !== i) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), i++;
    }
  var c = u === i;
  if (((f = f || c), !f)) {
    const l = i;
    a(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: s,
      rootData: n,
    }) || ((o = null === o ? a.errors : o.concat(a.errors)), (i = o.length)),
      (c = l === i),
      (f = f || c);
  }
  if (!f) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), i++, (l.errors = o), !1;
  }
  return (
    (i = p),
    null !== o && (p ? (o.length = p) : (o = null)),
    (l.errors = o),
    0 === i
  );
}
const p = {
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
function f(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let o = null,
    i = 0;
  const a = i;
  let l = !1;
  const p = i;
  if ('string' != typeof e) {
    const e = { params: { type: 'string' } };
    null === o ? (o = [e]) : o.push(e), i++;
  }
  var u = p === i;
  if (((l = l || u), !l)) {
    const t = i;
    if (i == i)
      if (e && 'object' == typeof e && !Array.isArray(e)) {
        const t = i;
        for (const t in e)
          if (
            'amd' !== t &&
            'commonjs' !== t &&
            'commonjs2' !== t &&
            'root' !== t
          ) {
            const e = { params: { additionalProperty: t } };
            null === o ? (o = [e]) : o.push(e), i++;
            break;
          }
        if (t === i) {
          if (void 0 !== e.amd) {
            const t = i;
            if ('string' != typeof e.amd) {
              const e = { params: { type: 'string' } };
              null === o ? (o = [e]) : o.push(e), i++;
            }
            var y = t === i;
          } else y = !0;
          if (y) {
            if (void 0 !== e.commonjs) {
              const t = i;
              if ('string' != typeof e.commonjs) {
                const e = { params: { type: 'string' } };
                null === o ? (o = [e]) : o.push(e), i++;
              }
              y = t === i;
            } else y = !0;
            if (y) {
              if (void 0 !== e.commonjs2) {
                const t = i;
                if ('string' != typeof e.commonjs2) {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), i++;
                }
                y = t === i;
              } else y = !0;
              if (y)
                if (void 0 !== e.root) {
                  const t = i;
                  if ('string' != typeof e.root) {
                    const e = { params: { type: 'string' } };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                  y = t === i;
                } else y = !0;
            }
          }
        }
      } else {
        const e = { params: { type: 'object' } };
        null === o ? (o = [e]) : o.push(e), i++;
      }
    (u = t === i), (l = l || u);
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), i++, (f.errors = o), !1;
  }
  return (
    (i = a),
    null !== o && (a ? (o.length = a) : (o = null)),
    (f.errors = o),
    0 === i
  );
}
function u(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let o = null,
    i = 0;
  const a = i;
  let l = !1;
  const p = i;
  if (i === p)
    if (Array.isArray(e))
      if (e.length < 1) {
        const e = { params: { limit: 1 } };
        null === o ? (o = [e]) : o.push(e), i++;
      } else {
        const t = e.length;
        for (let r = 0; r < t; r++) {
          let t = e[r];
          const s = i;
          if (i === s)
            if ('string' == typeof t) {
              if (t.length < 1) {
                const e = { params: {} };
                null === o ? (o = [e]) : o.push(e), i++;
              }
            } else {
              const e = { params: { type: 'string' } };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          if (s !== i) break;
        }
      }
    else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), i++;
    }
  var f = p === i;
  if (((l = l || f), !l)) {
    const t = i;
    if (i === t)
      if ('string' == typeof e) {
        if (e.length < 1) {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), i++;
        }
      } else {
        const e = { params: { type: 'string' } };
        null === o ? (o = [e]) : o.push(e), i++;
      }
    if (((f = t === i), (l = l || f), !l)) {
      const t = i;
      if (i == i)
        if (e && 'object' == typeof e && !Array.isArray(e)) {
          const t = i;
          for (const t in e)
            if ('amd' !== t && 'commonjs' !== t && 'root' !== t) {
              const e = { params: { additionalProperty: t } };
              null === o ? (o = [e]) : o.push(e), i++;
              break;
            }
          if (t === i) {
            if (void 0 !== e.amd) {
              let t = e.amd;
              const r = i;
              if (i === r)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), i++;
                }
              var y = r === i;
            } else y = !0;
            if (y) {
              if (void 0 !== e.commonjs) {
                let t = e.commonjs;
                const r = i;
                if (i === r)
                  if ('string' == typeof t) {
                    if (t.length < 1) {
                      const e = { params: {} };
                      null === o ? (o = [e]) : o.push(e), i++;
                    }
                  } else {
                    const e = { params: { type: 'string' } };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                y = r === i;
              } else y = !0;
              if (y)
                if (void 0 !== e.root) {
                  let t = e.root;
                  const r = i,
                    s = i;
                  let n = !1;
                  const a = i;
                  if (i === a)
                    if (Array.isArray(t)) {
                      const e = t.length;
                      for (let r = 0; r < e; r++) {
                        let e = t[r];
                        const s = i;
                        if (i === s)
                          if ('string' == typeof e) {
                            if (e.length < 1) {
                              const e = { params: {} };
                              null === o ? (o = [e]) : o.push(e), i++;
                            }
                          } else {
                            const e = { params: { type: 'string' } };
                            null === o ? (o = [e]) : o.push(e), i++;
                          }
                        if (s !== i) break;
                      }
                    } else {
                      const e = { params: { type: 'array' } };
                      null === o ? (o = [e]) : o.push(e), i++;
                    }
                  var c = a === i;
                  if (((n = n || c), !n)) {
                    const e = i;
                    if (i === e)
                      if ('string' == typeof t) {
                        if (t.length < 1) {
                          const e = { params: {} };
                          null === o ? (o = [e]) : o.push(e), i++;
                        }
                      } else {
                        const e = { params: { type: 'string' } };
                        null === o ? (o = [e]) : o.push(e), i++;
                      }
                    (c = e === i), (n = n || c);
                  }
                  if (n)
                    (i = s), null !== o && (s ? (o.length = s) : (o = null));
                  else {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                  y = r === i;
                } else y = !0;
            }
          }
        } else {
          const e = { params: { type: 'object' } };
          null === o ? (o = [e]) : o.push(e), i++;
        }
      (f = t === i), (l = l || f);
    }
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), i++, (u.errors = o), !1;
  }
  return (
    (i = a),
    null !== o && (a ? (o.length = a) : (o = null)),
    (u.errors = o),
    0 === i
  );
}
function y(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let o = null,
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
              if (t.length < 1) return (y.errors = [{ params: {} }]), !1;
            }
            var a = r === i;
          } else a = !0;
          if (a) {
            if (void 0 !== e.auxiliaryComment) {
              const r = i;
              f(e.auxiliaryComment, {
                instancePath: t + '/auxiliaryComment',
                parentData: e,
                parentDataProperty: 'auxiliaryComment',
                rootData: n,
              }) ||
                ((o = null === o ? f.errors : o.concat(f.errors)),
                (i = o.length)),
                (a = r === i);
            } else a = !0;
            if (a) {
              if (void 0 !== e.export) {
                let t = e.export;
                const r = i,
                  s = i;
                let n = !1;
                const p = i;
                if (i === p)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let r = 0; r < e; r++) {
                      let e = t[r];
                      const s = i;
                      if (i === s)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === o ? (o = [e]) : o.push(e), i++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === o ? (o = [e]) : o.push(e), i++;
                        }
                      if (s !== i) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                var l = p === i;
                if (((n = n || l), !n)) {
                  const e = i;
                  if (i === e)
                    if ('string' == typeof t) {
                      if (t.length < 1) {
                        const e = { params: {} };
                        null === o ? (o = [e]) : o.push(e), i++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === o ? (o = [e]) : o.push(e), i++;
                    }
                  (l = e === i), (n = n || l);
                }
                if (!n) {
                  const e = { params: {} };
                  return (
                    null === o ? (o = [e]) : o.push(e), i++, (y.errors = o), !1
                  );
                }
                (i = s),
                  null !== o && (s ? (o.length = s) : (o = null)),
                  (a = r === i);
              } else a = !0;
              if (a) {
                if (void 0 !== e.name) {
                  const r = i;
                  u(e.name, {
                    instancePath: t + '/name',
                    parentData: e,
                    parentDataProperty: 'name',
                    rootData: n,
                  }) ||
                    ((o = null === o ? u.errors : o.concat(u.errors)),
                    (i = o.length)),
                    (a = r === i);
                } else a = !0;
                if (a) {
                  if (void 0 !== e.type) {
                    let t = e.type;
                    const r = i,
                      s = i;
                    let n = !1;
                    const l = i;
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
                      const e = { params: { allowedValues: p.anyOf[0].enum } };
                      null === o ? (o = [e]) : o.push(e), i++;
                    }
                    var c = l === i;
                    if (((n = n || c), !n)) {
                      const e = i;
                      if ('string' != typeof t) {
                        const e = { params: { type: 'string' } };
                        null === o ? (o = [e]) : o.push(e), i++;
                      }
                      (c = e === i), (n = n || c);
                    }
                    if (!n) {
                      const e = { params: {} };
                      return (
                        null === o ? (o = [e]) : o.push(e),
                        i++,
                        (y.errors = o),
                        !1
                      );
                    }
                    (i = s),
                      null !== o && (s ? (o.length = s) : (o = null)),
                      (a = r === i);
                  } else a = !0;
                  if (a)
                    if (void 0 !== e.umdNamedDefine) {
                      const t = i;
                      if ('boolean' != typeof e.umdNamedDefine)
                        return (
                          (y.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      a = t === i;
                    } else a = !0;
                }
              }
            }
          }
        }
      }
    }
  }
  return (y.errors = o), 0 === i;
}
function c(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  if (!Array.isArray(e))
    return (c.errors = [{ params: { type: 'array' } }]), !1;
  {
    const t = e.length;
    for (let r = 0; r < t; r++) {
      let t = e[r];
      const s = 0;
      if ('string' != typeof t)
        return (c.errors = [{ params: { type: 'string' } }]), !1;
      if (t.length < 1) return (c.errors = [{ params: {} }]), !1;
      if (0 !== s) break;
    }
  }
  return (c.errors = null), !0;
}
function m(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let o = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (m.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.external && (r = 'external'))
        return (m.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = i;
        for (const t in e)
          if ('external' !== t && 'shareScope' !== t)
            return (m.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === i) {
          if (void 0 !== e.external) {
            let r = e.external;
            const s = i,
              p = i;
            let f = !1;
            const u = i;
            if (i == i)
              if ('string' == typeof r) {
                if (r.length < 1) {
                  const e = { params: {} };
                  null === o ? (o = [e]) : o.push(e), i++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === o ? (o = [e]) : o.push(e), i++;
              }
            var a = u === i;
            if (((f = f || a), !f)) {
              const s = i;
              c(r, {
                instancePath: t + '/external',
                parentData: e,
                parentDataProperty: 'external',
                rootData: n,
              }) ||
                ((o = null === o ? c.errors : o.concat(c.errors)),
                (i = o.length)),
                (a = s === i),
                (f = f || a);
            }
            if (!f) {
              const e = { params: {} };
              return (
                null === o ? (o = [e]) : o.push(e), i++, (m.errors = o), !1
              );
            }
            (i = p), null !== o && (p ? (o.length = p) : (o = null));
            var l = s === i;
          } else l = !0;
          if (l)
            if (void 0 !== e.shareScope) {
              let t = e.shareScope;
              const r = i,
                s = i;
              let n = !1;
              const a = i;
              if (i === a)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), i++;
                }
              var p = a === i;
              if (((n = n || p), !n)) {
                const e = i;
                if (i === e)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let r = 0; r < e; r++) {
                      let e = t[r];
                      const s = i;
                      if (i === s)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === o ? (o = [e]) : o.push(e), i++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === o ? (o = [e]) : o.push(e), i++;
                        }
                      if (s !== i) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                (p = e === i), (n = n || p);
              }
              if (!n) {
                const e = { params: {} };
                return (
                  null === o ? (o = [e]) : o.push(e), i++, (m.errors = o), !1
                );
              }
              (i = s),
                null !== o && (s ? (o.length = s) : (o = null)),
                (l = r === i);
            } else l = !0;
        }
      }
    }
  }
  return (m.errors = o), 0 === i;
}
function d(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let o = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (d.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let s = e[r];
      const l = i,
        p = i;
      let f = !1;
      const u = i;
      m(s, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: n,
      }) || ((o = null === o ? m.errors : o.concat(m.errors)), (i = o.length));
      var a = u === i;
      if (((f = f || a), !f)) {
        const l = i;
        if (i == i)
          if ('string' == typeof s) {
            if (s.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), i++;
          }
        if (((a = l === i), (f = f || a), !f)) {
          const l = i;
          c(s, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: n,
          }) ||
            ((o = null === o ? c.errors : o.concat(c.errors)), (i = o.length)),
            (a = l === i),
            (f = f || a);
        }
      }
      if (!f) {
        const e = { params: {} };
        return null === o ? (o = [e]) : o.push(e), i++, (d.errors = o), !1;
      }
      if (((i = p), null !== o && (p ? (o.length = p) : (o = null)), l !== i))
        break;
    }
  }
  return (d.errors = o), 0 === i;
}
function g(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let o = null,
    i = 0;
  const a = i;
  let l = !1;
  const p = i;
  if (i === p)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let s = 0; s < r; s++) {
        let r = e[s];
        const a = i,
          l = i;
        let p = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), i++;
          }
        var f = u === i;
        if (((p = p || f), !p)) {
          const a = i;
          d(r, {
            instancePath: t + '/' + s,
            parentData: e,
            parentDataProperty: s,
            rootData: n,
          }) ||
            ((o = null === o ? d.errors : o.concat(d.errors)), (i = o.length)),
            (f = a === i),
            (p = p || f);
        }
        if (p) (i = l), null !== o && (l ? (o.length = l) : (o = null));
        else {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), i++;
        }
        if (a !== i) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), i++;
    }
  var u = p === i;
  if (((l = l || u), !l)) {
    const a = i;
    d(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: s,
      rootData: n,
    }) || ((o = null === o ? d.errors : o.concat(d.errors)), (i = o.length)),
      (u = a === i),
      (l = l || u);
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), i++, (g.errors = o), !1;
  }
  return (
    (i = a),
    null !== o && (a ? (o.length = a) : (o = null)),
    (g.errors = o),
    0 === i
  );
}
const h = {
    type: 'object',
    additionalProperties: !1,
    properties: {
      eager: { type: 'boolean' },
      exclude: { $ref: '#/definitions/IncludeExcludeOptions' },
      include: { $ref: '#/definitions/IncludeExcludeOptions' },
      import: { anyOf: [{ enum: [!1] }, { $ref: '#/definitions/SharedItem' }] },
      request: { type: 'string', minLength: 1 },
      layer: { type: 'string', minLength: 1 },
      issuerLayer: { type: 'string', minLength: 1 },
      packageName: { type: 'string', minLength: 1 },
      requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      shareKey: { type: 'string', minLength: 1 },
      shareScope: {
        anyOf: [
          { type: 'string', minLength: 1 },
          { type: 'array', items: { type: 'string', minLength: 1 } },
        ],
      },
      shareStrategy: {
        enum: ['version-first', 'loaded-first'],
        type: 'string',
      },
      singleton: { type: 'boolean' },
      strictVersion: { type: 'boolean' },
      version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
      allowNodeModulesSuffixMatch: { type: 'boolean' },
      treeshake: {
        anyOf: [{ type: 'boolean' }, { $ref: '#/definitions/TreeshakeConfig' }],
      },
    },
  },
  b = {
    type: 'object',
    properties: {
      request: { type: ['string', 'object'] },
      version: { type: 'string' },
      fallbackVersion: { type: 'string' },
    },
    additionalProperties: !1,
    anyOf: [
      { required: ['request'] },
      { required: ['version'] },
      { required: ['fallbackVersion'] },
    ],
  },
  v = {
    type: 'object',
    additionalProperties: !1,
    properties: {
      usedExports: { type: 'array', items: { type: 'string', minLength: 1 } },
      strategy: { type: 'string', enum: ['server', 'infer'] },
      filename: { type: 'string' },
    },
  };
function P(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: o = e,
  } = {},
) {
  let i = null,
    a = 0;
  if (0 === a) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (P.errors = [{ params: { type: 'object' } }]), !1;
    {
      const t = a;
      for (const t in e)
        if (!n.call(h.properties, t))
          return (P.errors = [{ params: { additionalProperty: t } }]), !1;
      if (t === a) {
        if (void 0 !== e.eager) {
          const t = a;
          if ('boolean' != typeof e.eager)
            return (P.errors = [{ params: { type: 'boolean' } }]), !1;
          var l = t === a;
        } else l = !0;
        if (l) {
          if (void 0 !== e.exclude) {
            let t = e.exclude;
            const r = a,
              s = a,
              n = a;
            let o = !1;
            const u = a;
            if (t && 'object' == typeof t && !Array.isArray(t)) {
              let e;
              if (void 0 === t.request && (e = 'request')) {
                const t = { params: { missingProperty: e } };
                null === i ? (i = [t]) : i.push(t), a++;
              }
            }
            var p = u === a;
            if (((o = o || p), !o)) {
              const e = a;
              if (t && 'object' == typeof t && !Array.isArray(t)) {
                let e;
                if (void 0 === t.version && (e = 'version')) {
                  const t = { params: { missingProperty: e } };
                  null === i ? (i = [t]) : i.push(t), a++;
                }
              }
              if (((p = e === a), (o = o || p), !o)) {
                const e = a;
                if (t && 'object' == typeof t && !Array.isArray(t)) {
                  let e;
                  if (void 0 === t.fallbackVersion && (e = 'fallbackVersion')) {
                    const t = { params: { missingProperty: e } };
                    null === i ? (i = [t]) : i.push(t), a++;
                  }
                }
                (p = e === a), (o = o || p);
              }
            }
            if (!o) {
              const e = { params: {} };
              return (
                null === i ? (i = [e]) : i.push(e), a++, (P.errors = i), !1
              );
            }
            if (
              ((a = n),
              null !== i && (n ? (i.length = n) : (i = null)),
              a === s)
            ) {
              if (!t || 'object' != typeof t || Array.isArray(t))
                return (P.errors = [{ params: { type: 'object' } }]), !1;
              {
                const e = a;
                for (const e in t)
                  if (
                    'request' !== e &&
                    'version' !== e &&
                    'fallbackVersion' !== e
                  )
                    return (
                      (P.errors = [{ params: { additionalProperty: e } }]), !1
                    );
                if (e === a) {
                  if (void 0 !== t.request) {
                    let e = t.request;
                    const r = a;
                    if (
                      'string' != typeof e &&
                      (!e || 'object' != typeof e || Array.isArray(e))
                    )
                      return (
                        (P.errors = [
                          { params: { type: b.properties.request.type } },
                        ]),
                        !1
                      );
                    var f = r === a;
                  } else f = !0;
                  if (f) {
                    if (void 0 !== t.version) {
                      const e = a;
                      if ('string' != typeof t.version)
                        return (
                          (P.errors = [{ params: { type: 'string' } }]), !1
                        );
                      f = e === a;
                    } else f = !0;
                    if (f)
                      if (void 0 !== t.fallbackVersion) {
                        const e = a;
                        if ('string' != typeof t.fallbackVersion)
                          return (
                            (P.errors = [{ params: { type: 'string' } }]), !1
                          );
                        f = e === a;
                      } else f = !0;
                  }
                }
              }
            }
            l = r === a;
          } else l = !0;
          if (l) {
            if (void 0 !== e.include) {
              let t = e.include;
              const r = a,
                s = a,
                n = a;
              let o = !1;
              const p = a;
              if (t && 'object' == typeof t && !Array.isArray(t)) {
                let e;
                if (void 0 === t.request && (e = 'request')) {
                  const t = { params: { missingProperty: e } };
                  null === i ? (i = [t]) : i.push(t), a++;
                }
              }
              var u = p === a;
              if (((o = o || u), !o)) {
                const e = a;
                if (t && 'object' == typeof t && !Array.isArray(t)) {
                  let e;
                  if (void 0 === t.version && (e = 'version')) {
                    const t = { params: { missingProperty: e } };
                    null === i ? (i = [t]) : i.push(t), a++;
                  }
                }
                if (((u = e === a), (o = o || u), !o)) {
                  const e = a;
                  if (t && 'object' == typeof t && !Array.isArray(t)) {
                    let e;
                    if (
                      void 0 === t.fallbackVersion &&
                      (e = 'fallbackVersion')
                    ) {
                      const t = { params: { missingProperty: e } };
                      null === i ? (i = [t]) : i.push(t), a++;
                    }
                  }
                  (u = e === a), (o = o || u);
                }
              }
              if (!o) {
                const e = { params: {} };
                return (
                  null === i ? (i = [e]) : i.push(e), a++, (P.errors = i), !1
                );
              }
              if (
                ((a = n),
                null !== i && (n ? (i.length = n) : (i = null)),
                a === s)
              ) {
                if (!t || 'object' != typeof t || Array.isArray(t))
                  return (P.errors = [{ params: { type: 'object' } }]), !1;
                {
                  const e = a;
                  for (const e in t)
                    if (
                      'request' !== e &&
                      'version' !== e &&
                      'fallbackVersion' !== e
                    )
                      return (
                        (P.errors = [{ params: { additionalProperty: e } }]), !1
                      );
                  if (e === a) {
                    if (void 0 !== t.request) {
                      let e = t.request;
                      const r = a;
                      if (
                        'string' != typeof e &&
                        (!e || 'object' != typeof e || Array.isArray(e))
                      )
                        return (
                          (P.errors = [
                            { params: { type: b.properties.request.type } },
                          ]),
                          !1
                        );
                      var y = r === a;
                    } else y = !0;
                    if (y) {
                      if (void 0 !== t.version) {
                        const e = a;
                        if ('string' != typeof t.version)
                          return (
                            (P.errors = [{ params: { type: 'string' } }]), !1
                          );
                        y = e === a;
                      } else y = !0;
                      if (y)
                        if (void 0 !== t.fallbackVersion) {
                          const e = a;
                          if ('string' != typeof t.fallbackVersion)
                            return (
                              (P.errors = [{ params: { type: 'string' } }]), !1
                            );
                          y = e === a;
                        } else y = !0;
                    }
                  }
                }
              }
              l = r === a;
            } else l = !0;
            if (l) {
              if (void 0 !== e.import) {
                let t = e.import;
                const r = a,
                  s = a;
                let n = !1;
                const o = a;
                if (!1 !== t) {
                  const e = {
                    params: {
                      allowedValues: h.properties.import.anyOf[0].enum,
                    },
                  };
                  null === i ? (i = [e]) : i.push(e), a++;
                }
                var c = o === a;
                if (((n = n || c), !n)) {
                  const e = a;
                  if (a == a)
                    if ('string' == typeof t) {
                      if (t.length < 1) {
                        const e = { params: {} };
                        null === i ? (i = [e]) : i.push(e), a++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === i ? (i = [e]) : i.push(e), a++;
                    }
                  (c = e === a), (n = n || c);
                }
                if (!n) {
                  const e = { params: {} };
                  return (
                    null === i ? (i = [e]) : i.push(e), a++, (P.errors = i), !1
                  );
                }
                (a = s),
                  null !== i && (s ? (i.length = s) : (i = null)),
                  (l = r === a);
              } else l = !0;
              if (l) {
                if (void 0 !== e.request) {
                  let t = e.request;
                  const r = a;
                  if (a === r) {
                    if ('string' != typeof t)
                      return (P.errors = [{ params: { type: 'string' } }]), !1;
                    if (t.length < 1) return (P.errors = [{ params: {} }]), !1;
                  }
                  l = r === a;
                } else l = !0;
                if (l) {
                  if (void 0 !== e.layer) {
                    let t = e.layer;
                    const r = a;
                    if (a === r) {
                      if ('string' != typeof t)
                        return (
                          (P.errors = [{ params: { type: 'string' } }]), !1
                        );
                      if (t.length < 1)
                        return (P.errors = [{ params: {} }]), !1;
                    }
                    l = r === a;
                  } else l = !0;
                  if (l) {
                    if (void 0 !== e.issuerLayer) {
                      let t = e.issuerLayer;
                      const r = a;
                      if (a === r) {
                        if ('string' != typeof t)
                          return (
                            (P.errors = [{ params: { type: 'string' } }]), !1
                          );
                        if (t.length < 1)
                          return (P.errors = [{ params: {} }]), !1;
                      }
                      l = r === a;
                    } else l = !0;
                    if (l) {
                      if (void 0 !== e.packageName) {
                        let t = e.packageName;
                        const r = a;
                        if (a === r) {
                          if ('string' != typeof t)
                            return (
                              (P.errors = [{ params: { type: 'string' } }]), !1
                            );
                          if (t.length < 1)
                            return (P.errors = [{ params: {} }]), !1;
                        }
                        l = r === a;
                      } else l = !0;
                      if (l) {
                        if (void 0 !== e.requiredVersion) {
                          let t = e.requiredVersion;
                          const r = a,
                            s = a;
                          let n = !1;
                          const o = a;
                          if (!1 !== t) {
                            const e = {
                              params: {
                                allowedValues:
                                  h.properties.requiredVersion.anyOf[0].enum,
                              },
                            };
                            null === i ? (i = [e]) : i.push(e), a++;
                          }
                          var m = o === a;
                          if (((n = n || m), !n)) {
                            const e = a;
                            if ('string' != typeof t) {
                              const e = { params: { type: 'string' } };
                              null === i ? (i = [e]) : i.push(e), a++;
                            }
                            (m = e === a), (n = n || m);
                          }
                          if (!n) {
                            const e = { params: {} };
                            return (
                              null === i ? (i = [e]) : i.push(e),
                              a++,
                              (P.errors = i),
                              !1
                            );
                          }
                          (a = s),
                            null !== i && (s ? (i.length = s) : (i = null)),
                            (l = r === a);
                        } else l = !0;
                        if (l) {
                          if (void 0 !== e.shareKey) {
                            let t = e.shareKey;
                            const r = a;
                            if (a === r) {
                              if ('string' != typeof t)
                                return (
                                  (P.errors = [{ params: { type: 'string' } }]),
                                  !1
                                );
                              if (t.length < 1)
                                return (P.errors = [{ params: {} }]), !1;
                            }
                            l = r === a;
                          } else l = !0;
                          if (l) {
                            if (void 0 !== e.shareScope) {
                              let t = e.shareScope;
                              const r = a,
                                s = a;
                              let n = !1;
                              const o = a;
                              if (a === o)
                                if ('string' == typeof t) {
                                  if (t.length < 1) {
                                    const e = { params: {} };
                                    null === i ? (i = [e]) : i.push(e), a++;
                                  }
                                } else {
                                  const e = { params: { type: 'string' } };
                                  null === i ? (i = [e]) : i.push(e), a++;
                                }
                              var d = o === a;
                              if (((n = n || d), !n)) {
                                const e = a;
                                if (a === e)
                                  if (Array.isArray(t)) {
                                    const e = t.length;
                                    for (let r = 0; r < e; r++) {
                                      let e = t[r];
                                      const s = a;
                                      if (a === s)
                                        if ('string' == typeof e) {
                                          if (e.length < 1) {
                                            const e = { params: {} };
                                            null === i ? (i = [e]) : i.push(e),
                                              a++;
                                          }
                                        } else {
                                          const e = {
                                            params: { type: 'string' },
                                          };
                                          null === i ? (i = [e]) : i.push(e),
                                            a++;
                                        }
                                      if (s !== a) break;
                                    }
                                  } else {
                                    const e = { params: { type: 'array' } };
                                    null === i ? (i = [e]) : i.push(e), a++;
                                  }
                                (d = e === a), (n = n || d);
                              }
                              if (!n) {
                                const e = { params: {} };
                                return (
                                  null === i ? (i = [e]) : i.push(e),
                                  a++,
                                  (P.errors = i),
                                  !1
                                );
                              }
                              (a = s),
                                null !== i && (s ? (i.length = s) : (i = null)),
                                (l = r === a);
                            } else l = !0;
                            if (l) {
                              if (void 0 !== e.shareStrategy) {
                                let t = e.shareStrategy;
                                const r = a;
                                if ('string' != typeof t)
                                  return (
                                    (P.errors = [
                                      { params: { type: 'string' } },
                                    ]),
                                    !1
                                  );
                                if (
                                  'version-first' !== t &&
                                  'loaded-first' !== t
                                )
                                  return (
                                    (P.errors = [
                                      {
                                        params: {
                                          allowedValues:
                                            h.properties.shareStrategy.enum,
                                        },
                                      },
                                    ]),
                                    !1
                                  );
                                l = r === a;
                              } else l = !0;
                              if (l) {
                                if (void 0 !== e.singleton) {
                                  const t = a;
                                  if ('boolean' != typeof e.singleton)
                                    return (
                                      (P.errors = [
                                        { params: { type: 'boolean' } },
                                      ]),
                                      !1
                                    );
                                  l = t === a;
                                } else l = !0;
                                if (l) {
                                  if (void 0 !== e.strictVersion) {
                                    const t = a;
                                    if ('boolean' != typeof e.strictVersion)
                                      return (
                                        (P.errors = [
                                          { params: { type: 'boolean' } },
                                        ]),
                                        !1
                                      );
                                    l = t === a;
                                  } else l = !0;
                                  if (l) {
                                    if (void 0 !== e.version) {
                                      let t = e.version;
                                      const r = a,
                                        s = a;
                                      let n = !1;
                                      const o = a;
                                      if (!1 !== t) {
                                        const e = {
                                          params: {
                                            allowedValues:
                                              h.properties.version.anyOf[0]
                                                .enum,
                                          },
                                        };
                                        null === i ? (i = [e]) : i.push(e), a++;
                                      }
                                      var g = o === a;
                                      if (((n = n || g), !n)) {
                                        const e = a;
                                        if ('string' != typeof t) {
                                          const e = {
                                            params: { type: 'string' },
                                          };
                                          null === i ? (i = [e]) : i.push(e),
                                            a++;
                                        }
                                        (g = e === a), (n = n || g);
                                      }
                                      if (!n) {
                                        const e = { params: {} };
                                        return (
                                          null === i ? (i = [e]) : i.push(e),
                                          a++,
                                          (P.errors = i),
                                          !1
                                        );
                                      }
                                      (a = s),
                                        null !== i &&
                                          (s ? (i.length = s) : (i = null)),
                                        (l = r === a);
                                    } else l = !0;
                                    if (l) {
                                      if (
                                        void 0 !== e.allowNodeModulesSuffixMatch
                                      ) {
                                        const t = a;
                                        if (
                                          'boolean' !=
                                          typeof e.allowNodeModulesSuffixMatch
                                        )
                                          return (
                                            (P.errors = [
                                              { params: { type: 'boolean' } },
                                            ]),
                                            !1
                                          );
                                        l = t === a;
                                      } else l = !0;
                                      if (l)
                                        if (void 0 !== e.treeshake) {
                                          let t = e.treeshake;
                                          const r = a,
                                            s = a;
                                          let n = !1;
                                          const o = a;
                                          if ('boolean' != typeof t) {
                                            const e = {
                                              params: { type: 'boolean' },
                                            };
                                            null === i ? (i = [e]) : i.push(e),
                                              a++;
                                          }
                                          var j = o === a;
                                          if (((n = n || j), !n)) {
                                            const e = a;
                                            if (a == a)
                                              if (
                                                t &&
                                                'object' == typeof t &&
                                                !Array.isArray(t)
                                              ) {
                                                const e = a;
                                                for (const e in t)
                                                  if (
                                                    'usedExports' !== e &&
                                                    'strategy' !== e &&
                                                    'filename' !== e
                                                  ) {
                                                    const t = {
                                                      params: {
                                                        additionalProperty: e,
                                                      },
                                                    };
                                                    null === i
                                                      ? (i = [t])
                                                      : i.push(t),
                                                      a++;
                                                    break;
                                                  }
                                                if (e === a) {
                                                  if (
                                                    void 0 !== t.usedExports
                                                  ) {
                                                    let e = t.usedExports;
                                                    const r = a;
                                                    if (a === r)
                                                      if (Array.isArray(e)) {
                                                        const t = e.length;
                                                        for (
                                                          let r = 0;
                                                          r < t;
                                                          r++
                                                        ) {
                                                          let t = e[r];
                                                          const s = a;
                                                          if (a === s)
                                                            if (
                                                              'string' ==
                                                              typeof t
                                                            ) {
                                                              if (
                                                                t.length < 1
                                                              ) {
                                                                const e = {
                                                                  params: {},
                                                                };
                                                                null === i
                                                                  ? (i = [e])
                                                                  : i.push(e),
                                                                  a++;
                                                              }
                                                            } else {
                                                              const e = {
                                                                params: {
                                                                  type: 'string',
                                                                },
                                                              };
                                                              null === i
                                                                ? (i = [e])
                                                                : i.push(e),
                                                                a++;
                                                            }
                                                          if (s !== a) break;
                                                        }
                                                      } else {
                                                        const e = {
                                                          params: {
                                                            type: 'array',
                                                          },
                                                        };
                                                        null === i
                                                          ? (i = [e])
                                                          : i.push(e),
                                                          a++;
                                                      }
                                                    var A = r === a;
                                                  } else A = !0;
                                                  if (A) {
                                                    if (void 0 !== t.strategy) {
                                                      let e = t.strategy;
                                                      const r = a;
                                                      if (
                                                        'string' != typeof e
                                                      ) {
                                                        const e = {
                                                          params: {
                                                            type: 'string',
                                                          },
                                                        };
                                                        null === i
                                                          ? (i = [e])
                                                          : i.push(e),
                                                          a++;
                                                      }
                                                      if (
                                                        'server' !== e &&
                                                        'infer' !== e
                                                      ) {
                                                        const e = {
                                                          params: {
                                                            allowedValues:
                                                              v.properties
                                                                .strategy.enum,
                                                          },
                                                        };
                                                        null === i
                                                          ? (i = [e])
                                                          : i.push(e),
                                                          a++;
                                                      }
                                                      A = r === a;
                                                    } else A = !0;
                                                    if (A)
                                                      if (
                                                        void 0 !== t.filename
                                                      ) {
                                                        const e = a;
                                                        if (
                                                          'string' !=
                                                          typeof t.filename
                                                        ) {
                                                          const e = {
                                                            params: {
                                                              type: 'string',
                                                            },
                                                          };
                                                          null === i
                                                            ? (i = [e])
                                                            : i.push(e),
                                                            a++;
                                                        }
                                                        A = e === a;
                                                      } else A = !0;
                                                  }
                                                }
                                              } else {
                                                const e = {
                                                  params: { type: 'object' },
                                                };
                                                null === i
                                                  ? (i = [e])
                                                  : i.push(e),
                                                  a++;
                                              }
                                            (j = e === a), (n = n || j);
                                          }
                                          if (!n) {
                                            const e = { params: {} };
                                            return (
                                              null === i
                                                ? (i = [e])
                                                : i.push(e),
                                              a++,
                                              (P.errors = i),
                                              !1
                                            );
                                          }
                                          (a = s),
                                            null !== i &&
                                              (s ? (i.length = s) : (i = null)),
                                            (l = r === a);
                                        } else l = !0;
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
  return (P.errors = i), 0 === a;
}
function j(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let o = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (j.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let s = e[r];
      const l = i,
        p = i;
      let f = !1;
      const u = i;
      P(s, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: n,
      }) || ((o = null === o ? P.errors : o.concat(P.errors)), (i = o.length));
      var a = u === i;
      if (((f = f || a), !f)) {
        const e = i;
        if (i == i)
          if ('string' == typeof s) {
            if (s.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), i++;
          }
        (a = e === i), (f = f || a);
      }
      if (!f) {
        const e = { params: {} };
        return null === o ? (o = [e]) : o.push(e), i++, (j.errors = o), !1;
      }
      if (((i = p), null !== o && (p ? (o.length = p) : (o = null)), l !== i))
        break;
    }
  }
  return (j.errors = o), 0 === i;
}
function A(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: s,
    rootData: n = e,
  } = {},
) {
  let o = null,
    i = 0;
  const a = i;
  let l = !1;
  const p = i;
  if (i === p)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let s = 0; s < r; s++) {
        let r = e[s];
        const a = i,
          l = i;
        let p = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), i++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), i++;
          }
        var f = u === i;
        if (((p = p || f), !p)) {
          const a = i;
          j(r, {
            instancePath: t + '/' + s,
            parentData: e,
            parentDataProperty: s,
            rootData: n,
          }) ||
            ((o = null === o ? j.errors : o.concat(j.errors)), (i = o.length)),
            (f = a === i),
            (p = p || f);
        }
        if (p) (i = l), null !== o && (l ? (o.length = l) : (o = null));
        else {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), i++;
        }
        if (a !== i) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), i++;
    }
  var u = p === i;
  if (((l = l || u), !l)) {
    const a = i;
    j(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: s,
      rootData: n,
    }) || ((o = null === o ? j.errors : o.concat(j.errors)), (i = o.length)),
      (u = a === i),
      (l = l || u);
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), i++, (A.errors = o), !1;
  }
  return (
    (i = a),
    null !== o && (a ? (o.length = a) : (o = null)),
    (A.errors = o),
    0 === i
  );
}
function D(
  o,
  {
    instancePath: i = '',
    parentData: a,
    parentDataProperty: p,
    rootData: f = o,
  } = {},
) {
  let u = null,
    c = 0;
  if (0 === c) {
    if (!o || 'object' != typeof o || Array.isArray(o))
      return (D.errors = [{ params: { type: 'object' } }]), !1;
    {
      const a = c;
      for (const e in o)
        if (!n.call(t.properties, e))
          return (D.errors = [{ params: { additionalProperty: e } }]), !1;
      if (a === c) {
        if (void 0 !== o.async) {
          let e = o.async;
          const t = c,
            r = c;
          let s = !1;
          const n = c;
          if ('boolean' != typeof e) {
            const e = { params: { type: 'boolean' } };
            null === u ? (u = [e]) : u.push(e), c++;
          }
          var m = n === c;
          if (((s = s || m), !s)) {
            const t = c;
            if (c === t)
              if (e && 'object' == typeof e && !Array.isArray(e)) {
                const t = c;
                for (const t in e)
                  if ('eager' !== t && 'excludeChunk' !== t) {
                    const e = { params: { additionalProperty: t } };
                    null === u ? (u = [e]) : u.push(e), c++;
                    break;
                  }
                if (t === c) {
                  if (void 0 !== e.eager) {
                    let t = e.eager;
                    const r = c,
                      s = c;
                    let n = !1;
                    const o = c;
                    if (!(t instanceof RegExp)) {
                      const e = { params: {} };
                      null === u ? (u = [e]) : u.push(e), c++;
                    }
                    var d = o === c;
                    if (((n = n || d), !n)) {
                      const e = c;
                      if (!(t instanceof Function)) {
                        const e = { params: {} };
                        null === u ? (u = [e]) : u.push(e), c++;
                      }
                      (d = e === c), (n = n || d);
                    }
                    if (n)
                      (c = s), null !== u && (s ? (u.length = s) : (u = null));
                    else {
                      const e = { params: {} };
                      null === u ? (u = [e]) : u.push(e), c++;
                    }
                    var h = r === c;
                  } else h = !0;
                  if (h)
                    if (void 0 !== e.excludeChunk) {
                      const t = c;
                      if (!(e.excludeChunk instanceof Function)) {
                        const e = { params: {} };
                        null === u ? (u = [e]) : u.push(e), c++;
                      }
                      h = t === c;
                    } else h = !0;
                }
              } else {
                const e = { params: { type: 'object' } };
                null === u ? (u = [e]) : u.push(e), c++;
              }
            (m = t === c), (s = s || m);
          }
          if (!s) {
            const e = { params: {} };
            return null === u ? (u = [e]) : u.push(e), c++, (D.errors = u), !1;
          }
          (c = r), null !== u && (r ? (u.length = r) : (u = null));
          var b = t === c;
        } else b = !0;
        if (b) {
          if (void 0 !== o.exposes) {
            const e = c;
            l(o.exposes, {
              instancePath: i + '/exposes',
              parentData: o,
              parentDataProperty: 'exposes',
              rootData: f,
            }) ||
              ((u = null === u ? l.errors : u.concat(l.errors)),
              (c = u.length)),
              (b = e === c);
          } else b = !0;
          if (b) {
            if (void 0 !== o.filename) {
              let t = o.filename;
              const r = c;
              if (c === r) {
                if ('string' != typeof t)
                  return (D.errors = [{ params: { type: 'string' } }]), !1;
                if (t.length < 1) return (D.errors = [{ params: {} }]), !1;
                if (t.includes('!') || !1 !== e.test(t))
                  return (D.errors = [{ params: {} }]), !1;
              }
              b = r === c;
            } else b = !0;
            if (b) {
              if (void 0 !== o.treeshakeSharedExcludedPlugins) {
                let e = o.treeshakeSharedExcludedPlugins;
                const t = c;
                if (c === t) {
                  if (!Array.isArray(e))
                    return (D.errors = [{ params: { type: 'array' } }]), !1;
                  {
                    const t = e.length;
                    for (let r = 0; r < t; r++) {
                      let t = e[r];
                      const s = c;
                      if (c === s) {
                        if ('string' != typeof t)
                          return (
                            (D.errors = [{ params: { type: 'string' } }]), !1
                          );
                        if (t.length < 1)
                          return (D.errors = [{ params: {} }]), !1;
                      }
                      if (s !== c) break;
                    }
                  }
                }
                b = t === c;
              } else b = !0;
              if (b) {
                if (void 0 !== o.treeshakeSharedPlugins) {
                  let e = o.treeshakeSharedPlugins;
                  const t = c;
                  if (c === t) {
                    if (!Array.isArray(e))
                      return (D.errors = [{ params: { type: 'array' } }]), !1;
                    {
                      const t = e.length;
                      for (let r = 0; r < t; r++) {
                        let t = e[r];
                        const s = c;
                        if (c === s) {
                          if ('string' != typeof t)
                            return (
                              (D.errors = [{ params: { type: 'string' } }]), !1
                            );
                          if (t.length < 1)
                            return (D.errors = [{ params: {} }]), !1;
                        }
                        if (s !== c) break;
                      }
                    }
                  }
                  b = t === c;
                } else b = !0;
                if (b) {
                  if (void 0 !== o.library) {
                    const e = c;
                    y(o.library, {
                      instancePath: i + '/library',
                      parentData: o,
                      parentDataProperty: 'library',
                      rootData: f,
                    }) ||
                      ((u = null === u ? y.errors : u.concat(y.errors)),
                      (c = u.length)),
                      (b = e === c);
                  } else b = !0;
                  if (b) {
                    if (void 0 !== o.name) {
                      let e = o.name;
                      const t = c;
                      if (c === t) {
                        if ('string' != typeof e)
                          return (
                            (D.errors = [{ params: { type: 'string' } }]), !1
                          );
                        if (e.length < 1)
                          return (D.errors = [{ params: {} }]), !1;
                      }
                      b = t === c;
                    } else b = !0;
                    if (b) {
                      if (void 0 !== o.remoteType) {
                        let e = o.remoteType;
                        const t = c,
                          s = c;
                        let n = !1,
                          i = null;
                        const a = c;
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
                          'module-import' !== e &&
                          'script' !== e &&
                          'node-commonjs' !== e
                        ) {
                          const e = { params: { allowedValues: r.enum } };
                          null === u ? (u = [e]) : u.push(e), c++;
                        }
                        if ((a === c && ((n = !0), (i = 0)), !n)) {
                          const e = { params: { passingSchemas: i } };
                          return (
                            null === u ? (u = [e]) : u.push(e),
                            c++,
                            (D.errors = u),
                            !1
                          );
                        }
                        (c = s),
                          null !== u && (s ? (u.length = s) : (u = null)),
                          (b = t === c);
                      } else b = !0;
                      if (b) {
                        if (void 0 !== o.remotes) {
                          const e = c;
                          g(o.remotes, {
                            instancePath: i + '/remotes',
                            parentData: o,
                            parentDataProperty: 'remotes',
                            rootData: f,
                          }) ||
                            ((u = null === u ? g.errors : u.concat(g.errors)),
                            (c = u.length)),
                            (b = e === c);
                        } else b = !0;
                        if (b) {
                          if (void 0 !== o.runtime) {
                            let e = o.runtime;
                            const t = c,
                              r = c;
                            let n = !1;
                            const i = c;
                            if (!1 !== e) {
                              const e = {
                                params: { allowedValues: s.anyOf[0].enum },
                              };
                              null === u ? (u = [e]) : u.push(e), c++;
                            }
                            var v = i === c;
                            if (((n = n || v), !n)) {
                              const t = c;
                              if (c === t)
                                if ('string' == typeof e) {
                                  if (e.length < 1) {
                                    const e = { params: {} };
                                    null === u ? (u = [e]) : u.push(e), c++;
                                  }
                                } else {
                                  const e = { params: { type: 'string' } };
                                  null === u ? (u = [e]) : u.push(e), c++;
                                }
                              (v = t === c), (n = n || v);
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
                              (b = t === c);
                          } else b = !0;
                          if (b) {
                            if (void 0 !== o.shareScope) {
                              let e = o.shareScope;
                              const t = c,
                                r = c;
                              let s = !1;
                              const n = c;
                              if (c === n)
                                if ('string' == typeof e) {
                                  if (e.length < 1) {
                                    const e = { params: {} };
                                    null === u ? (u = [e]) : u.push(e), c++;
                                  }
                                } else {
                                  const e = { params: { type: 'string' } };
                                  null === u ? (u = [e]) : u.push(e), c++;
                                }
                              var P = n === c;
                              if (((s = s || P), !s)) {
                                const t = c;
                                if (c === t)
                                  if (Array.isArray(e)) {
                                    const t = e.length;
                                    for (let r = 0; r < t; r++) {
                                      let t = e[r];
                                      const s = c;
                                      if (c === s)
                                        if ('string' == typeof t) {
                                          if (t.length < 1) {
                                            const e = { params: {} };
                                            null === u ? (u = [e]) : u.push(e),
                                              c++;
                                          }
                                        } else {
                                          const e = {
                                            params: { type: 'string' },
                                          };
                                          null === u ? (u = [e]) : u.push(e),
                                            c++;
                                        }
                                      if (s !== c) break;
                                    }
                                  } else {
                                    const e = { params: { type: 'array' } };
                                    null === u ? (u = [e]) : u.push(e), c++;
                                  }
                                (P = t === c), (s = s || P);
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
                                (b = t === c);
                            } else b = !0;
                            if (b) {
                              if (void 0 !== o.shareStrategy) {
                                let e = o.shareStrategy;
                                const r = c;
                                if ('string' != typeof e)
                                  return (
                                    (D.errors = [
                                      { params: { type: 'string' } },
                                    ]),
                                    !1
                                  );
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
                                b = r === c;
                              } else b = !0;
                              if (b) {
                                if (void 0 !== o.shared) {
                                  const e = c;
                                  A(o.shared, {
                                    instancePath: i + '/shared',
                                    parentData: o,
                                    parentDataProperty: 'shared',
                                    rootData: f,
                                  }) ||
                                    ((u =
                                      null === u
                                        ? A.errors
                                        : u.concat(A.errors)),
                                    (c = u.length)),
                                    (b = e === c);
                                } else b = !0;
                                if (b) {
                                  if (void 0 !== o.dts) {
                                    let e = o.dts;
                                    const r = c,
                                      s = c;
                                    let n = !1;
                                    const i = c;
                                    if ('boolean' != typeof e) {
                                      const e = { params: { type: 'boolean' } };
                                      null === u ? (u = [e]) : u.push(e), c++;
                                    }
                                    var j = i === c;
                                    if (((n = n || j), !n)) {
                                      const r = c;
                                      if (c === r)
                                        if (
                                          e &&
                                          'object' == typeof e &&
                                          !Array.isArray(e)
                                        ) {
                                          if (void 0 !== e.generateTypes) {
                                            let t = e.generateTypes;
                                            const r = c,
                                              s = c;
                                            let n = !1;
                                            const o = c;
                                            if ('boolean' != typeof t) {
                                              const e = {
                                                params: { type: 'boolean' },
                                              };
                                              null === u
                                                ? (u = [e])
                                                : u.push(e),
                                                c++;
                                            }
                                            var x = o === c;
                                            if (((n = n || x), !n)) {
                                              const e = c;
                                              if (c === e)
                                                if (
                                                  t &&
                                                  'object' == typeof t &&
                                                  !Array.isArray(t)
                                                ) {
                                                  if (
                                                    void 0 !== t.tsConfigPath
                                                  ) {
                                                    const e = c;
                                                    if (
                                                      'string' !=
                                                      typeof t.tsConfigPath
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
                                                    var O = e === c;
                                                  } else O = !0;
                                                  if (O) {
                                                    if (
                                                      void 0 !== t.typesFolder
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
                                                      O = e === c;
                                                    } else O = !0;
                                                    if (O) {
                                                      if (
                                                        void 0 !==
                                                        t.compiledTypesFolder
                                                      ) {
                                                        const e = c;
                                                        if (
                                                          'string' !=
                                                          typeof t.compiledTypesFolder
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
                                                        O = e === c;
                                                      } else O = !0;
                                                      if (O) {
                                                        if (
                                                          void 0 !==
                                                          t.deleteTypesFolder
                                                        ) {
                                                          const e = c;
                                                          if (
                                                            'boolean' !=
                                                            typeof t.deleteTypesFolder
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
                                                          O = e === c;
                                                        } else O = !0;
                                                        if (O) {
                                                          if (
                                                            void 0 !==
                                                            t.additionalFilesToCompile
                                                          ) {
                                                            let e =
                                                              t.additionalFilesToCompile;
                                                            const r = c;
                                                            if (c === r)
                                                              if (
                                                                Array.isArray(e)
                                                              ) {
                                                                const t =
                                                                  e.length;
                                                                for (
                                                                  let r = 0;
                                                                  r < t;
                                                                  r++
                                                                ) {
                                                                  const t = c;
                                                                  if (
                                                                    'string' !=
                                                                    typeof e[r]
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
                                                                  if (t !== c)
                                                                    break;
                                                                }
                                                              } else {
                                                                const e = {
                                                                  params: {
                                                                    type: 'array',
                                                                  },
                                                                };
                                                                null === u
                                                                  ? (u = [e])
                                                                  : u.push(e),
                                                                  c++;
                                                              }
                                                            O = r === c;
                                                          } else O = !0;
                                                          if (O) {
                                                            if (
                                                              void 0 !==
                                                              t.compileInChildProcess
                                                            ) {
                                                              const e = c;
                                                              if (
                                                                'boolean' !=
                                                                typeof t.compileInChildProcess
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
                                                              O = e === c;
                                                            } else O = !0;
                                                            if (O) {
                                                              if (
                                                                void 0 !==
                                                                t.compilerInstance
                                                              ) {
                                                                const e = c;
                                                                if (
                                                                  'string' !=
                                                                  typeof t.compilerInstance
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
                                                                O = e === c;
                                                              } else O = !0;
                                                              if (O) {
                                                                if (
                                                                  void 0 !==
                                                                  t.generateAPITypes
                                                                ) {
                                                                  const e = c;
                                                                  if (
                                                                    'boolean' !=
                                                                    typeof t.generateAPITypes
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
                                                                  O = e === c;
                                                                } else O = !0;
                                                                if (O) {
                                                                  if (
                                                                    void 0 !==
                                                                    t.extractThirdParty
                                                                  ) {
                                                                    let e =
                                                                      t.extractThirdParty;
                                                                    const r = c,
                                                                      s = c;
                                                                    let n = !1;
                                                                    const o = c;
                                                                    if (
                                                                      'boolean' !=
                                                                      typeof e
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
                                                                    var k =
                                                                      o === c;
                                                                    if (
                                                                      ((n =
                                                                        n || k),
                                                                      !n)
                                                                    ) {
                                                                      const t =
                                                                        c;
                                                                      if (
                                                                        c === t
                                                                      )
                                                                        if (
                                                                          e &&
                                                                          'object' ==
                                                                            typeof e &&
                                                                          !Array.isArray(
                                                                            e,
                                                                          )
                                                                        ) {
                                                                          const t =
                                                                            c;
                                                                          for (const t in e)
                                                                            if (
                                                                              'exclude' !==
                                                                              t
                                                                            ) {
                                                                              const e =
                                                                                {
                                                                                  params:
                                                                                    {
                                                                                      additionalProperty:
                                                                                        t,
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
                                                                              break;
                                                                            }
                                                                          if (
                                                                            t ===
                                                                              c &&
                                                                            void 0 !==
                                                                              e.exclude
                                                                          ) {
                                                                            let t =
                                                                              e.exclude;
                                                                            if (
                                                                              c ==
                                                                              c
                                                                            )
                                                                              if (
                                                                                Array.isArray(
                                                                                  t,
                                                                                )
                                                                              ) {
                                                                                const e =
                                                                                  t.length;
                                                                                for (
                                                                                  let r = 0;
                                                                                  r <
                                                                                  e;
                                                                                  r++
                                                                                ) {
                                                                                  let e =
                                                                                    t[
                                                                                      r
                                                                                    ];
                                                                                  const s =
                                                                                      c,
                                                                                    n =
                                                                                      c;
                                                                                  let o =
                                                                                    !1;
                                                                                  const i =
                                                                                    c;
                                                                                  if (
                                                                                    'string' !=
                                                                                    typeof e
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
                                                                                  var L =
                                                                                    i ===
                                                                                    c;
                                                                                  if (
                                                                                    ((o =
                                                                                      o ||
                                                                                      L),
                                                                                    !o)
                                                                                  ) {
                                                                                    const t =
                                                                                      c;
                                                                                    if (
                                                                                      !(
                                                                                        e instanceof
                                                                                        RegExp
                                                                                      )
                                                                                    ) {
                                                                                      const e =
                                                                                        {
                                                                                          params:
                                                                                            {},
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
                                                                                    (L =
                                                                                      t ===
                                                                                      c),
                                                                                      (o =
                                                                                        o ||
                                                                                        L);
                                                                                  }
                                                                                  if (
                                                                                    o
                                                                                  )
                                                                                    (c =
                                                                                      n),
                                                                                      null !==
                                                                                        u &&
                                                                                        (n
                                                                                          ? (u.length =
                                                                                              n)
                                                                                          : (u =
                                                                                              null));
                                                                                  else {
                                                                                    const e =
                                                                                      {
                                                                                        params:
                                                                                          {},
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
                                                                                    s !==
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
                                                                          }
                                                                        } else {
                                                                          const e =
                                                                            {
                                                                              params:
                                                                                {
                                                                                  type: 'object',
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
                                                                      (k =
                                                                        t ===
                                                                        c),
                                                                        (n =
                                                                          n ||
                                                                          k);
                                                                    }
                                                                    if (n)
                                                                      (c = s),
                                                                        null !==
                                                                          u &&
                                                                          (s
                                                                            ? (u.length =
                                                                                s)
                                                                            : (u =
                                                                                null));
                                                                    else {
                                                                      const e =
                                                                        {
                                                                          params:
                                                                            {},
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
                                                                    O = r === c;
                                                                  } else O = !0;
                                                                  if (O) {
                                                                    if (
                                                                      void 0 !==
                                                                      t.extractRemoteTypes
                                                                    ) {
                                                                      const e =
                                                                        c;
                                                                      if (
                                                                        'boolean' !=
                                                                        typeof t.extractRemoteTypes
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
                                                                      O =
                                                                        e === c;
                                                                    } else
                                                                      O = !0;
                                                                    if (O)
                                                                      if (
                                                                        void 0 !==
                                                                        t.abortOnError
                                                                      ) {
                                                                        const e =
                                                                          c;
                                                                        if (
                                                                          'boolean' !=
                                                                          typeof t.abortOnError
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
                                                                        O =
                                                                          e ===
                                                                          c;
                                                                      } else
                                                                        O = !0;
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
                                                    params: { type: 'object' },
                                                  };
                                                  null === u
                                                    ? (u = [e])
                                                    : u.push(e),
                                                    c++;
                                                }
                                              (x = e === c), (n = n || x);
                                            }
                                            if (n)
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
                                            var T = r === c;
                                          } else T = !0;
                                          if (T) {
                                            if (void 0 !== e.consumeTypes) {
                                              let r = e.consumeTypes;
                                              const s = c,
                                                n = c;
                                              let o = !1;
                                              const i = c;
                                              if ('boolean' != typeof r) {
                                                const e = {
                                                  params: { type: 'boolean' },
                                                };
                                                null === u
                                                  ? (u = [e])
                                                  : u.push(e),
                                                  c++;
                                              }
                                              var E = i === c;
                                              if (((o = o || E), !o)) {
                                                const e = c;
                                                if (c === e)
                                                  if (
                                                    r &&
                                                    'object' == typeof r &&
                                                    !Array.isArray(r)
                                                  ) {
                                                    if (
                                                      void 0 !== r.typesFolder
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
                                                      var R = e === c;
                                                    } else R = !0;
                                                    if (R) {
                                                      if (
                                                        void 0 !==
                                                        r.abortOnError
                                                      ) {
                                                        const e = c;
                                                        if (
                                                          'boolean' !=
                                                          typeof r.abortOnError
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
                                                        R = e === c;
                                                      } else R = !0;
                                                      if (R) {
                                                        if (
                                                          void 0 !==
                                                          r.remoteTypesFolder
                                                        ) {
                                                          const e = c;
                                                          if (
                                                            'string' !=
                                                            typeof r.remoteTypesFolder
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
                                                          R = e === c;
                                                        } else R = !0;
                                                        if (R) {
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
                                                                ? (u = [e])
                                                                : u.push(e),
                                                                c++;
                                                            }
                                                            R = e === c;
                                                          } else R = !0;
                                                          if (R) {
                                                            if (
                                                              void 0 !==
                                                              r.maxRetries
                                                            ) {
                                                              const e = c;
                                                              if (
                                                                'number' !=
                                                                typeof r.maxRetries
                                                              ) {
                                                                const e = {
                                                                  params: {
                                                                    type: 'number',
                                                                  },
                                                                };
                                                                null === u
                                                                  ? (u = [e])
                                                                  : u.push(e),
                                                                  c++;
                                                              }
                                                              R = e === c;
                                                            } else R = !0;
                                                            if (R) {
                                                              if (
                                                                void 0 !==
                                                                r.consumeAPITypes
                                                              ) {
                                                                const e = c;
                                                                if (
                                                                  'boolean' !=
                                                                  typeof r.consumeAPITypes
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
                                                                R = e === c;
                                                              } else R = !0;
                                                              if (R) {
                                                                if (
                                                                  void 0 !==
                                                                  r.runtimePkgs
                                                                ) {
                                                                  let e =
                                                                    r.runtimePkgs;
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
                                                                      null === u
                                                                        ? (u = [
                                                                            e,
                                                                          ])
                                                                        : u.push(
                                                                            e,
                                                                          ),
                                                                        c++;
                                                                    }
                                                                  R = t === c;
                                                                } else R = !0;
                                                                if (R) {
                                                                  if (
                                                                    void 0 !==
                                                                    r.remoteTypeUrls
                                                                  ) {
                                                                    let e =
                                                                      r.remoteTypeUrls;
                                                                    const t = c,
                                                                      s = c;
                                                                    let n = !1;
                                                                    const o = c;
                                                                    if (
                                                                      !(
                                                                        e instanceof
                                                                        Function
                                                                      )
                                                                    ) {
                                                                      const e =
                                                                        {
                                                                          params:
                                                                            {},
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
                                                                    var S =
                                                                      o === c;
                                                                    if (
                                                                      ((n =
                                                                        n || S),
                                                                      !n)
                                                                    ) {
                                                                      const t =
                                                                        c;
                                                                      if (
                                                                        c === t
                                                                      )
                                                                        if (
                                                                          e &&
                                                                          'object' ==
                                                                            typeof e &&
                                                                          !Array.isArray(
                                                                            e,
                                                                          )
                                                                        )
                                                                          for (const t in e) {
                                                                            let r =
                                                                              e[
                                                                                t
                                                                              ];
                                                                            const s =
                                                                              c;
                                                                            if (
                                                                              c ===
                                                                              s
                                                                            )
                                                                              if (
                                                                                r &&
                                                                                'object' ==
                                                                                  typeof r &&
                                                                                !Array.isArray(
                                                                                  r,
                                                                                )
                                                                              ) {
                                                                                let e;
                                                                                if (
                                                                                  (void 0 ===
                                                                                    r.api &&
                                                                                    (e =
                                                                                      'api')) ||
                                                                                  (void 0 ===
                                                                                    r.zip &&
                                                                                    (e =
                                                                                      'zip'))
                                                                                ) {
                                                                                  const t =
                                                                                    {
                                                                                      params:
                                                                                        {
                                                                                          missingProperty:
                                                                                            e,
                                                                                        },
                                                                                    };
                                                                                  null ===
                                                                                  u
                                                                                    ? (u =
                                                                                        [
                                                                                          t,
                                                                                        ])
                                                                                    : u.push(
                                                                                        t,
                                                                                      ),
                                                                                    c++;
                                                                                } else {
                                                                                  const e =
                                                                                    c;
                                                                                  for (const e in r)
                                                                                    if (
                                                                                      'alias' !==
                                                                                        e &&
                                                                                      'api' !==
                                                                                        e &&
                                                                                      'zip' !==
                                                                                        e
                                                                                    ) {
                                                                                      const t =
                                                                                        {
                                                                                          params:
                                                                                            {
                                                                                              additionalProperty:
                                                                                                e,
                                                                                            },
                                                                                        };
                                                                                      null ===
                                                                                      u
                                                                                        ? (u =
                                                                                            [
                                                                                              t,
                                                                                            ])
                                                                                        : u.push(
                                                                                            t,
                                                                                          ),
                                                                                        c++;
                                                                                      break;
                                                                                    }
                                                                                  if (
                                                                                    e ===
                                                                                    c
                                                                                  ) {
                                                                                    if (
                                                                                      void 0 !==
                                                                                      r.alias
                                                                                    ) {
                                                                                      const e =
                                                                                        c;
                                                                                      if (
                                                                                        'string' !=
                                                                                        typeof r.alias
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
                                                                                      var C =
                                                                                        e ===
                                                                                        c;
                                                                                    } else
                                                                                      C =
                                                                                        !0;
                                                                                    if (
                                                                                      C
                                                                                    ) {
                                                                                      if (
                                                                                        void 0 !==
                                                                                        r.api
                                                                                      ) {
                                                                                        const e =
                                                                                          c;
                                                                                        if (
                                                                                          'string' !=
                                                                                          typeof r.api
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
                                                                                        C =
                                                                                          e ===
                                                                                          c;
                                                                                      } else
                                                                                        C =
                                                                                          !0;
                                                                                      if (
                                                                                        C
                                                                                      )
                                                                                        if (
                                                                                          void 0 !==
                                                                                          r.zip
                                                                                        ) {
                                                                                          const e =
                                                                                            c;
                                                                                          if (
                                                                                            'string' !=
                                                                                            typeof r.zip
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
                                                                                          C =
                                                                                            e ===
                                                                                            c;
                                                                                        } else
                                                                                          C =
                                                                                            !0;
                                                                                    }
                                                                                  }
                                                                                }
                                                                              } else {
                                                                                const e =
                                                                                  {
                                                                                    params:
                                                                                      {
                                                                                        type: 'object',
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
                                                                              s !==
                                                                              c
                                                                            )
                                                                              break;
                                                                          }
                                                                        else {
                                                                          const e =
                                                                            {
                                                                              params:
                                                                                {
                                                                                  type: 'object',
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
                                                                      (S =
                                                                        t ===
                                                                        c),
                                                                        (n =
                                                                          n ||
                                                                          S);
                                                                    }
                                                                    if (n)
                                                                      (c = s),
                                                                        null !==
                                                                          u &&
                                                                          (s
                                                                            ? (u.length =
                                                                                s)
                                                                            : (u =
                                                                                null));
                                                                    else {
                                                                      const e =
                                                                        {
                                                                          params:
                                                                            {},
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
                                                                    R = t === c;
                                                                  } else R = !0;
                                                                  if (R) {
                                                                    if (
                                                                      void 0 !==
                                                                      r.timeout
                                                                    ) {
                                                                      const e =
                                                                        c;
                                                                      if (
                                                                        'number' !=
                                                                        typeof r.timeout
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
                                                                      R =
                                                                        e === c;
                                                                    } else
                                                                      R = !0;
                                                                    if (R) {
                                                                      if (
                                                                        void 0 !==
                                                                        r.family
                                                                      ) {
                                                                        let e =
                                                                          r.family;
                                                                        const s =
                                                                          c;
                                                                        if (
                                                                          4 !==
                                                                            e &&
                                                                          6 !==
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
                                                                                      .consumeTypes
                                                                                      .anyOf[1]
                                                                                      .properties
                                                                                      .family
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
                                                                        R =
                                                                          s ===
                                                                          c;
                                                                      } else
                                                                        R = !0;
                                                                      if (R)
                                                                        if (
                                                                          void 0 !==
                                                                          r.typesOnBuild
                                                                        ) {
                                                                          const e =
                                                                            c;
                                                                          if (
                                                                            'boolean' !=
                                                                            typeof r.typesOnBuild
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
                                                                          R =
                                                                            e ===
                                                                            c;
                                                                        } else
                                                                          R =
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
                                                (E = e === c), (o = o || E);
                                              }
                                              if (o)
                                                (c = n),
                                                  null !== u &&
                                                    (n
                                                      ? (u.length = n)
                                                      : (u = null));
                                              else {
                                                const e = { params: {} };
                                                null === u
                                                  ? (u = [e])
                                                  : u.push(e),
                                                  c++;
                                              }
                                              T = s === c;
                                            } else T = !0;
                                            if (T) {
                                              if (void 0 !== e.tsConfigPath) {
                                                const t = c;
                                                if (
                                                  'string' !=
                                                  typeof e.tsConfigPath
                                                ) {
                                                  const e = {
                                                    params: { type: 'string' },
                                                  };
                                                  null === u
                                                    ? (u = [e])
                                                    : u.push(e),
                                                    c++;
                                                }
                                                T = t === c;
                                              } else T = !0;
                                              if (T) {
                                                if (void 0 !== e.extraOptions) {
                                                  let t = e.extraOptions;
                                                  const r = c;
                                                  if (
                                                    !t ||
                                                    'object' != typeof t ||
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
                                                  T = r === c;
                                                } else T = !0;
                                                if (T) {
                                                  if (
                                                    void 0 !== e.implementation
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
                                                    T = t === c;
                                                  } else T = !0;
                                                  if (T) {
                                                    if (void 0 !== e.cwd) {
                                                      const t = c;
                                                      if (
                                                        'string' != typeof e.cwd
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
                                                      T = t === c;
                                                    } else T = !0;
                                                    if (T)
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
                                                        T = t === c;
                                                      } else T = !0;
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        } else {
                                          const e = {
                                            params: { type: 'object' },
                                          };
                                          null === u ? (u = [e]) : u.push(e),
                                            c++;
                                        }
                                      (j = r === c), (n = n || j);
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
                                    (c = s),
                                      null !== u &&
                                        (s ? (u.length = s) : (u = null)),
                                      (b = r === c);
                                  } else b = !0;
                                  if (b) {
                                    if (void 0 !== o.experiments) {
                                      let e = o.experiments;
                                      const r = c;
                                      if (c === r) {
                                        if (
                                          !e ||
                                          'object' != typeof e ||
                                          Array.isArray(e)
                                        )
                                          return (
                                            (D.errors = [
                                              { params: { type: 'object' } },
                                            ]),
                                            !1
                                          );
                                        if (void 0 !== e.asyncStartup) {
                                          const t = c;
                                          if (
                                            'boolean' != typeof e.asyncStartup
                                          )
                                            return (
                                              (D.errors = [
                                                { params: { type: 'boolean' } },
                                              ]),
                                              !1
                                            );
                                          var $ = t === c;
                                        } else $ = !0;
                                        if ($) {
                                          if (void 0 !== e.externalRuntime) {
                                            const t = c;
                                            if (
                                              'boolean' !=
                                              typeof e.externalRuntime
                                            )
                                              return (
                                                (D.errors = [
                                                  {
                                                    params: { type: 'boolean' },
                                                  },
                                                ]),
                                                !1
                                              );
                                            $ = t === c;
                                          } else $ = !0;
                                          if ($) {
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
                                              $ = t === c;
                                            } else $ = !0;
                                            if ($)
                                              if (void 0 !== e.optimization) {
                                                let r = e.optimization;
                                                const s = c;
                                                if (c === s) {
                                                  if (
                                                    !r ||
                                                    'object' != typeof r ||
                                                    Array.isArray(r)
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
                                                  {
                                                    const e = c;
                                                    for (const e in r)
                                                      if (
                                                        'disableSnapshot' !==
                                                          e &&
                                                        'target' !== e
                                                      )
                                                        return (
                                                          (D.errors = [
                                                            {
                                                              params: {
                                                                additionalProperty:
                                                                  e,
                                                              },
                                                            },
                                                          ]),
                                                          !1
                                                        );
                                                    if (e === c) {
                                                      if (
                                                        void 0 !==
                                                        r.disableSnapshot
                                                      ) {
                                                        const e = c;
                                                        if (
                                                          'boolean' !=
                                                          typeof r.disableSnapshot
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
                                                        var I = e === c;
                                                      } else I = !0;
                                                      if (I)
                                                        if (
                                                          void 0 !== r.target
                                                        ) {
                                                          let e = r.target;
                                                          const s = c;
                                                          if (
                                                            'web' !== e &&
                                                            'node' !== e
                                                          )
                                                            return (
                                                              (D.errors = [
                                                                {
                                                                  params: {
                                                                    allowedValues:
                                                                      t
                                                                        .properties
                                                                        .experiments
                                                                        .properties
                                                                        .optimization
                                                                        .properties
                                                                        .target
                                                                        .enum,
                                                                  },
                                                                },
                                                              ]),
                                                              !1
                                                            );
                                                          I = s === c;
                                                        } else I = !0;
                                                    }
                                                  }
                                                }
                                                $ = s === c;
                                              } else $ = !0;
                                          }
                                        }
                                      }
                                      b = r === c;
                                    } else b = !0;
                                    if (b) {
                                      if (void 0 !== o.bridge) {
                                        let e = o.bridge;
                                        const t = c;
                                        if (c === t) {
                                          if (
                                            !e ||
                                            'object' != typeof e ||
                                            Array.isArray(e)
                                          )
                                            return (
                                              (D.errors = [
                                                { params: { type: 'object' } },
                                              ]),
                                              !1
                                            );
                                          {
                                            const t = c;
                                            for (const t in e)
                                              if (
                                                'enableBridgeRouter' !== t &&
                                                'disableAlias' !== t
                                              )
                                                return (
                                                  (D.errors = [
                                                    {
                                                      params: {
                                                        additionalProperty: t,
                                                      },
                                                    },
                                                  ]),
                                                  !1
                                                );
                                            if (t === c) {
                                              if (
                                                void 0 !== e.enableBridgeRouter
                                              ) {
                                                const t = c;
                                                if (
                                                  'boolean' !=
                                                  typeof e.enableBridgeRouter
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
                                                var q = t === c;
                                              } else q = !0;
                                              if (q)
                                                if (void 0 !== e.disableAlias) {
                                                  const t = c;
                                                  if (
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
                                                  q = t === c;
                                                } else q = !0;
                                            }
                                          }
                                        }
                                        b = t === c;
                                      } else b = !0;
                                      if (b) {
                                        if (void 0 !== o.virtualRuntimeEntry) {
                                          const e = c;
                                          if (
                                            'boolean' !=
                                            typeof o.virtualRuntimeEntry
                                          )
                                            return (
                                              (D.errors = [
                                                { params: { type: 'boolean' } },
                                              ]),
                                              !1
                                            );
                                          b = e === c;
                                        } else b = !0;
                                        if (b) {
                                          if (void 0 !== o.dev) {
                                            let e = o.dev;
                                            const t = c,
                                              r = c;
                                            let s = !1;
                                            const n = c;
                                            if ('boolean' != typeof e) {
                                              const e = {
                                                params: { type: 'boolean' },
                                              };
                                              null === u
                                                ? (u = [e])
                                                : u.push(e),
                                                c++;
                                            }
                                            var V = n === c;
                                            if (((s = s || V), !s)) {
                                              const t = c;
                                              if (c === t)
                                                if (
                                                  e &&
                                                  'object' == typeof e &&
                                                  !Array.isArray(e)
                                                ) {
                                                  const t = c;
                                                  for (const t in e)
                                                    if (
                                                      'disableLiveReload' !==
                                                        t &&
                                                      'disableHotTypesReload' !==
                                                        t &&
                                                      'disableDynamicRemoteTypeHints' !==
                                                        t
                                                    ) {
                                                      const e = {
                                                        params: {
                                                          additionalProperty: t,
                                                        },
                                                      };
                                                      null === u
                                                        ? (u = [e])
                                                        : u.push(e),
                                                        c++;
                                                      break;
                                                    }
                                                  if (t === c) {
                                                    if (
                                                      void 0 !==
                                                      e.disableLiveReload
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
                                                      var w = t === c;
                                                    } else w = !0;
                                                    if (w) {
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
                                                        w = t === c;
                                                      } else w = !0;
                                                      if (w)
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
                                                          w = t === c;
                                                        } else w = !0;
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
                                              (V = t === c), (s = s || V);
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
                                            (c = r),
                                              null !== u &&
                                                (r
                                                  ? (u.length = r)
                                                  : (u = null)),
                                              (b = t === c);
                                          } else b = !0;
                                          if (b) {
                                            if (void 0 !== o.manifest) {
                                              let e = o.manifest;
                                              const t = c,
                                                r = c;
                                              let s = !1;
                                              const n = c;
                                              if ('boolean' != typeof e) {
                                                const e = {
                                                  params: { type: 'boolean' },
                                                };
                                                null === u
                                                  ? (u = [e])
                                                  : u.push(e),
                                                  c++;
                                              }
                                              var F = n === c;
                                              if (((s = s || F), !s)) {
                                                const t = c;
                                                if (c === t)
                                                  if (
                                                    e &&
                                                    'object' == typeof e &&
                                                    !Array.isArray(e)
                                                  ) {
                                                    const t = c;
                                                    for (const t in e)
                                                      if (
                                                        'filePath' !== t &&
                                                        'disableAssetsAnalyze' !==
                                                          t &&
                                                        'fileName' !== t &&
                                                        'additionalData' !== t
                                                      ) {
                                                        const e = {
                                                          params: {
                                                            additionalProperty:
                                                              t,
                                                          },
                                                        };
                                                        null === u
                                                          ? (u = [e])
                                                          : u.push(e),
                                                          c++;
                                                        break;
                                                      }
                                                    if (t === c) {
                                                      if (
                                                        void 0 !== e.filePath
                                                      ) {
                                                        const t = c;
                                                        if (
                                                          'string' !=
                                                          typeof e.filePath
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
                                                        var N = t === c;
                                                      } else N = !0;
                                                      if (N) {
                                                        if (
                                                          void 0 !==
                                                          e.disableAssetsAnalyze
                                                        ) {
                                                          const t = c;
                                                          if (
                                                            'boolean' !=
                                                            typeof e.disableAssetsAnalyze
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
                                                          N = t === c;
                                                        } else N = !0;
                                                        if (N) {
                                                          if (
                                                            void 0 !==
                                                            e.fileName
                                                          ) {
                                                            const t = c;
                                                            if (
                                                              'string' !=
                                                              typeof e.fileName
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
                                                            N = t === c;
                                                          } else N = !0;
                                                          if (N)
                                                            if (
                                                              void 0 !==
                                                              e.additionalData
                                                            ) {
                                                              const t = c;
                                                              if (
                                                                !(
                                                                  e.additionalData instanceof
                                                                  Function
                                                                )
                                                              ) {
                                                                const e = {
                                                                  params: {},
                                                                };
                                                                null === u
                                                                  ? (u = [e])
                                                                  : u.push(e),
                                                                  c++;
                                                              }
                                                              N = t === c;
                                                            } else N = !0;
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
                                                (F = t === c), (s = s || F);
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
                                              (c = r),
                                                null !== u &&
                                                  (r
                                                    ? (u.length = r)
                                                    : (u = null)),
                                                (b = t === c);
                                            } else b = !0;
                                            if (b) {
                                              if (void 0 !== o.runtimePlugins) {
                                                let e = o.runtimePlugins;
                                                const t = c;
                                                if (c === t) {
                                                  if (!Array.isArray(e))
                                                    return (
                                                      (D.errors = [
                                                        {
                                                          params: {
                                                            type: 'array',
                                                          },
                                                        },
                                                      ]),
                                                      !1
                                                    );
                                                  {
                                                    const t = e.length;
                                                    for (
                                                      let r = 0;
                                                      r < t;
                                                      r++
                                                    ) {
                                                      let t = e[r];
                                                      const s = c,
                                                        n = c;
                                                      let o = !1;
                                                      const i = c;
                                                      if (
                                                        'string' != typeof t
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
                                                      var z = i === c;
                                                      if (((o = o || z), !o)) {
                                                        const e = c;
                                                        if (c === e)
                                                          if (Array.isArray(t))
                                                            if (t.length > 2) {
                                                              const e = {
                                                                params: {
                                                                  limit: 2,
                                                                },
                                                              };
                                                              null === u
                                                                ? (u = [e])
                                                                : u.push(e),
                                                                c++;
                                                            } else if (
                                                              t.length < 2
                                                            ) {
                                                              const e = {
                                                                params: {
                                                                  limit: 2,
                                                                },
                                                              };
                                                              null === u
                                                                ? (u = [e])
                                                                : u.push(e),
                                                                c++;
                                                            } else {
                                                              const e =
                                                                t.length;
                                                              if (e > 0) {
                                                                const e = c;
                                                                if (
                                                                  'string' !=
                                                                  typeof t[0]
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
                                                                var U = e === c;
                                                              }
                                                              if (U && e > 1) {
                                                                let e = t[1];
                                                                const r = c;
                                                                if (
                                                                  !e ||
                                                                  'object' !=
                                                                    typeof e ||
                                                                  Array.isArray(
                                                                    e,
                                                                  )
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
                                                                U = r === c;
                                                              }
                                                            }
                                                          else {
                                                            const e = {
                                                              params: {
                                                                type: 'array',
                                                              },
                                                            };
                                                            null === u
                                                              ? (u = [e])
                                                              : u.push(e),
                                                              c++;
                                                          }
                                                        (z = e === c),
                                                          (o = o || z);
                                                      }
                                                      if (!o) {
                                                        const e = {
                                                          params: {},
                                                        };
                                                        return (
                                                          null === u
                                                            ? (u = [e])
                                                            : u.push(e),
                                                          c++,
                                                          (D.errors = u),
                                                          !1
                                                        );
                                                      }
                                                      if (
                                                        ((c = n),
                                                        null !== u &&
                                                          (n
                                                            ? (u.length = n)
                                                            : (u = null)),
                                                        s !== c)
                                                      )
                                                        break;
                                                    }
                                                  }
                                                }
                                                b = t === c;
                                              } else b = !0;
                                              if (b) {
                                                if (
                                                  void 0 !== o.getPublicPath
                                                ) {
                                                  const e = c;
                                                  if (
                                                    'string' !=
                                                    typeof o.getPublicPath
                                                  )
                                                    return (
                                                      (D.errors = [
                                                        {
                                                          params: {
                                                            type: 'string',
                                                          },
                                                        },
                                                      ]),
                                                      !1
                                                    );
                                                  b = e === c;
                                                } else b = !0;
                                                if (b) {
                                                  if (
                                                    void 0 !== o.dataPrefetch
                                                  ) {
                                                    const e = c;
                                                    if (
                                                      'boolean' !=
                                                      typeof o.dataPrefetch
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
                                                    b = e === c;
                                                  } else b = !0;
                                                  if (b)
                                                    if (
                                                      void 0 !==
                                                      o.implementation
                                                    ) {
                                                      const e = c;
                                                      if (
                                                        'string' !=
                                                        typeof o.implementation
                                                      )
                                                        return (
                                                          (D.errors = [
                                                            {
                                                              params: {
                                                                type: 'string',
                                                              },
                                                            },
                                                          ]),
                                                          !1
                                                        );
                                                      b = e === c;
                                                    } else b = !0;
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
      }
    }
  }
  return (D.errors = u), 0 === c;
}
