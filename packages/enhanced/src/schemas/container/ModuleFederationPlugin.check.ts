// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
const e = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
export const validate = j;
export default j;
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
      async: { type: 'boolean' },
      exposes: { $ref: '#/definitions/Exposes' },
      filename: { type: 'string', absolutePath: !1, minLength: 1 },
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
          asyncStartup: { type: 'boolean' },
          externalRuntime: { type: 'boolean' },
          provideExternalRuntime: { type: 'boolean' },
        },
      },
      bridge: {
        type: 'object',
        properties: { disableAlias: { type: 'boolean', default: !1 } },
        additionalProperties: !1,
      },
      virtualRuntimeEntry: { type: 'boolean' },
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
  n = { anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }] },
  s = Object.prototype.hasOwnProperty;
function o(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  if (!Array.isArray(e))
    return (o.errors = [{ params: { type: 'array' } }]), !1;
  {
    const t = e.length;
    for (let r = 0; r < t; r++) {
      let t = e[r];
      const n = 0;
      if ('string' != typeof t)
        return (o.errors = [{ params: { type: 'string' } }]), !1;
      if (t.length < 1) return (o.errors = [{ params: {} }]), !1;
      if (0 !== n) break;
    }
  }
  return (o.errors = null), !0;
}
function a(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let i = null,
    l = 0;
  if (0 === l) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.import && (r = 'import'))
        return (a.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = l;
        for (const t in e)
          if ('import' !== t && 'name' !== t)
            return (a.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === l) {
          if (void 0 !== e.import) {
            let r = e.import;
            const n = l,
              y = l;
            let u = !1;
            const c = l;
            if (l == l)
              if ('string' == typeof r) {
                if (r.length < 1) {
                  const e = { params: {} };
                  null === i ? (i = [e]) : i.push(e), l++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === i ? (i = [e]) : i.push(e), l++;
              }
            var p = c === l;
            if (((u = u || p), !u)) {
              const n = l;
              o(r, {
                instancePath: t + '/import',
                parentData: e,
                parentDataProperty: 'import',
                rootData: s,
              }) ||
                ((i = null === i ? o.errors : i.concat(o.errors)),
                (l = i.length)),
                (p = n === l),
                (u = u || p);
            }
            if (!u) {
              const e = { params: {} };
              return (
                null === i ? (i = [e]) : i.push(e), l++, (a.errors = i), !1
              );
            }
            (l = y), null !== i && (y ? (i.length = y) : (i = null));
            var f = n === l;
          } else f = !0;
          if (f)
            if (void 0 !== e.name) {
              const t = l;
              if ('string' != typeof e.name)
                return (a.errors = [{ params: { type: 'string' } }]), !1;
              f = t === l;
            } else f = !0;
        }
      }
    }
  }
  return (a.errors = i), 0 === l;
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
    for (const r in e) {
      let n = e[r];
      const y = p,
        u = p;
      let c = !1;
      const m = p;
      a(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((l = null === l ? a.errors : l.concat(a.errors)), (p = l.length));
      var f = m === p;
      if (((c = c || f), !c)) {
        const a = p;
        if (p == p)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const e = { params: {} };
              null === l ? (l = [e]) : l.push(e), p++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === l ? (l = [e]) : l.push(e), p++;
          }
        if (((f = a === p), (c = c || f), !c)) {
          const a = p;
          o(n, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: s,
          }) ||
            ((l = null === l ? o.errors : l.concat(o.errors)), (p = l.length)),
            (f = a === p),
            (c = c || f);
        }
      }
      if (!c) {
        const e = { params: {} };
        return null === l ? (l = [e]) : l.push(e), p++, (i.errors = l), !1;
      }
      if (((p = u), null !== l && (u ? (l.length = u) : (l = null)), y !== p))
        break;
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
  let o = null,
    a = 0;
  const p = a;
  let f = !1;
  const y = a;
  if (a === y)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const l = a,
          p = a;
        let f = !1;
        const y = a;
        if (a == a)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), a++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), a++;
          }
        var u = y === a;
        if (((f = f || u), !f)) {
          const l = a;
          i(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((o = null === o ? i.errors : o.concat(i.errors)), (a = o.length)),
            (u = l === a),
            (f = f || u);
        }
        if (f) (a = p), null !== o && (p ? (o.length = p) : (o = null));
        else {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), a++;
        }
        if (l !== a) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), a++;
    }
  var c = y === a;
  if (((f = f || c), !f)) {
    const l = a;
    i(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((o = null === o ? i.errors : o.concat(i.errors)), (a = o.length)),
      (c = l === a),
      (f = f || c);
  }
  if (!f) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), a++, (l.errors = o), !1;
  }
  return (
    (a = p),
    null !== o && (p ? (o.length = p) : (o = null)),
    (l.errors = o),
    0 === a
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
  var y = p === a;
  if (((l = l || y), !l)) {
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
    (y = t === a), (l = l || y);
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), a++, (f.errors = o), !1;
  }
  return (
    (a = i),
    null !== o && (i ? (o.length = i) : (o = null)),
    (f.errors = o),
    0 === a
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
  let o = null,
    a = 0;
  const i = a;
  let l = !1;
  const p = a;
  if (a === p)
    if (Array.isArray(e))
      if (e.length < 1) {
        const e = { params: { limit: 1 } };
        null === o ? (o = [e]) : o.push(e), a++;
      } else {
        const t = e.length;
        for (let r = 0; r < t; r++) {
          let t = e[r];
          const n = a;
          if (a === n)
            if ('string' == typeof t) {
              if (t.length < 1) {
                const e = { params: {} };
                null === o ? (o = [e]) : o.push(e), a++;
              }
            } else {
              const e = { params: { type: 'string' } };
              null === o ? (o = [e]) : o.push(e), a++;
            }
          if (n !== a) break;
        }
      }
    else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), a++;
    }
  var f = p === a;
  if (((l = l || f), !l)) {
    const t = a;
    if (a === t)
      if ('string' == typeof e) {
        if (e.length < 1) {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), a++;
        }
      } else {
        const e = { params: { type: 'string' } };
        null === o ? (o = [e]) : o.push(e), a++;
      }
    if (((f = t === a), (l = l || f), !l)) {
      const t = a;
      if (a == a)
        if (e && 'object' == typeof e && !Array.isArray(e)) {
          const t = a;
          for (const t in e)
            if ('amd' !== t && 'commonjs' !== t && 'root' !== t) {
              const e = { params: { additionalProperty: t } };
              null === o ? (o = [e]) : o.push(e), a++;
              break;
            }
          if (t === a) {
            if (void 0 !== e.amd) {
              let t = e.amd;
              const r = a;
              if (a === r)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), a++;
                }
              var u = r === a;
            } else u = !0;
            if (u) {
              if (void 0 !== e.commonjs) {
                let t = e.commonjs;
                const r = a;
                if (a === r)
                  if ('string' == typeof t) {
                    if (t.length < 1) {
                      const e = { params: {} };
                      null === o ? (o = [e]) : o.push(e), a++;
                    }
                  } else {
                    const e = { params: { type: 'string' } };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                u = r === a;
              } else u = !0;
              if (u)
                if (void 0 !== e.root) {
                  let t = e.root;
                  const r = a,
                    n = a;
                  let s = !1;
                  const i = a;
                  if (a === i)
                    if (Array.isArray(t)) {
                      const e = t.length;
                      for (let r = 0; r < e; r++) {
                        let e = t[r];
                        const n = a;
                        if (a === n)
                          if ('string' == typeof e) {
                            if (e.length < 1) {
                              const e = { params: {} };
                              null === o ? (o = [e]) : o.push(e), a++;
                            }
                          } else {
                            const e = { params: { type: 'string' } };
                            null === o ? (o = [e]) : o.push(e), a++;
                          }
                        if (n !== a) break;
                      }
                    } else {
                      const e = { params: { type: 'array' } };
                      null === o ? (o = [e]) : o.push(e), a++;
                    }
                  var c = i === a;
                  if (((s = s || c), !s)) {
                    const e = a;
                    if (a === e)
                      if ('string' == typeof t) {
                        if (t.length < 1) {
                          const e = { params: {} };
                          null === o ? (o = [e]) : o.push(e), a++;
                        }
                      } else {
                        const e = { params: { type: 'string' } };
                        null === o ? (o = [e]) : o.push(e), a++;
                      }
                    (c = e === a), (s = s || c);
                  }
                  if (s)
                    (a = n), null !== o && (n ? (o.length = n) : (o = null));
                  else {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                  u = r === a;
                } else u = !0;
            }
          }
        } else {
          const e = { params: { type: 'object' } };
          null === o ? (o = [e]) : o.push(e), a++;
        }
      (f = t === a), (l = l || f);
    }
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), a++, (y.errors = o), !1;
  }
  return (
    (a = i),
    null !== o && (i ? (o.length = i) : (o = null)),
    (y.errors = o),
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
  let o = null,
    a = 0;
  if (0 === a) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (u.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.type && (r = 'type'))
        return (u.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = a;
        for (const t in e)
          if (
            'amdContainer' !== t &&
            'auxiliaryComment' !== t &&
            'export' !== t &&
            'name' !== t &&
            'type' !== t &&
            'umdNamedDefine' !== t
          )
            return (u.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === a) {
          if (void 0 !== e.amdContainer) {
            let t = e.amdContainer;
            const r = a;
            if (a == a) {
              if ('string' != typeof t)
                return (u.errors = [{ params: { type: 'string' } }]), !1;
              if (t.length < 1) return (u.errors = [{ params: {} }]), !1;
            }
            var i = r === a;
          } else i = !0;
          if (i) {
            if (void 0 !== e.auxiliaryComment) {
              const r = a;
              f(e.auxiliaryComment, {
                instancePath: t + '/auxiliaryComment',
                parentData: e,
                parentDataProperty: 'auxiliaryComment',
                rootData: s,
              }) ||
                ((o = null === o ? f.errors : o.concat(f.errors)),
                (a = o.length)),
                (i = r === a);
            } else i = !0;
            if (i) {
              if (void 0 !== e.export) {
                let t = e.export;
                const r = a,
                  n = a;
                let s = !1;
                const p = a;
                if (a === p)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let r = 0; r < e; r++) {
                      let e = t[r];
                      const n = a;
                      if (a === n)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === o ? (o = [e]) : o.push(e), a++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === o ? (o = [e]) : o.push(e), a++;
                        }
                      if (n !== a) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                var l = p === a;
                if (((s = s || l), !s)) {
                  const e = a;
                  if (a === e)
                    if ('string' == typeof t) {
                      if (t.length < 1) {
                        const e = { params: {} };
                        null === o ? (o = [e]) : o.push(e), a++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === o ? (o = [e]) : o.push(e), a++;
                    }
                  (l = e === a), (s = s || l);
                }
                if (!s) {
                  const e = { params: {} };
                  return (
                    null === o ? (o = [e]) : o.push(e), a++, (u.errors = o), !1
                  );
                }
                (a = n),
                  null !== o && (n ? (o.length = n) : (o = null)),
                  (i = r === a);
              } else i = !0;
              if (i) {
                if (void 0 !== e.name) {
                  const r = a;
                  y(e.name, {
                    instancePath: t + '/name',
                    parentData: e,
                    parentDataProperty: 'name',
                    rootData: s,
                  }) ||
                    ((o = null === o ? y.errors : o.concat(y.errors)),
                    (a = o.length)),
                    (i = r === a);
                } else i = !0;
                if (i) {
                  if (void 0 !== e.type) {
                    let t = e.type;
                    const r = a,
                      n = a;
                    let s = !1;
                    const l = a;
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
                      null === o ? (o = [e]) : o.push(e), a++;
                    }
                    var c = l === a;
                    if (((s = s || c), !s)) {
                      const e = a;
                      if ('string' != typeof t) {
                        const e = { params: { type: 'string' } };
                        null === o ? (o = [e]) : o.push(e), a++;
                      }
                      (c = e === a), (s = s || c);
                    }
                    if (!s) {
                      const e = { params: {} };
                      return (
                        null === o ? (o = [e]) : o.push(e),
                        a++,
                        (u.errors = o),
                        !1
                      );
                    }
                    (a = n),
                      null !== o && (n ? (o.length = n) : (o = null)),
                      (i = r === a);
                  } else i = !0;
                  if (i)
                    if (void 0 !== e.umdNamedDefine) {
                      const t = a;
                      if ('boolean' != typeof e.umdNamedDefine)
                        return (
                          (u.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      i = t === a;
                    } else i = !0;
                }
              }
            }
          }
        }
      }
    }
  }
  return (u.errors = o), 0 === a;
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
      if (t.length < 1) return (c.errors = [{ params: {} }]), !1;
      if (0 !== n) break;
    }
  }
  return (c.errors = null), !0;
}
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
  if (0 === a) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (m.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.external && (r = 'external'))
        return (m.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = a;
        for (const t in e)
          if ('external' !== t && 'shareScope' !== t)
            return (m.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === a) {
          if (void 0 !== e.external) {
            let r = e.external;
            const n = a,
              p = a;
            let f = !1;
            const y = a;
            if (a == a)
              if ('string' == typeof r) {
                if (r.length < 1) {
                  const e = { params: {} };
                  null === o ? (o = [e]) : o.push(e), a++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === o ? (o = [e]) : o.push(e), a++;
              }
            var i = y === a;
            if (((f = f || i), !f)) {
              const n = a;
              c(r, {
                instancePath: t + '/external',
                parentData: e,
                parentDataProperty: 'external',
                rootData: s,
              }) ||
                ((o = null === o ? c.errors : o.concat(c.errors)),
                (a = o.length)),
                (i = n === a),
                (f = f || i);
            }
            if (!f) {
              const e = { params: {} };
              return (
                null === o ? (o = [e]) : o.push(e), a++, (m.errors = o), !1
              );
            }
            (a = p), null !== o && (p ? (o.length = p) : (o = null));
            var l = n === a;
          } else l = !0;
          if (l)
            if (void 0 !== e.shareScope) {
              let t = e.shareScope;
              const r = a,
                n = a;
              let s = !1;
              const i = a;
              if (a === i)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), a++;
                }
              var p = i === a;
              if (((s = s || p), !s)) {
                const e = a;
                if (a === e)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let r = 0; r < e; r++) {
                      let e = t[r];
                      const n = a;
                      if (a === n)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === o ? (o = [e]) : o.push(e), a++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === o ? (o = [e]) : o.push(e), a++;
                        }
                      if (n !== a) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === o ? (o = [e]) : o.push(e), a++;
                  }
                (p = e === a), (s = s || p);
              }
              if (!s) {
                const e = { params: {} };
                return (
                  null === o ? (o = [e]) : o.push(e), a++, (m.errors = o), !1
                );
              }
              (a = n),
                null !== o && (n ? (o.length = n) : (o = null)),
                (l = r === a);
            } else l = !0;
        }
      }
    }
  }
  return (m.errors = o), 0 === a;
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
  let o = null,
    a = 0;
  if (0 === a) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (g.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let n = e[r];
      const l = a,
        p = a;
      let f = !1;
      const y = a;
      m(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((o = null === o ? m.errors : o.concat(m.errors)), (a = o.length));
      var i = y === a;
      if (((f = f || i), !f)) {
        const l = a;
        if (a == a)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), a++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), a++;
          }
        if (((i = l === a), (f = f || i), !f)) {
          const l = a;
          c(n, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: s,
          }) ||
            ((o = null === o ? c.errors : o.concat(c.errors)), (a = o.length)),
            (i = l === a),
            (f = f || i);
        }
      }
      if (!f) {
        const e = { params: {} };
        return null === o ? (o = [e]) : o.push(e), a++, (g.errors = o), !1;
      }
      if (((a = p), null !== o && (p ? (o.length = p) : (o = null)), l !== a))
        break;
    }
  }
  return (g.errors = o), 0 === a;
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
  let o = null,
    a = 0;
  const i = a;
  let l = !1;
  const p = a;
  if (a === p)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const i = a,
          l = a;
        let p = !1;
        const y = a;
        if (a == a)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), a++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), a++;
          }
        var f = y === a;
        if (((p = p || f), !p)) {
          const i = a;
          g(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((o = null === o ? g.errors : o.concat(g.errors)), (a = o.length)),
            (f = i === a),
            (p = p || f);
        }
        if (p) (a = l), null !== o && (l ? (o.length = l) : (o = null));
        else {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), a++;
        }
        if (i !== a) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), a++;
    }
  var y = p === a;
  if (((l = l || y), !l)) {
    const i = a;
    g(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((o = null === o ? g.errors : o.concat(g.errors)), (a = o.length)),
      (y = i === a),
      (l = l || y);
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), a++, (h.errors = o), !1;
  }
  return (
    (a = i),
    null !== o && (i ? (o.length = i) : (o = null)),
    (h.errors = o),
    0 === a
  );
}
const d = {
  type: 'object',
  additionalProperties: !1,
  properties: {
    eager: { type: 'boolean' },
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
    singleton: { type: 'boolean' },
    strictVersion: { type: 'boolean' },
    version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
  },
};
function b(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: o = e,
  } = {},
) {
  let a = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (b.errors = [{ params: { type: 'object' } }]), !1;
    {
      const t = i;
      for (const t in e)
        if (!s.call(d.properties, t))
          return (b.errors = [{ params: { additionalProperty: t } }]), !1;
      if (t === i) {
        if (void 0 !== e.eager) {
          const t = i;
          if ('boolean' != typeof e.eager)
            return (b.errors = [{ params: { type: 'boolean' } }]), !1;
          var l = t === i;
        } else l = !0;
        if (l) {
          if (void 0 !== e.import) {
            let t = e.import;
            const r = i,
              n = i;
            let s = !1;
            const o = i;
            if (!1 !== t) {
              const e = {
                params: { allowedValues: d.properties.import.anyOf[0].enum },
              };
              null === a ? (a = [e]) : a.push(e), i++;
            }
            var p = o === i;
            if (((s = s || p), !s)) {
              const e = i;
              if (i == i)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
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
                null === a ? (a = [e]) : a.push(e), i++, (b.errors = a), !1
              );
            }
            (i = n),
              null !== a && (n ? (a.length = n) : (a = null)),
              (l = r === i);
          } else l = !0;
          if (l) {
            if (void 0 !== e.request) {
              let t = e.request;
              const r = i;
              if (i === r) {
                if ('string' != typeof t)
                  return (b.errors = [{ params: { type: 'string' } }]), !1;
                if (t.length < 1) return (b.errors = [{ params: {} }]), !1;
              }
              l = r === i;
            } else l = !0;
            if (l) {
              if (void 0 !== e.layer) {
                let t = e.layer;
                const r = i;
                if (i === r) {
                  if ('string' != typeof t)
                    return (b.errors = [{ params: { type: 'string' } }]), !1;
                  if (t.length < 1) return (b.errors = [{ params: {} }]), !1;
                }
                l = r === i;
              } else l = !0;
              if (l) {
                if (void 0 !== e.issuerLayer) {
                  let t = e.issuerLayer;
                  const r = i;
                  if (i === r) {
                    if ('string' != typeof t)
                      return (b.errors = [{ params: { type: 'string' } }]), !1;
                    if (t.length < 1) return (b.errors = [{ params: {} }]), !1;
                  }
                  l = r === i;
                } else l = !0;
                if (l) {
                  if (void 0 !== e.packageName) {
                    let t = e.packageName;
                    const r = i;
                    if (i === r) {
                      if ('string' != typeof t)
                        return (
                          (b.errors = [{ params: { type: 'string' } }]), !1
                        );
                      if (t.length < 1)
                        return (b.errors = [{ params: {} }]), !1;
                    }
                    l = r === i;
                  } else l = !0;
                  if (l) {
                    if (void 0 !== e.requiredVersion) {
                      let t = e.requiredVersion;
                      const r = i,
                        n = i;
                      let s = !1;
                      const o = i;
                      if (!1 !== t) {
                        const e = {
                          params: {
                            allowedValues:
                              d.properties.requiredVersion.anyOf[0].enum,
                          },
                        };
                        null === a ? (a = [e]) : a.push(e), i++;
                      }
                      var f = o === i;
                      if (((s = s || f), !s)) {
                        const e = i;
                        if ('string' != typeof t) {
                          const e = { params: { type: 'string' } };
                          null === a ? (a = [e]) : a.push(e), i++;
                        }
                        (f = e === i), (s = s || f);
                      }
                      if (!s) {
                        const e = { params: {} };
                        return (
                          null === a ? (a = [e]) : a.push(e),
                          i++,
                          (b.errors = a),
                          !1
                        );
                      }
                      (i = n),
                        null !== a && (n ? (a.length = n) : (a = null)),
                        (l = r === i);
                    } else l = !0;
                    if (l) {
                      if (void 0 !== e.shareKey) {
                        let t = e.shareKey;
                        const r = i;
                        if (i === r) {
                          if ('string' != typeof t)
                            return (
                              (b.errors = [{ params: { type: 'string' } }]), !1
                            );
                          if (t.length < 1)
                            return (b.errors = [{ params: {} }]), !1;
                        }
                        l = r === i;
                      } else l = !0;
                      if (l) {
                        if (void 0 !== e.shareScope) {
                          let t = e.shareScope;
                          const r = i,
                            n = i;
                          let s = !1;
                          const o = i;
                          if (i === o)
                            if ('string' == typeof t) {
                              if (t.length < 1) {
                                const e = { params: {} };
                                null === a ? (a = [e]) : a.push(e), i++;
                              }
                            } else {
                              const e = { params: { type: 'string' } };
                              null === a ? (a = [e]) : a.push(e), i++;
                            }
                          var y = o === i;
                          if (((s = s || y), !s)) {
                            const e = i;
                            if (i === e)
                              if (Array.isArray(t)) {
                                const e = t.length;
                                for (let r = 0; r < e; r++) {
                                  let e = t[r];
                                  const n = i;
                                  if (i === n)
                                    if ('string' == typeof e) {
                                      if (e.length < 1) {
                                        const e = { params: {} };
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
                            (y = e === i), (s = s || y);
                          }
                          if (!s) {
                            const e = { params: {} };
                            return (
                              null === a ? (a = [e]) : a.push(e),
                              i++,
                              (b.errors = a),
                              !1
                            );
                          }
                          (i = n),
                            null !== a && (n ? (a.length = n) : (a = null)),
                            (l = r === i);
                        } else l = !0;
                        if (l) {
                          if (void 0 !== e.singleton) {
                            const t = i;
                            if ('boolean' != typeof e.singleton)
                              return (
                                (b.errors = [{ params: { type: 'boolean' } }]),
                                !1
                              );
                            l = t === i;
                          } else l = !0;
                          if (l) {
                            if (void 0 !== e.strictVersion) {
                              const t = i;
                              if ('boolean' != typeof e.strictVersion)
                                return (
                                  (b.errors = [
                                    { params: { type: 'boolean' } },
                                  ]),
                                  !1
                                );
                              l = t === i;
                            } else l = !0;
                            if (l)
                              if (void 0 !== e.version) {
                                let t = e.version;
                                const r = i,
                                  n = i;
                                let s = !1;
                                const o = i;
                                if (!1 !== t) {
                                  const e = {
                                    params: {
                                      allowedValues:
                                        d.properties.version.anyOf[0].enum,
                                    },
                                  };
                                  null === a ? (a = [e]) : a.push(e), i++;
                                }
                                var u = o === i;
                                if (((s = s || u), !s)) {
                                  const e = i;
                                  if ('string' != typeof t) {
                                    const e = { params: { type: 'string' } };
                                    null === a ? (a = [e]) : a.push(e), i++;
                                  }
                                  (u = e === i), (s = s || u);
                                }
                                if (!s) {
                                  const e = { params: {} };
                                  return (
                                    null === a ? (a = [e]) : a.push(e),
                                    i++,
                                    (b.errors = a),
                                    !1
                                  );
                                }
                                (i = n),
                                  null !== a &&
                                    (n ? (a.length = n) : (a = null)),
                                  (l = r === i);
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
  return (b.errors = a), 0 === i;
}
function v(
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
  if (0 === a) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (v.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let n = e[r];
      const l = a,
        p = a;
      let f = !1;
      const y = a;
      b(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((o = null === o ? b.errors : o.concat(b.errors)), (a = o.length));
      var i = y === a;
      if (((f = f || i), !f)) {
        const e = a;
        if (a == a)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), a++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), a++;
          }
        (i = e === a), (f = f || i);
      }
      if (!f) {
        const e = { params: {} };
        return null === o ? (o = [e]) : o.push(e), a++, (v.errors = o), !1;
      }
      if (((a = p), null !== o && (p ? (o.length = p) : (o = null)), l !== a))
        break;
    }
  }
  return (v.errors = o), 0 === a;
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
  let o = null,
    a = 0;
  const i = a;
  let l = !1;
  const p = a;
  if (a === p)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const i = a,
          l = a;
        let p = !1;
        const y = a;
        if (a == a)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), a++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), a++;
          }
        var f = y === a;
        if (((p = p || f), !p)) {
          const i = a;
          v(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((o = null === o ? v.errors : o.concat(v.errors)), (a = o.length)),
            (f = i === a),
            (p = p || f);
        }
        if (p) (a = l), null !== o && (l ? (o.length = l) : (o = null));
        else {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), a++;
        }
        if (i !== a) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), a++;
    }
  var y = p === a;
  if (((l = l || y), !l)) {
    const i = a;
    v(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((o = null === o ? v.errors : o.concat(v.errors)), (a = o.length)),
      (y = i === a),
      (l = l || y);
  }
  if (!l) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), a++, (P.errors = o), !1;
  }
  return (
    (a = i),
    null !== o && (i ? (o.length = i) : (o = null)),
    (P.errors = o),
    0 === a
  );
}
function j(
  o,
  {
    instancePath: a = '',
    parentData: i,
    parentDataProperty: p,
    rootData: f = o,
  } = {},
) {
  let y = null,
    c = 0;
  if (0 === c) {
    if (!o || 'object' != typeof o || Array.isArray(o))
      return (j.errors = [{ params: { type: 'object' } }]), !1;
    {
      const i = c;
      for (const e in o)
        if (!s.call(t.properties, e))
          return (j.errors = [{ params: { additionalProperty: e } }]), !1;
      if (i === c) {
        if (void 0 !== o.async) {
          const e = c;
          if ('boolean' != typeof o.async)
            return (j.errors = [{ params: { type: 'boolean' } }]), !1;
          var m = e === c;
        } else m = !0;
        if (m) {
          if (void 0 !== o.exposes) {
            const e = c;
            l(o.exposes, {
              instancePath: a + '/exposes',
              parentData: o,
              parentDataProperty: 'exposes',
              rootData: f,
            }) ||
              ((y = null === y ? l.errors : y.concat(l.errors)),
              (c = y.length)),
              (m = e === c);
          } else m = !0;
          if (m) {
            if (void 0 !== o.filename) {
              let t = o.filename;
              const r = c;
              if (c === r) {
                if ('string' != typeof t)
                  return (j.errors = [{ params: { type: 'string' } }]), !1;
                if (t.length < 1) return (j.errors = [{ params: {} }]), !1;
                if (t.includes('!') || !1 !== e.test(t))
                  return (j.errors = [{ params: {} }]), !1;
              }
              m = r === c;
            } else m = !0;
            if (m) {
              if (void 0 !== o.library) {
                const e = c;
                u(o.library, {
                  instancePath: a + '/library',
                  parentData: o,
                  parentDataProperty: 'library',
                  rootData: f,
                }) ||
                  ((y = null === y ? u.errors : y.concat(u.errors)),
                  (c = y.length)),
                  (m = e === c);
              } else m = !0;
              if (m) {
                if (void 0 !== o.name) {
                  let e = o.name;
                  const t = c;
                  if (c === t) {
                    if ('string' != typeof e)
                      return (j.errors = [{ params: { type: 'string' } }]), !1;
                    if (e.length < 1) return (j.errors = [{ params: {} }]), !1;
                  }
                  m = t === c;
                } else m = !0;
                if (m) {
                  if (void 0 !== o.remoteType) {
                    let e = o.remoteType;
                    const t = c,
                      n = c;
                    let s = !1,
                      a = null;
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
                      'module-import' !== e &&
                      'script' !== e &&
                      'node-commonjs' !== e
                    ) {
                      const e = { params: { allowedValues: r.enum } };
                      null === y ? (y = [e]) : y.push(e), c++;
                    }
                    if ((i === c && ((s = !0), (a = 0)), !s)) {
                      const e = { params: { passingSchemas: a } };
                      return (
                        null === y ? (y = [e]) : y.push(e),
                        c++,
                        (j.errors = y),
                        !1
                      );
                    }
                    (c = n),
                      null !== y && (n ? (y.length = n) : (y = null)),
                      (m = t === c);
                  } else m = !0;
                  if (m) {
                    if (void 0 !== o.remotes) {
                      const e = c;
                      h(o.remotes, {
                        instancePath: a + '/remotes',
                        parentData: o,
                        parentDataProperty: 'remotes',
                        rootData: f,
                      }) ||
                        ((y = null === y ? h.errors : y.concat(h.errors)),
                        (c = y.length)),
                        (m = e === c);
                    } else m = !0;
                    if (m) {
                      if (void 0 !== o.runtime) {
                        let e = o.runtime;
                        const t = c,
                          r = c;
                        let s = !1;
                        const a = c;
                        if (!1 !== e) {
                          const e = {
                            params: { allowedValues: n.anyOf[0].enum },
                          };
                          null === y ? (y = [e]) : y.push(e), c++;
                        }
                        var g = a === c;
                        if (((s = s || g), !s)) {
                          const t = c;
                          if (c === t)
                            if ('string' == typeof e) {
                              if (e.length < 1) {
                                const e = { params: {} };
                                null === y ? (y = [e]) : y.push(e), c++;
                              }
                            } else {
                              const e = { params: { type: 'string' } };
                              null === y ? (y = [e]) : y.push(e), c++;
                            }
                          (g = t === c), (s = s || g);
                        }
                        if (!s) {
                          const e = { params: {} };
                          return (
                            null === y ? (y = [e]) : y.push(e),
                            c++,
                            (j.errors = y),
                            !1
                          );
                        }
                        (c = r),
                          null !== y && (r ? (y.length = r) : (y = null)),
                          (m = t === c);
                      } else m = !0;
                      if (m) {
                        if (void 0 !== o.shareScope) {
                          let e = o.shareScope;
                          const t = c,
                            r = c;
                          let n = !1;
                          const s = c;
                          if (c === s)
                            if ('string' == typeof e) {
                              if (e.length < 1) {
                                const e = { params: {} };
                                null === y ? (y = [e]) : y.push(e), c++;
                              }
                            } else {
                              const e = { params: { type: 'string' } };
                              null === y ? (y = [e]) : y.push(e), c++;
                            }
                          var d = s === c;
                          if (((n = n || d), !n)) {
                            const t = c;
                            if (c === t)
                              if (Array.isArray(e)) {
                                const t = e.length;
                                for (let r = 0; r < t; r++) {
                                  let t = e[r];
                                  const n = c;
                                  if (c === n)
                                    if ('string' == typeof t) {
                                      if (t.length < 1) {
                                        const e = { params: {} };
                                        null === y ? (y = [e]) : y.push(e), c++;
                                      }
                                    } else {
                                      const e = { params: { type: 'string' } };
                                      null === y ? (y = [e]) : y.push(e), c++;
                                    }
                                  if (n !== c) break;
                                }
                              } else {
                                const e = { params: { type: 'array' } };
                                null === y ? (y = [e]) : y.push(e), c++;
                              }
                            (d = t === c), (n = n || d);
                          }
                          if (!n) {
                            const e = { params: {} };
                            return (
                              null === y ? (y = [e]) : y.push(e),
                              c++,
                              (j.errors = y),
                              !1
                            );
                          }
                          (c = r),
                            null !== y && (r ? (y.length = r) : (y = null)),
                            (m = t === c);
                        } else m = !0;
                        if (m) {
                          if (void 0 !== o.shareStrategy) {
                            let e = o.shareStrategy;
                            const r = c;
                            if ('string' != typeof e)
                              return (
                                (j.errors = [{ params: { type: 'string' } }]),
                                !1
                              );
                            if ('version-first' !== e && 'loaded-first' !== e)
                              return (
                                (j.errors = [
                                  {
                                    params: {
                                      allowedValues:
                                        t.properties.shareStrategy.enum,
                                    },
                                  },
                                ]),
                                !1
                              );
                            m = r === c;
                          } else m = !0;
                          if (m) {
                            if (void 0 !== o.shared) {
                              const e = c;
                              P(o.shared, {
                                instancePath: a + '/shared',
                                parentData: o,
                                parentDataProperty: 'shared',
                                rootData: f,
                              }) ||
                                ((y =
                                  null === y ? P.errors : y.concat(P.errors)),
                                (c = y.length)),
                                (m = e === c);
                            } else m = !0;
                            if (m) {
                              if (void 0 !== o.dts) {
                                let e = o.dts;
                                const r = c,
                                  n = c;
                                let s = !1;
                                const a = c;
                                if ('boolean' != typeof e) {
                                  const e = { params: { type: 'boolean' } };
                                  null === y ? (y = [e]) : y.push(e), c++;
                                }
                                var b = a === c;
                                if (((s = s || b), !s)) {
                                  const r = c;
                                  if (c === r)
                                    if (
                                      e &&
                                      'object' == typeof e &&
                                      !Array.isArray(e)
                                    ) {
                                      if (void 0 !== e.generateTypes) {
                                        let r = e.generateTypes;
                                        const n = c,
                                          s = c;
                                        let o = !1;
                                        const a = c;
                                        if ('boolean' != typeof r) {
                                          const e = {
                                            params: { type: 'boolean' },
                                          };
                                          null === y ? (y = [e]) : y.push(e),
                                            c++;
                                        }
                                        var v = a === c;
                                        if (((o = o || v), !o)) {
                                          const e = c;
                                          if (c === e)
                                            if (
                                              r &&
                                              'object' == typeof r &&
                                              !Array.isArray(r)
                                            ) {
                                              if (void 0 !== r.tsConfigPath) {
                                                const e = c;
                                                if (
                                                  'string' !=
                                                  typeof r.tsConfigPath
                                                ) {
                                                  const e = {
                                                    params: { type: 'string' },
                                                  };
                                                  null === y
                                                    ? (y = [e])
                                                    : y.push(e),
                                                    c++;
                                                }
                                                var D = e === c;
                                              } else D = !0;
                                              if (D) {
                                                if (void 0 !== r.typesFolder) {
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
                                                    null === y
                                                      ? (y = [e])
                                                      : y.push(e),
                                                      c++;
                                                  }
                                                  D = e === c;
                                                } else D = !0;
                                                if (D) {
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
                                                      null === y
                                                        ? (y = [e])
                                                        : y.push(e),
                                                        c++;
                                                    }
                                                    D = e === c;
                                                  } else D = !0;
                                                  if (D) {
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
                                                        null === y
                                                          ? (y = [e])
                                                          : y.push(e),
                                                          c++;
                                                      }
                                                      D = e === c;
                                                    } else D = !0;
                                                    if (D) {
                                                      if (
                                                        void 0 !==
                                                        r.additionalFilesToCompile
                                                      ) {
                                                        let e =
                                                          r.additionalFilesToCompile;
                                                        const t = c;
                                                        if (c === t)
                                                          if (
                                                            Array.isArray(e)
                                                          ) {
                                                            const t = e.length;
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
                                                                null === y
                                                                  ? (y = [e])
                                                                  : y.push(e),
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
                                                            null === y
                                                              ? (y = [e])
                                                              : y.push(e),
                                                              c++;
                                                          }
                                                        D = t === c;
                                                      } else D = !0;
                                                      if (D) {
                                                        if (
                                                          void 0 !==
                                                          r.compileInChildProcess
                                                        ) {
                                                          const e = c;
                                                          if (
                                                            'boolean' !=
                                                            typeof r.compileInChildProcess
                                                          ) {
                                                            const e = {
                                                              params: {
                                                                type: 'boolean',
                                                              },
                                                            };
                                                            null === y
                                                              ? (y = [e])
                                                              : y.push(e),
                                                              c++;
                                                          }
                                                          D = e === c;
                                                        } else D = !0;
                                                        if (D) {
                                                          if (
                                                            void 0 !==
                                                            r.compilerInstance
                                                          ) {
                                                            let e =
                                                              r.compilerInstance;
                                                            const n = c;
                                                            if (
                                                              'tsc' !== e &&
                                                              'vue-tsc' !== e
                                                            ) {
                                                              const e = {
                                                                params: {
                                                                  allowedValues:
                                                                    t.properties
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
                                                              null === y
                                                                ? (y = [e])
                                                                : y.push(e),
                                                                c++;
                                                            }
                                                            D = n === c;
                                                          } else D = !0;
                                                          if (D) {
                                                            if (
                                                              void 0 !==
                                                              r.generateAPITypes
                                                            ) {
                                                              const e = c;
                                                              if (
                                                                'boolean' !=
                                                                typeof r.generateAPITypes
                                                              ) {
                                                                const e = {
                                                                  params: {
                                                                    type: 'boolean',
                                                                  },
                                                                };
                                                                null === y
                                                                  ? (y = [e])
                                                                  : y.push(e),
                                                                  c++;
                                                              }
                                                              D = e === c;
                                                            } else D = !0;
                                                            if (D) {
                                                              if (
                                                                void 0 !==
                                                                r.extractThirdParty
                                                              ) {
                                                                const e = c;
                                                                if (
                                                                  'boolean' !=
                                                                  typeof r.extractThirdParty
                                                                ) {
                                                                  const e = {
                                                                    params: {
                                                                      type: 'boolean',
                                                                    },
                                                                  };
                                                                  null === y
                                                                    ? (y = [e])
                                                                    : y.push(e),
                                                                    c++;
                                                                }
                                                                D = e === c;
                                                              } else D = !0;
                                                              if (D) {
                                                                if (
                                                                  void 0 !==
                                                                  r.extractRemoteTypes
                                                                ) {
                                                                  const e = c;
                                                                  if (
                                                                    'boolean' !=
                                                                    typeof r.extractRemoteTypes
                                                                  ) {
                                                                    const e = {
                                                                      params: {
                                                                        type: 'boolean',
                                                                      },
                                                                    };
                                                                    null === y
                                                                      ? (y = [
                                                                          e,
                                                                        ])
                                                                      : y.push(
                                                                          e,
                                                                        ),
                                                                      c++;
                                                                  }
                                                                  D = e === c;
                                                                } else D = !0;
                                                                if (D)
                                                                  if (
                                                                    void 0 !==
                                                                    r.abortOnError
                                                                  ) {
                                                                    const e = c;
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
                                                                      null === y
                                                                        ? (y = [
                                                                            e,
                                                                          ])
                                                                        : y.push(
                                                                            e,
                                                                          ),
                                                                        c++;
                                                                    }
                                                                    D = e === c;
                                                                  } else D = !0;
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
                                              null === y
                                                ? (y = [e])
                                                : y.push(e),
                                                c++;
                                            }
                                          (v = e === c), (o = o || v);
                                        }
                                        if (o)
                                          (c = s),
                                            null !== y &&
                                              (s ? (y.length = s) : (y = null));
                                        else {
                                          const e = { params: {} };
                                          null === y ? (y = [e]) : y.push(e),
                                            c++;
                                        }
                                        var A = n === c;
                                      } else A = !0;
                                      if (A) {
                                        if (void 0 !== e.consumeTypes) {
                                          let t = e.consumeTypes;
                                          const r = c,
                                            n = c;
                                          let s = !1;
                                          const o = c;
                                          if ('boolean' != typeof t) {
                                            const e = {
                                              params: { type: 'boolean' },
                                            };
                                            null === y ? (y = [e]) : y.push(e),
                                              c++;
                                          }
                                          var x = o === c;
                                          if (((s = s || x), !s)) {
                                            const e = c;
                                            if (c === e)
                                              if (
                                                t &&
                                                'object' == typeof t &&
                                                !Array.isArray(t)
                                              ) {
                                                if (void 0 !== t.typesFolder) {
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
                                                    null === y
                                                      ? (y = [e])
                                                      : y.push(e),
                                                      c++;
                                                  }
                                                  var O = e === c;
                                                } else O = !0;
                                                if (O) {
                                                  if (
                                                    void 0 !== t.abortOnError
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
                                                      null === y
                                                        ? (y = [e])
                                                        : y.push(e),
                                                        c++;
                                                    }
                                                    O = e === c;
                                                  } else O = !0;
                                                  if (O) {
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
                                                        null === y
                                                          ? (y = [e])
                                                          : y.push(e),
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
                                                          null === y
                                                            ? (y = [e])
                                                            : y.push(e),
                                                            c++;
                                                        }
                                                        O = e === c;
                                                      } else O = !0;
                                                      if (O) {
                                                        if (
                                                          void 0 !==
                                                          t.maxRetries
                                                        ) {
                                                          const e = c;
                                                          if (
                                                            'number' !=
                                                            typeof t.maxRetries
                                                          ) {
                                                            const e = {
                                                              params: {
                                                                type: 'number',
                                                              },
                                                            };
                                                            null === y
                                                              ? (y = [e])
                                                              : y.push(e),
                                                              c++;
                                                          }
                                                          O = e === c;
                                                        } else O = !0;
                                                        if (O) {
                                                          if (
                                                            void 0 !==
                                                            t.consumeAPITypes
                                                          ) {
                                                            const e = c;
                                                            if (
                                                              'boolean' !=
                                                              typeof t.consumeAPITypes
                                                            ) {
                                                              const e = {
                                                                params: {
                                                                  type: 'boolean',
                                                                },
                                                              };
                                                              null === y
                                                                ? (y = [e])
                                                                : y.push(e),
                                                                c++;
                                                            }
                                                            O = e === c;
                                                          } else O = !0;
                                                          if (O)
                                                            if (
                                                              void 0 !==
                                                              t.runtimePkgs
                                                            ) {
                                                              let e =
                                                                t.runtimePkgs;
                                                              const r = c;
                                                              if (c === r)
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
                                                                    const t = c;
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
                                                                      null === y
                                                                        ? (y = [
                                                                            e,
                                                                          ])
                                                                        : y.push(
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
                                                                  null === y
                                                                    ? (y = [e])
                                                                    : y.push(e),
                                                                    c++;
                                                                }
                                                              O = r === c;
                                                            } else O = !0;
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              } else {
                                                const e = {
                                                  params: { type: 'object' },
                                                };
                                                null === y
                                                  ? (y = [e])
                                                  : y.push(e),
                                                  c++;
                                              }
                                            (x = e === c), (s = s || x);
                                          }
                                          if (s)
                                            (c = n),
                                              null !== y &&
                                                (n
                                                  ? (y.length = n)
                                                  : (y = null));
                                          else {
                                            const e = { params: {} };
                                            null === y ? (y = [e]) : y.push(e),
                                              c++;
                                          }
                                          A = r === c;
                                        } else A = !0;
                                        if (A) {
                                          if (void 0 !== e.tsConfigPath) {
                                            const t = c;
                                            if (
                                              'string' != typeof e.tsConfigPath
                                            ) {
                                              const e = {
                                                params: { type: 'string' },
                                              };
                                              null === y
                                                ? (y = [e])
                                                : y.push(e),
                                                c++;
                                            }
                                            A = t === c;
                                          } else A = !0;
                                          if (A) {
                                            if (void 0 !== e.extraOptions) {
                                              let t = e.extraOptions;
                                              const r = c;
                                              if (
                                                !t ||
                                                'object' != typeof t ||
                                                Array.isArray(t)
                                              ) {
                                                const e = {
                                                  params: { type: 'object' },
                                                };
                                                null === y
                                                  ? (y = [e])
                                                  : y.push(e),
                                                  c++;
                                              }
                                              A = r === c;
                                            } else A = !0;
                                            if (A) {
                                              if (void 0 !== e.implementation) {
                                                const t = c;
                                                if (
                                                  'string' !=
                                                  typeof e.implementation
                                                ) {
                                                  const e = {
                                                    params: { type: 'string' },
                                                  };
                                                  null === y
                                                    ? (y = [e])
                                                    : y.push(e),
                                                    c++;
                                                }
                                                A = t === c;
                                              } else A = !0;
                                              if (A) {
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
                                                    null === y
                                                      ? (y = [e])
                                                      : y.push(e),
                                                      c++;
                                                  }
                                                  A = t === c;
                                                } else A = !0;
                                                if (A)
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
                                                      null === y
                                                        ? (y = [e])
                                                        : y.push(e),
                                                        c++;
                                                    }
                                                    A = t === c;
                                                  } else A = !0;
                                              }
                                            }
                                          }
                                        }
                                      }
                                    } else {
                                      const e = { params: { type: 'object' } };
                                      null === y ? (y = [e]) : y.push(e), c++;
                                    }
                                  (b = r === c), (s = s || b);
                                }
                                if (!s) {
                                  const e = { params: {} };
                                  return (
                                    null === y ? (y = [e]) : y.push(e),
                                    c++,
                                    (j.errors = y),
                                    !1
                                  );
                                }
                                (c = n),
                                  null !== y &&
                                    (n ? (y.length = n) : (y = null)),
                                  (m = r === c);
                              } else m = !0;
                              if (m) {
                                if (void 0 !== o.experiments) {
                                  let e = o.experiments;
                                  const t = c;
                                  if (c === t) {
                                    if (
                                      !e ||
                                      'object' != typeof e ||
                                      Array.isArray(e)
                                    )
                                      return (
                                        (j.errors = [
                                          { params: { type: 'object' } },
                                        ]),
                                        !1
                                      );
                                    if (void 0 !== e.asyncStartup) {
                                      const t = c;
                                      if ('boolean' != typeof e.asyncStartup)
                                        return (
                                          (j.errors = [
                                            { params: { type: 'boolean' } },
                                          ]),
                                          !1
                                        );
                                      var L = t === c;
                                    } else L = !0;
                                    if (L) {
                                      if (void 0 !== e.externalRuntime) {
                                        const t = c;
                                        if (
                                          'boolean' != typeof e.externalRuntime
                                        )
                                          return (
                                            (j.errors = [
                                              { params: { type: 'boolean' } },
                                            ]),
                                            !1
                                          );
                                        L = t === c;
                                      } else L = !0;
                                      if (L)
                                        if (
                                          void 0 !== e.provideExternalRuntime
                                        ) {
                                          const t = c;
                                          if (
                                            'boolean' !=
                                            typeof e.provideExternalRuntime
                                          )
                                            return (
                                              (j.errors = [
                                                { params: { type: 'boolean' } },
                                              ]),
                                              !1
                                            );
                                          L = t === c;
                                        } else L = !0;
                                    }
                                  }
                                  m = t === c;
                                } else m = !0;
                                if (m) {
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
                                          (j.errors = [
                                            { params: { type: 'object' } },
                                          ]),
                                          !1
                                        );
                                      {
                                        const t = c;
                                        for (const t in e)
                                          if ('disableAlias' !== t)
                                            return (
                                              (j.errors = [
                                                {
                                                  params: {
                                                    additionalProperty: t,
                                                  },
                                                },
                                              ]),
                                              !1
                                            );
                                        if (
                                          t === c &&
                                          void 0 !== e.disableAlias &&
                                          'boolean' != typeof e.disableAlias
                                        )
                                          return (
                                            (j.errors = [
                                              { params: { type: 'boolean' } },
                                            ]),
                                            !1
                                          );
                                      }
                                    }
                                    m = t === c;
                                  } else m = !0;
                                  if (m)
                                    if (void 0 !== o.virtualRuntimeEntry) {
                                      const e = c;
                                      if (
                                        'boolean' !=
                                        typeof o.virtualRuntimeEntry
                                      )
                                        return (
                                          (j.errors = [
                                            { params: { type: 'boolean' } },
                                          ]),
                                          !1
                                        );
                                      m = e === c;
                                    } else m = !0;
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
  return (j.errors = y), 0 === c;
}
