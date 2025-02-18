// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
const e = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
export const validate = v;
export default v;
const r = {
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
          request: { type: 'string', minLength: 1 },
          layer: { type: 'string', minLength: 1 },
          issuerLayer: { type: 'string', minLength: 1 },
          packageName: { type: 'string', minLength: 1 },
          requiredVersion: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
          shareKey: { type: 'string', minLength: 1 },
          shareScope: { type: 'string', minLength: 1 },
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
      shareScope: { type: 'string', minLength: 1 },
      shared: { $ref: '#/definitions/Shared' },
      experiments: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          asyncStartup: { type: 'boolean' },
          externalRuntime: { type: 'boolean', default: !1 },
          provideExternalRuntime: { type: 'boolean', default: !1 },
        },
      },
      runtimePlugins: { type: 'array', items: { type: 'string' } },
      dataPrefetch: { type: 'boolean' },
      virtualRuntimeEntry: { type: 'boolean' },
    },
  },
  t = {
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
    instancePath: r = '',
    parentData: t,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  if (!Array.isArray(e))
    return (a.errors = [{ params: { type: 'array' } }]), !1;
  {
    const r = e.length;
    for (let t = 0; t < r; t++) {
      let r = e[t];
      const n = 0;
      if ('string' != typeof r)
        return (a.errors = [{ params: { type: 'string' } }]), !1;
      if (r.length < 1) return (a.errors = [{ params: {} }]), !1;
      if (0 !== n) break;
    }
  }
  return (a.errors = null), !0;
}
function o(
  e,
  {
    instancePath: r = '',
    parentData: t,
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
      let t;
      if (void 0 === e.import && (t = 'import'))
        return (o.errors = [{ params: { missingProperty: t } }]), !1;
      {
        const t = l;
        for (const r in e)
          if ('import' !== r && 'name' !== r)
            return (o.errors = [{ params: { additionalProperty: r } }]), !1;
        if (t === l) {
          if (void 0 !== e.import) {
            let t = e.import;
            const n = l,
              m = l;
            let u = !1;
            const c = l;
            if (l == l)
              if ('string' == typeof t) {
                if (t.length < 1) {
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
              a(t, {
                instancePath: r + '/import',
                parentData: e,
                parentDataProperty: 'import',
                rootData: s,
              }) ||
                ((i = null === i ? a.errors : i.concat(a.errors)),
                (l = i.length)),
                (p = n === l),
                (u = u || p);
            }
            if (!u) {
              const e = { params: {} };
              return (
                null === i ? (i = [e]) : i.push(e), l++, (o.errors = i), !1
              );
            }
            (l = m), null !== i && (m ? (i.length = m) : (i = null));
            var f = n === l;
          } else f = !0;
          if (f)
            if (void 0 !== e.name) {
              const r = l;
              if ('string' != typeof e.name)
                return (o.errors = [{ params: { type: 'string' } }]), !1;
              f = r === l;
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
    instancePath: r = '',
    parentData: t,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let l = null,
    p = 0;
  if (0 === p) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (i.errors = [{ params: { type: 'object' } }]), !1;
    for (const t in e) {
      let n = e[t];
      const m = p,
        u = p;
      let c = !1;
      const y = p;
      o(n, {
        instancePath: r + '/' + t.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: t,
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
            instancePath: r + '/' + t.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: t,
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
      if (((p = u), null !== l && (u ? (l.length = u) : (l = null)), m !== p))
        break;
    }
  }
  return (i.errors = l), 0 === p;
}
function l(
  e,
  {
    instancePath: r = '',
    parentData: t,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    o = 0;
  const p = o;
  let f = !1;
  const m = o;
  if (o === m)
    if (Array.isArray(e)) {
      const t = e.length;
      for (let n = 0; n < t; n++) {
        let t = e[n];
        const l = o,
          p = o;
        let f = !1;
        const m = o;
        if (o == o)
          if ('string' == typeof t) {
            if (t.length < 1) {
              const e = { params: {} };
              null === a ? (a = [e]) : a.push(e), o++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), o++;
          }
        var u = m === o;
        if (((f = f || u), !f)) {
          const l = o;
          i(t, {
            instancePath: r + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((a = null === a ? i.errors : a.concat(i.errors)), (o = a.length)),
            (u = l === o),
            (f = f || u);
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
  var c = m === o;
  if (((f = f || c), !f)) {
    const l = o;
    i(e, {
      instancePath: r,
      parentData: t,
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
    instancePath: r = '',
    parentData: t,
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
  var m = p === o;
  if (((l = l || m), !l)) {
    const r = o;
    if (o == o)
      if (e && 'object' == typeof e && !Array.isArray(e)) {
        const r = o;
        for (const r in e)
          if (
            'amd' !== r &&
            'commonjs' !== r &&
            'commonjs2' !== r &&
            'root' !== r
          ) {
            const e = { params: { additionalProperty: r } };
            null === a ? (a = [e]) : a.push(e), o++;
            break;
          }
        if (r === o) {
          if (void 0 !== e.amd) {
            const r = o;
            if ('string' != typeof e.amd) {
              const e = { params: { type: 'string' } };
              null === a ? (a = [e]) : a.push(e), o++;
            }
            var u = r === o;
          } else u = !0;
          if (u) {
            if (void 0 !== e.commonjs) {
              const r = o;
              if ('string' != typeof e.commonjs) {
                const e = { params: { type: 'string' } };
                null === a ? (a = [e]) : a.push(e), o++;
              }
              u = r === o;
            } else u = !0;
            if (u) {
              if (void 0 !== e.commonjs2) {
                const r = o;
                if ('string' != typeof e.commonjs2) {
                  const e = { params: { type: 'string' } };
                  null === a ? (a = [e]) : a.push(e), o++;
                }
                u = r === o;
              } else u = !0;
              if (u)
                if (void 0 !== e.root) {
                  const r = o;
                  if ('string' != typeof e.root) {
                    const e = { params: { type: 'string' } };
                    null === a ? (a = [e]) : a.push(e), o++;
                  }
                  u = r === o;
                } else u = !0;
            }
          }
        }
      } else {
        const e = { params: { type: 'object' } };
        null === a ? (a = [e]) : a.push(e), o++;
      }
    (m = r === o), (l = l || m);
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
function m(
  e,
  {
    instancePath: r = '',
    parentData: t,
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
        const r = e.length;
        for (let t = 0; t < r; t++) {
          let r = e[t];
          const n = o;
          if (o === n)
            if ('string' == typeof r) {
              if (r.length < 1) {
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
    const r = o;
    if (o === r)
      if ('string' == typeof e) {
        if (e.length < 1) {
          const e = { params: {} };
          null === a ? (a = [e]) : a.push(e), o++;
        }
      } else {
        const e = { params: { type: 'string' } };
        null === a ? (a = [e]) : a.push(e), o++;
      }
    if (((f = r === o), (l = l || f), !l)) {
      const r = o;
      if (o == o)
        if (e && 'object' == typeof e && !Array.isArray(e)) {
          const r = o;
          for (const r in e)
            if ('amd' !== r && 'commonjs' !== r && 'root' !== r) {
              const e = { params: { additionalProperty: r } };
              null === a ? (a = [e]) : a.push(e), o++;
              break;
            }
          if (r === o) {
            if (void 0 !== e.amd) {
              let r = e.amd;
              const t = o;
              if (o === t)
                if ('string' == typeof r) {
                  if (r.length < 1) {
                    const e = { params: {} };
                    null === a ? (a = [e]) : a.push(e), o++;
                  }
                } else {
                  const e = { params: { type: 'string' } };
                  null === a ? (a = [e]) : a.push(e), o++;
                }
              var u = t === o;
            } else u = !0;
            if (u) {
              if (void 0 !== e.commonjs) {
                let r = e.commonjs;
                const t = o;
                if (o === t)
                  if ('string' == typeof r) {
                    if (r.length < 1) {
                      const e = { params: {} };
                      null === a ? (a = [e]) : a.push(e), o++;
                    }
                  } else {
                    const e = { params: { type: 'string' } };
                    null === a ? (a = [e]) : a.push(e), o++;
                  }
                u = t === o;
              } else u = !0;
              if (u)
                if (void 0 !== e.root) {
                  let r = e.root;
                  const t = o,
                    n = o;
                  let s = !1;
                  const i = o;
                  if (o === i)
                    if (Array.isArray(r)) {
                      const e = r.length;
                      for (let t = 0; t < e; t++) {
                        let e = r[t];
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
                      if ('string' == typeof r) {
                        if (r.length < 1) {
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
                  u = t === o;
                } else u = !0;
            }
          }
        } else {
          const e = { params: { type: 'object' } };
          null === a ? (a = [e]) : a.push(e), o++;
        }
      (f = r === o), (l = l || f);
    }
  }
  if (!l) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), o++, (m.errors = a), !1;
  }
  return (
    (o = i),
    null !== a && (i ? (a.length = i) : (a = null)),
    (m.errors = a),
    0 === o
  );
}
function u(
  e,
  {
    instancePath: r = '',
    parentData: t,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    o = 0;
  if (0 === o) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (u.errors = [{ params: { type: 'object' } }]), !1;
    {
      let t;
      if (void 0 === e.type && (t = 'type'))
        return (u.errors = [{ params: { missingProperty: t } }]), !1;
      {
        const t = o;
        for (const r in e)
          if (
            'amdContainer' !== r &&
            'auxiliaryComment' !== r &&
            'export' !== r &&
            'name' !== r &&
            'type' !== r &&
            'umdNamedDefine' !== r
          )
            return (u.errors = [{ params: { additionalProperty: r } }]), !1;
        if (t === o) {
          if (void 0 !== e.amdContainer) {
            let r = e.amdContainer;
            const t = o;
            if (o == o) {
              if ('string' != typeof r)
                return (u.errors = [{ params: { type: 'string' } }]), !1;
              if (r.length < 1) return (u.errors = [{ params: {} }]), !1;
            }
            var i = t === o;
          } else i = !0;
          if (i) {
            if (void 0 !== e.auxiliaryComment) {
              const t = o;
              f(e.auxiliaryComment, {
                instancePath: r + '/auxiliaryComment',
                parentData: e,
                parentDataProperty: 'auxiliaryComment',
                rootData: s,
              }) ||
                ((a = null === a ? f.errors : a.concat(f.errors)),
                (o = a.length)),
                (i = t === o);
            } else i = !0;
            if (i) {
              if (void 0 !== e.export) {
                let r = e.export;
                const t = o,
                  n = o;
                let s = !1;
                const p = o;
                if (o === p)
                  if (Array.isArray(r)) {
                    const e = r.length;
                    for (let t = 0; t < e; t++) {
                      let e = r[t];
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
                    if ('string' == typeof r) {
                      if (r.length < 1) {
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
                    null === a ? (a = [e]) : a.push(e), o++, (u.errors = a), !1
                  );
                }
                (o = n),
                  null !== a && (n ? (a.length = n) : (a = null)),
                  (i = t === o);
              } else i = !0;
              if (i) {
                if (void 0 !== e.name) {
                  const t = o;
                  m(e.name, {
                    instancePath: r + '/name',
                    parentData: e,
                    parentDataProperty: 'name',
                    rootData: s,
                  }) ||
                    ((a = null === a ? m.errors : a.concat(m.errors)),
                    (o = a.length)),
                    (i = t === o);
                } else i = !0;
                if (i) {
                  if (void 0 !== e.type) {
                    let r = e.type;
                    const t = o,
                      n = o;
                    let s = !1;
                    const l = o;
                    if (
                      'var' !== r &&
                      'module' !== r &&
                      'assign' !== r &&
                      'assign-properties' !== r &&
                      'this' !== r &&
                      'window' !== r &&
                      'self' !== r &&
                      'global' !== r &&
                      'commonjs' !== r &&
                      'commonjs2' !== r &&
                      'commonjs-module' !== r &&
                      'commonjs-static' !== r &&
                      'amd' !== r &&
                      'amd-require' !== r &&
                      'umd' !== r &&
                      'umd2' !== r &&
                      'jsonp' !== r &&
                      'system' !== r
                    ) {
                      const e = { params: { allowedValues: p.anyOf[0].enum } };
                      null === a ? (a = [e]) : a.push(e), o++;
                    }
                    var c = l === o;
                    if (((s = s || c), !s)) {
                      const e = o;
                      if ('string' != typeof r) {
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
                        (u.errors = a),
                        !1
                      );
                    }
                    (o = n),
                      null !== a && (n ? (a.length = n) : (a = null)),
                      (i = t === o);
                  } else i = !0;
                  if (i)
                    if (void 0 !== e.umdNamedDefine) {
                      const r = o;
                      if ('boolean' != typeof e.umdNamedDefine)
                        return (
                          (u.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      i = r === o;
                    } else i = !0;
                }
              }
            }
          }
        }
      }
    }
  }
  return (u.errors = a), 0 === o;
}
function c(
  e,
  {
    instancePath: r = '',
    parentData: t,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  if (!Array.isArray(e))
    return (c.errors = [{ params: { type: 'array' } }]), !1;
  {
    const r = e.length;
    for (let t = 0; t < r; t++) {
      let r = e[t];
      const n = 0;
      if ('string' != typeof r)
        return (c.errors = [{ params: { type: 'string' } }]), !1;
      if (r.length < 1) return (c.errors = [{ params: {} }]), !1;
      if (0 !== n) break;
    }
  }
  return (c.errors = null), !0;
}
function y(
  e,
  {
    instancePath: r = '',
    parentData: t,
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
      let t;
      if (void 0 === e.external && (t = 'external'))
        return (y.errors = [{ params: { missingProperty: t } }]), !1;
      {
        const t = o;
        for (const r in e)
          if ('external' !== r && 'shareScope' !== r)
            return (y.errors = [{ params: { additionalProperty: r } }]), !1;
        if (t === o) {
          if (void 0 !== e.external) {
            let t = e.external;
            const n = o,
              p = o;
            let f = !1;
            const m = o;
            if (o == o)
              if ('string' == typeof t) {
                if (t.length < 1) {
                  const e = { params: {} };
                  null === a ? (a = [e]) : a.push(e), o++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === a ? (a = [e]) : a.push(e), o++;
              }
            var i = m === o;
            if (((f = f || i), !f)) {
              const n = o;
              c(t, {
                instancePath: r + '/external',
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
              let r = e.shareScope;
              const t = o;
              if (o === t) {
                if ('string' != typeof r)
                  return (y.errors = [{ params: { type: 'string' } }]), !1;
                if (r.length < 1) return (y.errors = [{ params: {} }]), !1;
              }
              l = t === o;
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
    instancePath: r = '',
    parentData: t,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    o = 0;
  if (0 === o) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (g.errors = [{ params: { type: 'object' } }]), !1;
    for (const t in e) {
      let n = e[t];
      const l = o,
        p = o;
      let f = !1;
      const m = o;
      y(n, {
        instancePath: r + '/' + t.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: t,
        rootData: s,
      }) || ((a = null === a ? y.errors : a.concat(y.errors)), (o = a.length));
      var i = m === o;
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
            instancePath: r + '/' + t.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: t,
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
    instancePath: r = '',
    parentData: t,
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
      const t = e.length;
      for (let n = 0; n < t; n++) {
        let t = e[n];
        const i = o,
          l = o;
        let p = !1;
        const m = o;
        if (o == o)
          if ('string' == typeof t) {
            if (t.length < 1) {
              const e = { params: {} };
              null === a ? (a = [e]) : a.push(e), o++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), o++;
          }
        var f = m === o;
        if (((p = p || f), !p)) {
          const i = o;
          g(t, {
            instancePath: r + '/' + n,
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
  var m = p === o;
  if (((l = l || m), !l)) {
    const i = o;
    g(e, {
      instancePath: r,
      parentData: t,
      parentDataProperty: n,
      rootData: s,
    }) || ((a = null === a ? g.errors : a.concat(g.errors)), (o = a.length)),
      (m = i === o),
      (l = l || m);
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
    shareScope: { type: 'string', minLength: 1 },
    singleton: { type: 'boolean' },
    strictVersion: { type: 'boolean' },
    version: { anyOf: [{ enum: [!1] }, { type: 'string' }] },
  },
};
function b(
  e,
  {
    instancePath: r = '',
    parentData: t,
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
      const r = i;
      for (const r in e)
        if (!s.call(d.properties, r))
          return (b.errors = [{ params: { additionalProperty: r } }]), !1;
      if (r === i) {
        if (void 0 !== e.eager) {
          const r = i;
          if ('boolean' != typeof e.eager)
            return (b.errors = [{ params: { type: 'boolean' } }]), !1;
          var l = r === i;
        } else l = !0;
        if (l) {
          if (void 0 !== e.import) {
            let r = e.import;
            const t = i,
              n = i;
            let s = !1;
            const a = i;
            if (!1 !== r) {
              const e = {
                params: { allowedValues: d.properties.import.anyOf[0].enum },
              };
              null === o ? (o = [e]) : o.push(e), i++;
            }
            var p = a === i;
            if (((s = s || p), !s)) {
              const e = i;
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
              (l = t === i);
          } else l = !0;
          if (l) {
            if (void 0 !== e.request) {
              let r = e.request;
              const t = i;
              if (i === t) {
                if ('string' != typeof r)
                  return (b.errors = [{ params: { type: 'string' } }]), !1;
                if (r.length < 1) return (b.errors = [{ params: {} }]), !1;
              }
              l = t === i;
            } else l = !0;
            if (l) {
              if (void 0 !== e.layer) {
                let r = e.layer;
                const t = i;
                if (i === t) {
                  if ('string' != typeof r)
                    return (b.errors = [{ params: { type: 'string' } }]), !1;
                  if (r.length < 1) return (b.errors = [{ params: {} }]), !1;
                }
                l = t === i;
              } else l = !0;
              if (l) {
                if (void 0 !== e.issuerLayer) {
                  let r = e.issuerLayer;
                  const t = i;
                  if (i === t) {
                    if ('string' != typeof r)
                      return (b.errors = [{ params: { type: 'string' } }]), !1;
                    if (r.length < 1) return (b.errors = [{ params: {} }]), !1;
                  }
                  l = t === i;
                } else l = !0;
                if (l) {
                  if (void 0 !== e.packageName) {
                    let r = e.packageName;
                    const t = i;
                    if (i === t) {
                      if ('string' != typeof r)
                        return (
                          (b.errors = [{ params: { type: 'string' } }]), !1
                        );
                      if (r.length < 1)
                        return (b.errors = [{ params: {} }]), !1;
                    }
                    l = t === i;
                  } else l = !0;
                  if (l) {
                    if (void 0 !== e.requiredVersion) {
                      let r = e.requiredVersion;
                      const t = i,
                        n = i;
                      let s = !1;
                      const a = i;
                      if (!1 !== r) {
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
                        if ('string' != typeof r) {
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
                        (l = t === i);
                    } else l = !0;
                    if (l) {
                      if (void 0 !== e.shareKey) {
                        let r = e.shareKey;
                        const t = i;
                        if (i === t) {
                          if ('string' != typeof r)
                            return (
                              (b.errors = [{ params: { type: 'string' } }]), !1
                            );
                          if (r.length < 1)
                            return (b.errors = [{ params: {} }]), !1;
                        }
                        l = t === i;
                      } else l = !0;
                      if (l) {
                        if (void 0 !== e.shareScope) {
                          let r = e.shareScope;
                          const t = i;
                          if (i === t) {
                            if ('string' != typeof r)
                              return (
                                (b.errors = [{ params: { type: 'string' } }]),
                                !1
                              );
                            if (r.length < 1)
                              return (b.errors = [{ params: {} }]), !1;
                          }
                          l = t === i;
                        } else l = !0;
                        if (l) {
                          if (void 0 !== e.singleton) {
                            const r = i;
                            if ('boolean' != typeof e.singleton)
                              return (
                                (b.errors = [{ params: { type: 'boolean' } }]),
                                !1
                              );
                            l = r === i;
                          } else l = !0;
                          if (l) {
                            if (void 0 !== e.strictVersion) {
                              const r = i;
                              if ('boolean' != typeof e.strictVersion)
                                return (
                                  (b.errors = [
                                    { params: { type: 'boolean' } },
                                  ]),
                                  !1
                                );
                              l = r === i;
                            } else l = !0;
                            if (l)
                              if (void 0 !== e.version) {
                                let r = e.version;
                                const t = i,
                                  n = i;
                                let s = !1;
                                const a = i;
                                if (!1 !== r) {
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
                                  if ('string' != typeof r) {
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
                                  (l = t === i);
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
function D(
  e,
  {
    instancePath: r = '',
    parentData: t,
    parentDataProperty: n,
    rootData: s = e,
  } = {},
) {
  let a = null,
    o = 0;
  if (0 === o) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (D.errors = [{ params: { type: 'object' } }]), !1;
    for (const t in e) {
      let n = e[t];
      const l = o,
        p = o;
      let f = !1;
      const m = o;
      b(n, {
        instancePath: r + '/' + t.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: t,
        rootData: s,
      }) || ((a = null === a ? b.errors : a.concat(b.errors)), (o = a.length));
      var i = m === o;
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
        return null === a ? (a = [e]) : a.push(e), o++, (D.errors = a), !1;
      }
      if (((o = p), null !== a && (p ? (a.length = p) : (a = null)), l !== o))
        break;
    }
  }
  return (D.errors = a), 0 === o;
}
function P(
  e,
  {
    instancePath: r = '',
    parentData: t,
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
      const t = e.length;
      for (let n = 0; n < t; n++) {
        let t = e[n];
        const i = o,
          l = o;
        let p = !1;
        const m = o;
        if (o == o)
          if ('string' == typeof t) {
            if (t.length < 1) {
              const e = { params: {} };
              null === a ? (a = [e]) : a.push(e), o++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === a ? (a = [e]) : a.push(e), o++;
          }
        var f = m === o;
        if (((p = p || f), !p)) {
          const i = o;
          D(t, {
            instancePath: r + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((a = null === a ? D.errors : a.concat(D.errors)), (o = a.length)),
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
  var m = p === o;
  if (((l = l || m), !l)) {
    const i = o;
    D(e, {
      instancePath: r,
      parentData: t,
      parentDataProperty: n,
      rootData: s,
    }) || ((a = null === a ? D.errors : a.concat(D.errors)), (o = a.length)),
      (m = i === o),
      (l = l || m);
  }
  if (!l) {
    const e = { params: {} };
    return null === a ? (a = [e]) : a.push(e), o++, (P.errors = a), !1;
  }
  return (
    (o = i),
    null !== a && (i ? (a.length = i) : (a = null)),
    (P.errors = a),
    0 === o
  );
}
function v(
  a,
  {
    instancePath: o = '',
    parentData: i,
    parentDataProperty: p,
    rootData: f = a,
  } = {},
) {
  let m = null,
    c = 0;
  if (0 === c) {
    if (!a || 'object' != typeof a || Array.isArray(a))
      return (v.errors = [{ params: { type: 'object' } }]), !1;
    {
      const i = c;
      for (const e in a)
        if (!s.call(r.properties, e))
          return (v.errors = [{ params: { additionalProperty: e } }]), !1;
      if (i === c) {
        if (void 0 !== a.async) {
          const e = c;
          if ('boolean' != typeof a.async)
            return (v.errors = [{ params: { type: 'boolean' } }]), !1;
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
              ((m = null === m ? l.errors : m.concat(l.errors)),
              (c = m.length)),
              (y = e === c);
          } else y = !0;
          if (y) {
            if (void 0 !== a.filename) {
              let r = a.filename;
              const t = c;
              if (c === t) {
                if ('string' != typeof r)
                  return (v.errors = [{ params: { type: 'string' } }]), !1;
                if (r.length < 1) return (v.errors = [{ params: {} }]), !1;
                if (r.includes('!') || !1 !== e.test(r))
                  return (v.errors = [{ params: {} }]), !1;
              }
              y = t === c;
            } else y = !0;
            if (y) {
              if (void 0 !== a.library) {
                const e = c;
                u(a.library, {
                  instancePath: o + '/library',
                  parentData: a,
                  parentDataProperty: 'library',
                  rootData: f,
                }) ||
                  ((m = null === m ? u.errors : m.concat(u.errors)),
                  (c = m.length)),
                  (y = e === c);
              } else y = !0;
              if (y) {
                if (void 0 !== a.name) {
                  let e = a.name;
                  const r = c;
                  if (c === r) {
                    if ('string' != typeof e)
                      return (v.errors = [{ params: { type: 'string' } }]), !1;
                    if (e.length < 1) return (v.errors = [{ params: {} }]), !1;
                  }
                  y = r === c;
                } else y = !0;
                if (y) {
                  if (void 0 !== a.remoteType) {
                    let e = a.remoteType;
                    const r = c,
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
                      const e = { params: { allowedValues: t.enum } };
                      null === m ? (m = [e]) : m.push(e), c++;
                    }
                    if ((i === c && ((s = !0), (o = 0)), !s)) {
                      const e = { params: { passingSchemas: o } };
                      return (
                        null === m ? (m = [e]) : m.push(e),
                        c++,
                        (v.errors = m),
                        !1
                      );
                    }
                    (c = n),
                      null !== m && (n ? (m.length = n) : (m = null)),
                      (y = r === c);
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
                        ((m = null === m ? h.errors : m.concat(h.errors)),
                        (c = m.length)),
                        (y = e === c);
                    } else y = !0;
                    if (y) {
                      if (void 0 !== a.runtime) {
                        let e = a.runtime;
                        const r = c,
                          t = c;
                        let s = !1;
                        const o = c;
                        if (!1 !== e) {
                          const e = {
                            params: { allowedValues: n.anyOf[0].enum },
                          };
                          null === m ? (m = [e]) : m.push(e), c++;
                        }
                        var g = o === c;
                        if (((s = s || g), !s)) {
                          const r = c;
                          if (c === r)
                            if ('string' == typeof e) {
                              if (e.length < 1) {
                                const e = { params: {} };
                                null === m ? (m = [e]) : m.push(e), c++;
                              }
                            } else {
                              const e = { params: { type: 'string' } };
                              null === m ? (m = [e]) : m.push(e), c++;
                            }
                          (g = r === c), (s = s || g);
                        }
                        if (!s) {
                          const e = { params: {} };
                          return (
                            null === m ? (m = [e]) : m.push(e),
                            c++,
                            (v.errors = m),
                            !1
                          );
                        }
                        (c = t),
                          null !== m && (t ? (m.length = t) : (m = null)),
                          (y = r === c);
                      } else y = !0;
                      if (y) {
                        if (void 0 !== a.shareScope) {
                          let e = a.shareScope;
                          const r = c;
                          if (c === r) {
                            if ('string' != typeof e)
                              return (
                                (v.errors = [{ params: { type: 'string' } }]),
                                !1
                              );
                            if (e.length < 1)
                              return (v.errors = [{ params: {} }]), !1;
                          }
                          y = r === c;
                        } else y = !0;
                        if (y) {
                          if (void 0 !== a.shared) {
                            const e = c;
                            P(a.shared, {
                              instancePath: o + '/shared',
                              parentData: a,
                              parentDataProperty: 'shared',
                              rootData: f,
                            }) ||
                              ((m = null === m ? P.errors : m.concat(P.errors)),
                              (c = m.length)),
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
                                    (v.errors = [
                                      { params: { type: 'object' } },
                                    ]),
                                    !1
                                  );
                                {
                                  const r = c;
                                  for (const r in e)
                                    if (
                                      'asyncStartup' !== r &&
                                      'externalRuntime' !== r &&
                                      'provideExternalRuntime' !== r
                                    )
                                      return (
                                        (v.errors = [
                                          { params: { additionalProperty: r } },
                                        ]),
                                        !1
                                      );
                                  if (r === c) {
                                    if (void 0 !== e.asyncStartup) {
                                      const r = c;
                                      if ('boolean' != typeof e.asyncStartup)
                                        return (
                                          (v.errors = [
                                            { params: { type: 'boolean' } },
                                          ]),
                                          !1
                                        );
                                      var d = r === c;
                                    } else d = !0;
                                    if (d) {
                                      if (void 0 !== e.externalRuntime) {
                                        const r = c;
                                        if (
                                          'boolean' != typeof e.externalRuntime
                                        )
                                          return (
                                            (v.errors = [
                                              { params: { type: 'boolean' } },
                                            ]),
                                            !1
                                          );
                                        d = r === c;
                                      } else d = !0;
                                      if (d)
                                        if (
                                          void 0 !== e.provideExternalRuntime
                                        ) {
                                          const r = c;
                                          if (
                                            'boolean' !=
                                            typeof e.provideExternalRuntime
                                          )
                                            return (
                                              (v.errors = [
                                                { params: { type: 'boolean' } },
                                              ]),
                                              !1
                                            );
                                          d = r === c;
                                        } else d = !0;
                                    }
                                  }
                                }
                              }
                              y = r === c;
                            } else y = !0;
                            if (y) {
                              if (void 0 !== a.runtimePlugins) {
                                let e = a.runtimePlugins;
                                const r = c;
                                if (c === r) {
                                  if (!Array.isArray(e))
                                    return (
                                      (v.errors = [
                                        { params: { type: 'array' } },
                                      ]),
                                      !1
                                    );
                                  {
                                    const r = e.length;
                                    for (let t = 0; t < r; t++) {
                                      const r = c;
                                      if ('string' != typeof e[t])
                                        return (
                                          (v.errors = [
                                            { params: { type: 'string' } },
                                          ]),
                                          !1
                                        );
                                      if (r !== c) break;
                                    }
                                  }
                                }
                                y = r === c;
                              } else y = !0;
                              if (y) {
                                if (void 0 !== a.dataPrefetch) {
                                  const e = c;
                                  if ('boolean' != typeof a.dataPrefetch)
                                    return (
                                      (v.errors = [
                                        { params: { type: 'boolean' } },
                                      ]),
                                      !1
                                    );
                                  y = e === c;
                                } else y = !0;
                                if (y)
                                  if (void 0 !== a.virtualRuntimeEntry) {
                                    const e = c;
                                    if (
                                      'boolean' != typeof a.virtualRuntimeEntry
                                    )
                                      return (
                                        (v.errors = [
                                          { params: { type: 'boolean' } },
                                        ]),
                                        !1
                                      );
                                    y = e === c;
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
  return (v.errors = m), 0 === c;
}
