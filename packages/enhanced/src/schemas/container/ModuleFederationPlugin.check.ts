// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
const e = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
export const validate = P;
export default P;
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
      experiments: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          federationRuntime: { oneOf: [{ enum: [!1] }, { enum: ['hoisted'] }] },
          externalRuntime: { type: 'boolean', default: !1 },
          provideExternalRuntime: { type: 'boolean', default: !1 },
        },
      },
      runtimePlugins: { type: 'array', items: { type: 'string' } },
      getPublicPath: { type: 'string' },
      implementation: { type: 'string' },
      manifest: { oneOf: [{ type: 'boolean' }, { type: 'object' }] },
      dev: { oneOf: [{ type: 'boolean' }, { type: 'object' }] },
      dts: { oneOf: [{ type: 'boolean' }, { type: 'object' }] },
      dataPrefetch: { type: 'boolean' },
      virtualRuntimeEntry: { type: 'boolean' },
      bridge: {
        type: 'object',
        properties: { disableAlias: { type: 'boolean', default: !1 } },
        additionalProperties: !1,
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
      'module-import',
      'script',
      'node-commonjs',
    ],
  },
  n = { anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }] },
  s = Object.prototype.hasOwnProperty;
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
      if (t.length < 1) return (a.errors = [{ params: {} }]), !1;
      if (0 !== n) break;
    }
  }
  return (a.errors = null), !0;
}
function o(
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
      return (o.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.import && (r = 'import'))
        return (o.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = l;
        for (const t in e)
          if ('import' !== t && 'name' !== t)
            return (o.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === l) {
          if (void 0 !== e.import) {
            let r = e.import;
            const n = l,
              u = l;
            let m = !1;
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
            if (((m = m || p), !m)) {
              const n = l;
              a(r, {
                instancePath: t + '/import',
                parentData: e,
                parentDataProperty: 'import',
                rootData: s,
              }) ||
                ((i = null === i ? a.errors : i.concat(a.errors)),
                (l = i.length)),
                (p = n === l),
                (m = m || p);
            }
            if (!m) {
              const e = { params: {} };
              return (
                null === i ? (i = [e]) : i.push(e), l++, (o.errors = i), !1
              );
            }
            (l = u), null !== i && (u ? (i.length = u) : (i = null));
            var f = n === l;
          } else f = !0;
          if (f)
            if (void 0 !== e.name) {
              const t = l;
              if ('string' != typeof e.name)
                return (o.errors = [{ params: { type: 'string' } }]), !1;
              f = t === l;
            } else f = !0;
        }
      }
    }
  }
  return (o.errors = i), 0 === l;
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
      const u = p,
        m = p;
      let c = !1;
      const y = p;
      o(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((l = null === l ? o.errors : l.concat(o.errors)), (p = l.length));
      var f = y === p;
      if (((c = c || f), !c)) {
        const o = p;
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
        if (((f = o === p), (c = c || f), !c)) {
          const o = p;
          a(n, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: s,
          }) ||
            ((l = null === l ? a.errors : l.concat(a.errors)), (p = l.length)),
            (f = o === p),
            (c = c || f);
        }
      }
      if (!c) {
        const e = { params: {} };
        return null === l ? (l = [e]) : l.push(e), p++, (i.errors = l), !1;
      }
      if (((p = m), null !== l && (m ? (l.length = m) : (l = null)), u !== p))
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
  let a = null,
    o = 0;
  const p = o;
  let f = !1;
  const u = o;
  if (o === u)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const l = o,
          p = o;
        let f = !1;
        const u = o;
        if (o == o)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === a ? (a = [e]) : a.push(e), o++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), o++;
          }
        var m = u === o;
        if (((f = f || m), !f)) {
          const l = o;
          i(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((a = null === a ? i.errors : a.concat(i.errors)), (o = a.length)),
            (m = l === o),
            (f = f || m);
        }
        if (f) (o = p), null !== a && (p ? (a.length = p) : (a = null));
        else {
          const e = { params: {} };
          null === a ? (a = [e]) : a.push(e), o++;
        }
        if (l !== o) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === a ? (a = [e]) : a.push(e), o++;
    }
  var c = u === o;
  if (((f = f || c), !f)) {
    const l = o;
    i(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((a = null === a ? i.errors : a.concat(i.errors)), (o = a.length)),
      (c = l === o),
      (f = f || c);
  }
  if (!f) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), o++, (l.errors = a), !1;
  }
  return (
    (o = p),
    null !== a && (p ? (a.length = p) : (a = null)),
    (l.errors = a),
    0 === o
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
  let a = null,
    o = 0;
  const i = o;
  let l = !1;
  const p = o;
  if ('string' != typeof e) {
    const e = { params: { type: 'string' } };
    null === a ? (a = [e]) : a.push(e), o++;
  }
  var u = p === o;
  if (((l = l || u), !l)) {
    const t = o;
    if (o == o)
      if (e && 'object' == typeof e && !Array.isArray(e)) {
        const t = o;
        for (const t in e)
          if (
            'amd' !== t &&
            'commonjs' !== t &&
            'commonjs2' !== t &&
            'root' !== t
          ) {
            const e = { params: { additionalProperty: t } };
            null === a ? (a = [e]) : a.push(e), o++;
            break;
          }
        if (t === o) {
          if (void 0 !== e.amd) {
            const t = o;
            if ('string' != typeof e.amd) {
              const e = { params: { type: 'string' } };
              null === a ? (a = [e]) : a.push(e), o++;
            }
            var m = t === o;
          } else m = !0;
          if (m) {
            if (void 0 !== e.commonjs) {
              const t = o;
              if ('string' != typeof e.commonjs) {
                const e = { params: { type: 'string' } };
                null === a ? (a = [e]) : a.push(e), o++;
              }
              m = t === o;
            } else m = !0;
            if (m) {
              if (void 0 !== e.commonjs2) {
                const t = o;
                if ('string' != typeof e.commonjs2) {
                  const e = { params: { type: 'string' } };
                  null === a ? (a = [e]) : a.push(e), o++;
                }
                m = t === o;
              } else m = !0;
              if (m)
                if (void 0 !== e.root) {
                  const t = o;
                  if ('string' != typeof e.root) {
                    const e = { params: { type: 'string' } };
                    null === a ? (a = [e]) : a.push(e), o++;
                  }
                  m = t === o;
                } else m = !0;
            }
          }
        }
      } else {
        const e = { params: { type: 'object' } };
        null === a ? (a = [e]) : a.push(e), o++;
      }
    (u = t === o), (l = l || u);
  }
  if (!l) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), o++, (f.errors = a), !1;
  }
  return (
    (o = i),
    null !== a && (i ? (a.length = i) : (a = null)),
    (f.errors = a),
    0 === o
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
    o = 0;
  const i = o;
  let l = !1;
  const p = o;
  if (o === p)
    if (Array.isArray(e))
      if (e.length < 1) {
        const e = { params: { limit: 1 } };
        null === a ? (a = [e]) : a.push(e), o++;
      } else {
        const t = e.length;
        for (let r = 0; r < t; r++) {
          let t = e[r];
          const n = o;
          if (o === n)
            if ('string' == typeof t) {
              if (t.length < 1) {
                const e = { params: {} };
                null === a ? (a = [e]) : a.push(e), o++;
              }
            } else {
              const e = { params: { type: 'string' } };
              null === a ? (a = [e]) : a.push(e), o++;
            }
          if (n !== o) break;
        }
      }
    else {
      const e = { params: { type: 'array' } };
      null === a ? (a = [e]) : a.push(e), o++;
    }
  var f = p === o;
  if (((l = l || f), !l)) {
    const t = o;
    if (o === t)
      if ('string' == typeof e) {
        if (e.length < 1) {
          const e = { params: {} };
          null === a ? (a = [e]) : a.push(e), o++;
        }
      } else {
        const e = { params: { type: 'string' } };
        null === a ? (a = [e]) : a.push(e), o++;
      }
    if (((f = t === o), (l = l || f), !l)) {
      const t = o;
      if (o == o)
        if (e && 'object' == typeof e && !Array.isArray(e)) {
          const t = o;
          for (const t in e)
            if ('amd' !== t && 'commonjs' !== t && 'root' !== t) {
              const e = { params: { additionalProperty: t } };
              null === a ? (a = [e]) : a.push(e), o++;
              break;
            }
          if (t === o) {
            if (void 0 !== e.amd) {
              let t = e.amd;
              const r = o;
              if (o === r)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === a ? (a = [e]) : a.push(e), o++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === a ? (a = [e]) : a.push(e), o++;
                }
              var m = r === o;
            } else m = !0;
            if (m) {
              if (void 0 !== e.commonjs) {
                let t = e.commonjs;
                const r = o;
                if (o === r)
                  if ('string' == typeof t) {
                    if (t.length < 1) {
                      const e = { params: {} };
                      null === a ? (a = [e]) : a.push(e), o++;
                    }
                  } else {
                    const e = { params: { type: 'string' } };
                    null === a ? (a = [e]) : a.push(e), o++;
                  }
                m = r === o;
              } else m = !0;
              if (m)
                if (void 0 !== e.root) {
                  let t = e.root;
                  const r = o,
                    n = o;
                  let s = !1;
                  const i = o;
                  if (o === i)
                    if (Array.isArray(t)) {
                      const e = t.length;
                      for (let r = 0; r < e; r++) {
                        let e = t[r];
                        const n = o;
                        if (o === n)
                          if ('string' == typeof e) {
                            if (e.length < 1) {
                              const e = { params: {} };
                              null === a ? (a = [e]) : a.push(e), o++;
                            }
                          } else {
                            const e = { params: { type: 'string' } };
                            null === a ? (a = [e]) : a.push(e), o++;
                          }
                        if (n !== o) break;
                      }
                    } else {
                      const e = { params: { type: 'array' } };
                      null === a ? (a = [e]) : a.push(e), o++;
                    }
                  var c = i === o;
                  if (((s = s || c), !s)) {
                    const e = o;
                    if (o === e)
                      if ('string' == typeof t) {
                        if (t.length < 1) {
                          const e = { params: {} };
                          null === a ? (a = [e]) : a.push(e), o++;
                        }
                      } else {
                        const e = { params: { type: 'string' } };
                        null === a ? (a = [e]) : a.push(e), o++;
                      }
                    (c = e === o), (s = s || c);
                  }
                  if (s)
                    (o = n), null !== a && (n ? (a.length = n) : (a = null));
                  else {
                    const e = { params: {} };
                    null === a ? (a = [e]) : a.push(e), o++;
                  }
                  m = r === o;
                } else m = !0;
            }
          }
        } else {
          const e = { params: { type: 'object' } };
          null === a ? (a = [e]) : a.push(e), o++;
        }
      (f = t === o), (l = l || f);
    }
  }
  if (!l) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), o++, (u.errors = a), !1;
  }
  return (
    (o = i),
    null !== a && (i ? (a.length = i) : (a = null)),
    (u.errors = a),
    0 === o
  );
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
  let a = null,
    o = 0;
  if (0 === o) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (m.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.type && (r = 'type'))
        return (m.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = o;
        for (const t in e)
          if (
            'amdContainer' !== t &&
            'auxiliaryComment' !== t &&
            'export' !== t &&
            'name' !== t &&
            'type' !== t &&
            'umdNamedDefine' !== t
          )
            return (m.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === o) {
          if (void 0 !== e.amdContainer) {
            let t = e.amdContainer;
            const r = o;
            if (o == o) {
              if ('string' != typeof t)
                return (m.errors = [{ params: { type: 'string' } }]), !1;
              if (t.length < 1) return (m.errors = [{ params: {} }]), !1;
            }
            var i = r === o;
          } else i = !0;
          if (i) {
            if (void 0 !== e.auxiliaryComment) {
              const r = o;
              f(e.auxiliaryComment, {
                instancePath: t + '/auxiliaryComment',
                parentData: e,
                parentDataProperty: 'auxiliaryComment',
                rootData: s,
              }) ||
                ((a = null === a ? f.errors : a.concat(f.errors)),
                (o = a.length)),
                (i = r === o);
            } else i = !0;
            if (i) {
              if (void 0 !== e.export) {
                let t = e.export;
                const r = o,
                  n = o;
                let s = !1;
                const p = o;
                if (o === p)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let r = 0; r < e; r++) {
                      let e = t[r];
                      const n = o;
                      if (o === n)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === a ? (a = [e]) : a.push(e), o++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === a ? (a = [e]) : a.push(e), o++;
                        }
                      if (n !== o) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === a ? (a = [e]) : a.push(e), o++;
                  }
                var l = p === o;
                if (((s = s || l), !s)) {
                  const e = o;
                  if (o === e)
                    if ('string' == typeof t) {
                      if (t.length < 1) {
                        const e = { params: {} };
                        null === a ? (a = [e]) : a.push(e), o++;
                      }
                    } else {
                      const e = { params: { type: 'string' } };
                      null === a ? (a = [e]) : a.push(e), o++;
                    }
                  (l = e === o), (s = s || l);
                }
                if (!s) {
                  const e = { params: {} };
                  return (
                    null === a ? (a = [e]) : a.push(e), o++, (m.errors = a), !1
                  );
                }
                (o = n),
                  null !== a && (n ? (a.length = n) : (a = null)),
                  (i = r === o);
              } else i = !0;
              if (i) {
                if (void 0 !== e.name) {
                  const r = o;
                  u(e.name, {
                    instancePath: t + '/name',
                    parentData: e,
                    parentDataProperty: 'name',
                    rootData: s,
                  }) ||
                    ((a = null === a ? u.errors : a.concat(u.errors)),
                    (o = a.length)),
                    (i = r === o);
                } else i = !0;
                if (i) {
                  if (void 0 !== e.type) {
                    let t = e.type;
                    const r = o,
                      n = o;
                    let s = !1;
                    const l = o;
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
                      null === a ? (a = [e]) : a.push(e), o++;
                    }
                    var c = l === o;
                    if (((s = s || c), !s)) {
                      const e = o;
                      if ('string' != typeof t) {
                        const e = { params: { type: 'string' } };
                        null === a ? (a = [e]) : a.push(e), o++;
                      }
                      (c = e === o), (s = s || c);
                    }
                    if (!s) {
                      const e = { params: {} };
                      return (
                        null === a ? (a = [e]) : a.push(e),
                        o++,
                        (m.errors = a),
                        !1
                      );
                    }
                    (o = n),
                      null !== a && (n ? (a.length = n) : (a = null)),
                      (i = r === o);
                  } else i = !0;
                  if (i)
                    if (void 0 !== e.umdNamedDefine) {
                      const t = o;
                      if ('boolean' != typeof e.umdNamedDefine)
                        return (
                          (m.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      i = t === o;
                    } else i = !0;
                }
              }
            }
          }
        }
      }
    }
  }
  return (m.errors = a), 0 === o;
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
    o = 0;
  if (0 === o) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (y.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.external && (r = 'external'))
        return (y.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = o;
        for (const t in e)
          if ('external' !== t && 'shareScope' !== t)
            return (y.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === o) {
          if (void 0 !== e.external) {
            let r = e.external;
            const n = o,
              p = o;
            let f = !1;
            const u = o;
            if (o == o)
              if ('string' == typeof r) {
                if (r.length < 1) {
                  const e = { params: {} };
                  null === a ? (a = [e]) : a.push(e), o++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === a ? (a = [e]) : a.push(e), o++;
              }
            var i = u === o;
            if (((f = f || i), !f)) {
              const n = o;
              c(r, {
                instancePath: t + '/external',
                parentData: e,
                parentDataProperty: 'external',
                rootData: s,
              }) ||
                ((a = null === a ? c.errors : a.concat(c.errors)),
                (o = a.length)),
                (i = n === o),
                (f = f || i);
            }
            if (!f) {
              const e = { params: {} };
              return (
                null === a ? (a = [e]) : a.push(e), o++, (y.errors = a), !1
              );
            }
            (o = p), null !== a && (p ? (a.length = p) : (a = null));
            var l = n === o;
          } else l = !0;
          if (l)
            if (void 0 !== e.shareScope) {
              let t = e.shareScope;
              const r = o,
                n = o;
              let s = !1;
              const i = o;
              if (o === i)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === a ? (a = [e]) : a.push(e), o++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === a ? (a = [e]) : a.push(e), o++;
                }
              var p = i === o;
              if (((s = s || p), !s)) {
                const e = o;
                if (o === e)
                  if (Array.isArray(t)) {
                    const e = t.length;
                    for (let r = 0; r < e; r++) {
                      let e = t[r];
                      const n = o;
                      if (o === n)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === a ? (a = [e]) : a.push(e), o++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === a ? (a = [e]) : a.push(e), o++;
                        }
                      if (n !== o) break;
                    }
                  } else {
                    const e = { params: { type: 'array' } };
                    null === a ? (a = [e]) : a.push(e), o++;
                  }
                (p = e === o), (s = s || p);
              }
              if (!s) {
                const e = { params: {} };
                return (
                  null === a ? (a = [e]) : a.push(e), o++, (y.errors = a), !1
                );
              }
              (o = n),
                null !== a && (n ? (a.length = n) : (a = null)),
                (l = r === o);
            } else l = !0;
        }
      }
    }
  }
  return (y.errors = a), 0 === o;
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
    o = 0;
  if (0 === o) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (g.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let n = e[r];
      const l = o,
        p = o;
      let f = !1;
      const u = o;
      y(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((a = null === a ? y.errors : a.concat(y.errors)), (o = a.length));
      var i = u === o;
      if (((f = f || i), !f)) {
        const l = o;
        if (o == o)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const e = { params: {} };
              null === a ? (a = [e]) : a.push(e), o++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), o++;
          }
        if (((i = l === o), (f = f || i), !f)) {
          const l = o;
          c(n, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: s,
          }) ||
            ((a = null === a ? c.errors : a.concat(c.errors)), (o = a.length)),
            (i = l === o),
            (f = f || i);
        }
      }
      if (!f) {
        const e = { params: {} };
        return null === a ? (a = [e]) : a.push(e), o++, (g.errors = a), !1;
      }
      if (((o = p), null !== a && (p ? (a.length = p) : (a = null)), l !== o))
        break;
    }
  }
  return (g.errors = a), 0 === o;
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
    o = 0;
  const i = o;
  let l = !1;
  const p = o;
  if (o === p)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const i = o,
          l = o;
        let p = !1;
        const u = o;
        if (o == o)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === a ? (a = [e]) : a.push(e), o++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), o++;
          }
        var f = u === o;
        if (((p = p || f), !p)) {
          const i = o;
          g(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((a = null === a ? g.errors : a.concat(g.errors)), (o = a.length)),
            (f = i === o),
            (p = p || f);
        }
        if (p) (o = l), null !== a && (l ? (a.length = l) : (a = null));
        else {
          const e = { params: {} };
          null === a ? (a = [e]) : a.push(e), o++;
        }
        if (i !== o) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === a ? (a = [e]) : a.push(e), o++;
    }
  var u = p === o;
  if (((l = l || u), !l)) {
    const i = o;
    g(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((a = null === a ? g.errors : a.concat(g.errors)), (o = a.length)),
      (u = i === o),
      (l = l || u);
  }
  if (!l) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), o++, (h.errors = a), !1;
  }
  return (
    (o = i),
    null !== a && (i ? (a.length = i) : (a = null)),
    (h.errors = a),
    0 === o
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
    rootData: a = e,
  } = {},
) {
  let o = null,
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
            const a = i;
            if (!1 !== t) {
              const e = {
                params: { allowedValues: d.properties.import.anyOf[0].enum },
              };
              null === o ? (o = [e]) : o.push(e), i++;
            }
            var p = a === i;
            if (((s = s || p), !s)) {
              const e = i;
              if (i == i)
                if ('string' == typeof t) {
                  if (t.length < 1) {
                    const e = { params: {} };
                    null === o ? (o = [e]) : o.push(e), i++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === o ? (o = [e]) : o.push(e), i++;
                }
              (p = e === i), (s = s || p);
            }
            if (!s) {
              const e = { params: {} };
              return (
                null === o ? (o = [e]) : o.push(e), i++, (b.errors = o), !1
              );
            }
            (i = n),
              null !== o && (n ? (o.length = n) : (o = null)),
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
                      const a = i;
                      if (!1 !== t) {
                        const e = {
                          params: {
                            allowedValues:
                              d.properties.requiredVersion.anyOf[0].enum,
                          },
                        };
                        null === o ? (o = [e]) : o.push(e), i++;
                      }
                      var f = a === i;
                      if (((s = s || f), !s)) {
                        const e = i;
                        if ('string' != typeof t) {
                          const e = { params: { type: 'string' } };
                          null === o ? (o = [e]) : o.push(e), i++;
                        }
                        (f = e === i), (s = s || f);
                      }
                      if (!s) {
                        const e = { params: {} };
                        return (
                          null === o ? (o = [e]) : o.push(e),
                          i++,
                          (b.errors = o),
                          !1
                        );
                      }
                      (i = n),
                        null !== o && (n ? (o.length = n) : (o = null)),
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
                          var u = a === i;
                          if (((s = s || u), !s)) {
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
                                        null === o ? (o = [e]) : o.push(e), i++;
                                      }
                                    } else {
                                      const e = { params: { type: 'string' } };
                                      null === o ? (o = [e]) : o.push(e), i++;
                                    }
                                  if (n !== i) break;
                                }
                              } else {
                                const e = { params: { type: 'array' } };
                                null === o ? (o = [e]) : o.push(e), i++;
                              }
                            (u = e === i), (s = s || u);
                          }
                          if (!s) {
                            const e = { params: {} };
                            return (
                              null === o ? (o = [e]) : o.push(e),
                              i++,
                              (b.errors = o),
                              !1
                            );
                          }
                          (i = n),
                            null !== o && (n ? (o.length = n) : (o = null)),
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
                                const a = i;
                                if (!1 !== t) {
                                  const e = {
                                    params: {
                                      allowedValues:
                                        d.properties.version.anyOf[0].enum,
                                    },
                                  };
                                  null === o ? (o = [e]) : o.push(e), i++;
                                }
                                var m = a === i;
                                if (((s = s || m), !s)) {
                                  const e = i;
                                  if ('string' != typeof t) {
                                    const e = { params: { type: 'string' } };
                                    null === o ? (o = [e]) : o.push(e), i++;
                                  }
                                  (m = e === i), (s = s || m);
                                }
                                if (!s) {
                                  const e = { params: {} };
                                  return (
                                    null === o ? (o = [e]) : o.push(e),
                                    i++,
                                    (b.errors = o),
                                    !1
                                  );
                                }
                                (i = n),
                                  null !== o &&
                                    (n ? (o.length = n) : (o = null)),
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
  return (b.errors = o), 0 === i;
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
  let a = null,
    o = 0;
  if (0 === o) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (v.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let n = e[r];
      const l = o,
        p = o;
      let f = !1;
      const u = o;
      b(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: s,
      }) || ((a = null === a ? b.errors : a.concat(b.errors)), (o = a.length));
      var i = u === o;
      if (((f = f || i), !f)) {
        const e = o;
        if (o == o)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const e = { params: {} };
              null === a ? (a = [e]) : a.push(e), o++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), o++;
          }
        (i = e === o), (f = f || i);
      }
      if (!f) {
        const e = { params: {} };
        return null === a ? (a = [e]) : a.push(e), o++, (v.errors = a), !1;
      }
      if (((o = p), null !== a && (p ? (a.length = p) : (a = null)), l !== o))
        break;
    }
  }
  return (v.errors = a), 0 === o;
}
function D(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    o = 0;
  const i = o;
  let l = !1;
  const p = o;
  if (o === p)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const i = o,
          l = o;
        let p = !1;
        const u = o;
        if (o == o)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === a ? (a = [e]) : a.push(e), o++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), o++;
          }
        var f = u === o;
        if (((p = p || f), !p)) {
          const i = o;
          v(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((a = null === a ? v.errors : a.concat(v.errors)), (o = a.length)),
            (f = i === o),
            (p = p || f);
        }
        if (p) (o = l), null !== a && (l ? (a.length = l) : (a = null));
        else {
          const e = { params: {} };
          null === a ? (a = [e]) : a.push(e), o++;
        }
        if (i !== o) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === a ? (a = [e]) : a.push(e), o++;
    }
  var u = p === o;
  if (((l = l || u), !l)) {
    const i = o;
    v(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((a = null === a ? v.errors : a.concat(v.errors)), (o = a.length)),
      (u = i === o),
      (l = l || u);
  }
  if (!l) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), o++, (D.errors = a), !1;
  }
  return (
    (o = i),
    null !== a && (i ? (a.length = i) : (a = null)),
    (D.errors = a),
    0 === o
  );
}
function P(
  a,
  {
    instancePath: o = '',
    parentData: i,
    parentDataProperty: p,
    rootData: f = a,
  } = {},
) {
  let u = null,
    c = 0;
  if (0 === c) {
    if (!a || 'object' != typeof a || Array.isArray(a))
      return (P.errors = [{ params: { type: 'object' } }]), !1;
    {
      const i = c;
      for (const e in a)
        if (!s.call(t.properties, e))
          return (P.errors = [{ params: { additionalProperty: e } }]), !1;
      if (i === c) {
        if (void 0 !== a.async) {
          const e = c;
          if ('boolean' != typeof a.async)
            return (P.errors = [{ params: { type: 'boolean' } }]), !1;
          var y = e === c;
        } else y = !0;
        if (y) {
          if (void 0 !== a.exposes) {
            const e = c;
            l(a.exposes, {
              instancePath: o + '/exposes',
              parentData: a,
              parentDataProperty: 'exposes',
              rootData: f,
            }) ||
              ((u = null === u ? l.errors : u.concat(l.errors)),
              (c = u.length)),
              (y = e === c);
          } else y = !0;
          if (y) {
            if (void 0 !== a.filename) {
              let t = a.filename;
              const r = c;
              if (c === r) {
                if ('string' != typeof t)
                  return (P.errors = [{ params: { type: 'string' } }]), !1;
                if (t.length < 1) return (P.errors = [{ params: {} }]), !1;
                if (t.includes('!') || !1 !== e.test(t))
                  return (P.errors = [{ params: {} }]), !1;
              }
              y = r === c;
            } else y = !0;
            if (y) {
              if (void 0 !== a.library) {
                const e = c;
                m(a.library, {
                  instancePath: o + '/library',
                  parentData: a,
                  parentDataProperty: 'library',
                  rootData: f,
                }) ||
                  ((u = null === u ? m.errors : u.concat(m.errors)),
                  (c = u.length)),
                  (y = e === c);
              } else y = !0;
              if (y) {
                if (void 0 !== a.name) {
                  let e = a.name;
                  const t = c;
                  if (c === t) {
                    if ('string' != typeof e)
                      return (P.errors = [{ params: { type: 'string' } }]), !1;
                    if (e.length < 1) return (P.errors = [{ params: {} }]), !1;
                  }
                  y = t === c;
                } else y = !0;
                if (y) {
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
                      'module-import' !== e &&
                      'script' !== e &&
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
                        (P.errors = u),
                        !1
                      );
                    }
                    (c = n),
                      null !== u && (n ? (u.length = n) : (u = null)),
                      (y = t === c);
                  } else y = !0;
                  if (y) {
                    if (void 0 !== a.remotes) {
                      const e = c;
                      h(a.remotes, {
                        instancePath: o + '/remotes',
                        parentData: a,
                        parentDataProperty: 'remotes',
                        rootData: f,
                      }) ||
                        ((u = null === u ? h.errors : u.concat(h.errors)),
                        (c = u.length)),
                        (y = e === c);
                    } else y = !0;
                    if (y) {
                      if (void 0 !== a.runtime) {
                        let e = a.runtime;
                        const t = c,
                          r = c;
                        let s = !1;
                        const o = c;
                        if (!1 !== e) {
                          const e = {
                            params: { allowedValues: n.anyOf[0].enum },
                          };
                          null === u ? (u = [e]) : u.push(e), c++;
                        }
                        var g = o === c;
                        if (((s = s || g), !s)) {
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
                          (g = t === c), (s = s || g);
                        }
                        if (!s) {
                          const e = { params: {} };
                          return (
                            null === u ? (u = [e]) : u.push(e),
                            c++,
                            (P.errors = u),
                            !1
                          );
                        }
                        (c = r),
                          null !== u && (r ? (u.length = r) : (u = null)),
                          (y = t === c);
                      } else y = !0;
                      if (y) {
                        if (void 0 !== a.shareScope) {
                          let e = a.shareScope;
                          const t = c,
                            r = c;
                          let n = !1;
                          const s = c;
                          if (c === s)
                            if ('string' == typeof e) {
                              if (e.length < 1) {
                                const e = { params: {} };
                                null === u ? (u = [e]) : u.push(e), c++;
                              }
                            } else {
                              const e = { params: { type: 'string' } };
                              null === u ? (u = [e]) : u.push(e), c++;
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
                                        null === u ? (u = [e]) : u.push(e), c++;
                                      }
                                    } else {
                                      const e = { params: { type: 'string' } };
                                      null === u ? (u = [e]) : u.push(e), c++;
                                    }
                                  if (n !== c) break;
                                }
                              } else {
                                const e = { params: { type: 'array' } };
                                null === u ? (u = [e]) : u.push(e), c++;
                              }
                            (d = t === c), (n = n || d);
                          }
                          if (!n) {
                            const e = { params: {} };
                            return (
                              null === u ? (u = [e]) : u.push(e),
                              c++,
                              (P.errors = u),
                              !1
                            );
                          }
                          (c = r),
                            null !== u && (r ? (u.length = r) : (u = null)),
                            (y = t === c);
                        } else y = !0;
                        if (y) {
                          if (void 0 !== a.shareStrategy) {
                            let e = a.shareStrategy;
                            const r = c;
                            if ('string' != typeof e)
                              return (
                                (P.errors = [{ params: { type: 'string' } }]),
                                !1
                              );
                            if ('version-first' !== e && 'loaded-first' !== e)
                              return (
                                (P.errors = [
                                  {
                                    params: {
                                      allowedValues:
                                        t.properties.shareStrategy.enum,
                                    },
                                  },
                                ]),
                                !1
                              );
                            y = r === c;
                          } else y = !0;
                          if (y) {
                            if (void 0 !== a.shared) {
                              const e = c;
                              D(a.shared, {
                                instancePath: o + '/shared',
                                parentData: a,
                                parentDataProperty: 'shared',
                                rootData: f,
                              }) ||
                                ((u =
                                  null === u ? D.errors : u.concat(D.errors)),
                                (c = u.length)),
                                (y = e === c);
                            } else y = !0;
                            if (y) {
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
                                      (P.errors = [
                                        { params: { type: 'object' } },
                                      ]),
                                      !1
                                    );
                                  {
                                    const r = c;
                                    for (const t in e)
                                      if (
                                        'federationRuntime' !== t &&
                                        'externalRuntime' !== t &&
                                        'provideExternalRuntime' !== t
                                      )
                                        return (
                                          (P.errors = [
                                            {
                                              params: { additionalProperty: t },
                                            },
                                          ]),
                                          !1
                                        );
                                    if (r === c) {
                                      if (void 0 !== e.federationRuntime) {
                                        let r = e.federationRuntime;
                                        const n = c,
                                          s = c;
                                        let a = !1,
                                          o = null;
                                        const i = c;
                                        if (!1 !== r) {
                                          const e = {
                                            params: {
                                              allowedValues:
                                                t.properties.experiments
                                                  .properties.federationRuntime
                                                  .oneOf[0].enum,
                                            },
                                          };
                                          null === u ? (u = [e]) : u.push(e),
                                            c++;
                                        }
                                        i === c && ((a = !0), (o = 0));
                                        const l = c;
                                        if ('hoisted' !== r) {
                                          const e = {
                                            params: {
                                              allowedValues:
                                                t.properties.experiments
                                                  .properties.federationRuntime
                                                  .oneOf[1].enum,
                                            },
                                          };
                                          null === u ? (u = [e]) : u.push(e),
                                            c++;
                                        }
                                        var b;
                                        if (
                                          ((b = l === c) && a
                                            ? ((a = !1), (o = [o, 1]))
                                            : b && ((a = !0), (o = 1)),
                                          !a)
                                        ) {
                                          const e = {
                                            params: { passingSchemas: o },
                                          };
                                          return (
                                            null === u ? (u = [e]) : u.push(e),
                                            c++,
                                            (P.errors = u),
                                            !1
                                          );
                                        }
                                        (c = s),
                                          null !== u &&
                                            (s ? (u.length = s) : (u = null));
                                        var v = n === c;
                                      } else v = !0;
                                      if (v) {
                                        if (void 0 !== e.externalRuntime) {
                                          const t = c;
                                          if (
                                            'boolean' !=
                                            typeof e.externalRuntime
                                          )
                                            return (
                                              (P.errors = [
                                                { params: { type: 'boolean' } },
                                              ]),
                                              !1
                                            );
                                          v = t === c;
                                        } else v = !0;
                                        if (v)
                                          if (
                                            void 0 !== e.provideExternalRuntime
                                          ) {
                                            const t = c;
                                            if (
                                              'boolean' !=
                                              typeof e.provideExternalRuntime
                                            )
                                              return (
                                                (P.errors = [
                                                  {
                                                    params: { type: 'boolean' },
                                                  },
                                                ]),
                                                !1
                                              );
                                            v = t === c;
                                          } else v = !0;
                                      }
                                    }
                                  }
                                }
                                y = r === c;
                              } else y = !0;
                              if (y) {
                                if (void 0 !== a.runtimePlugins) {
                                  let e = a.runtimePlugins;
                                  const t = c;
                                  if (c === t) {
                                    if (!Array.isArray(e))
                                      return (
                                        (P.errors = [
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
                                            (P.errors = [
                                              { params: { type: 'string' } },
                                            ]),
                                            !1
                                          );
                                        if (t !== c) break;
                                      }
                                    }
                                  }
                                  y = t === c;
                                } else y = !0;
                                if (y) {
                                  if (void 0 !== a.getPublicPath) {
                                    const e = c;
                                    if ('string' != typeof a.getPublicPath)
                                      return (
                                        (P.errors = [
                                          { params: { type: 'string' } },
                                        ]),
                                        !1
                                      );
                                    y = e === c;
                                  } else y = !0;
                                  if (y) {
                                    if (void 0 !== a.implementation) {
                                      const e = c;
                                      if ('string' != typeof a.implementation)
                                        return (
                                          (P.errors = [
                                            { params: { type: 'string' } },
                                          ]),
                                          !1
                                        );
                                      y = e === c;
                                    } else y = !0;
                                    if (y) {
                                      if (void 0 !== a.manifest) {
                                        let e = a.manifest;
                                        const t = c,
                                          r = c;
                                        let n = !1,
                                          s = null;
                                        const o = c;
                                        if ('boolean' != typeof e) {
                                          const e = {
                                            params: { type: 'boolean' },
                                          };
                                          null === u ? (u = [e]) : u.push(e),
                                            c++;
                                        }
                                        o === c && ((n = !0), (s = 0));
                                        const i = c;
                                        if (
                                          !e ||
                                          'object' != typeof e ||
                                          Array.isArray(e)
                                        ) {
                                          const e = {
                                            params: { type: 'object' },
                                          };
                                          null === u ? (u = [e]) : u.push(e),
                                            c++;
                                        }
                                        var j;
                                        if (
                                          ((j = i === c) && n
                                            ? ((n = !1), (s = [s, 1]))
                                            : j && ((n = !0), (s = 1)),
                                          !n)
                                        ) {
                                          const e = {
                                            params: { passingSchemas: s },
                                          };
                                          return (
                                            null === u ? (u = [e]) : u.push(e),
                                            c++,
                                            (P.errors = u),
                                            !1
                                          );
                                        }
                                        (c = r),
                                          null !== u &&
                                            (r ? (u.length = r) : (u = null)),
                                          (y = t === c);
                                      } else y = !0;
                                      if (y) {
                                        if (void 0 !== a.dev) {
                                          let e = a.dev;
                                          const t = c,
                                            r = c;
                                          let n = !1,
                                            s = null;
                                          const o = c;
                                          if ('boolean' != typeof e) {
                                            const e = {
                                              params: { type: 'boolean' },
                                            };
                                            null === u ? (u = [e]) : u.push(e),
                                              c++;
                                          }
                                          o === c && ((n = !0), (s = 0));
                                          const i = c;
                                          if (
                                            !e ||
                                            'object' != typeof e ||
                                            Array.isArray(e)
                                          ) {
                                            const e = {
                                              params: { type: 'object' },
                                            };
                                            null === u ? (u = [e]) : u.push(e),
                                              c++;
                                          }
                                          var A;
                                          if (
                                            ((A = i === c) && n
                                              ? ((n = !1), (s = [s, 1]))
                                              : A && ((n = !0), (s = 1)),
                                            !n)
                                          ) {
                                            const e = {
                                              params: { passingSchemas: s },
                                            };
                                            return (
                                              null === u
                                                ? (u = [e])
                                                : u.push(e),
                                              c++,
                                              (P.errors = u),
                                              !1
                                            );
                                          }
                                          (c = r),
                                            null !== u &&
                                              (r ? (u.length = r) : (u = null)),
                                            (y = t === c);
                                        } else y = !0;
                                        if (y) {
                                          if (void 0 !== a.dts) {
                                            let e = a.dts;
                                            const t = c,
                                              r = c;
                                            let n = !1,
                                              s = null;
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
                                            o === c && ((n = !0), (s = 0));
                                            const i = c;
                                            if (
                                              !e ||
                                              'object' != typeof e ||
                                              Array.isArray(e)
                                            ) {
                                              const e = {
                                                params: { type: 'object' },
                                              };
                                              null === u
                                                ? (u = [e])
                                                : u.push(e),
                                                c++;
                                            }
                                            var x;
                                            if (
                                              ((x = i === c) && n
                                                ? ((n = !1), (s = [s, 1]))
                                                : x && ((n = !0), (s = 1)),
                                              !n)
                                            ) {
                                              const e = {
                                                params: { passingSchemas: s },
                                              };
                                              return (
                                                null === u
                                                  ? (u = [e])
                                                  : u.push(e),
                                                c++,
                                                (P.errors = u),
                                                !1
                                              );
                                            }
                                            (c = r),
                                              null !== u &&
                                                (r
                                                  ? (u.length = r)
                                                  : (u = null)),
                                              (y = t === c);
                                          } else y = !0;
                                          if (y) {
                                            if (void 0 !== a.dataPrefetch) {
                                              const e = c;
                                              if (
                                                'boolean' !=
                                                typeof a.dataPrefetch
                                              )
                                                return (
                                                  (P.errors = [
                                                    {
                                                      params: {
                                                        type: 'boolean',
                                                      },
                                                    },
                                                  ]),
                                                  !1
                                                );
                                              y = e === c;
                                            } else y = !0;
                                            if (y) {
                                              if (
                                                void 0 !== a.virtualRuntimeEntry
                                              ) {
                                                const e = c;
                                                if (
                                                  'boolean' !=
                                                  typeof a.virtualRuntimeEntry
                                                )
                                                  return (
                                                    (P.errors = [
                                                      {
                                                        params: {
                                                          type: 'boolean',
                                                        },
                                                      },
                                                    ]),
                                                    !1
                                                  );
                                                y = e === c;
                                              } else y = !0;
                                              if (y)
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
                                                        (P.errors = [
                                                          {
                                                            params: {
                                                              type: 'object',
                                                            },
                                                          },
                                                        ]),
                                                        !1
                                                      );
                                                    {
                                                      const t = c;
                                                      for (const t in e)
                                                        if (
                                                          'disableAlias' !== t
                                                        )
                                                          return (
                                                            (P.errors = [
                                                              {
                                                                params: {
                                                                  additionalProperty:
                                                                    t,
                                                                },
                                                              },
                                                            ]),
                                                            !1
                                                          );
                                                      if (
                                                        t === c &&
                                                        void 0 !==
                                                          e.disableAlias &&
                                                        'boolean' !=
                                                          typeof e.disableAlias
                                                      )
                                                        return (
                                                          (P.errors = [
                                                            {
                                                              params: {
                                                                type: 'boolean',
                                                              },
                                                            },
                                                          ]),
                                                          !1
                                                        );
                                                    }
                                                  }
                                                  y = t === c;
                                                } else y = !0;
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
  return (P.errors = u), 0 === c;
}
