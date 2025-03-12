// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
const t = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
export const validate = u;
export default u;
const e = {
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
      UmdNamedDefine: { type: 'boolean' },
    },
    type: 'object',
    additionalProperties: !1,
    properties: {
      exposes: { $ref: '#/definitions/Exposes' },
      filename: { type: 'string', absolutePath: !1, minLength: 1 },
      library: { $ref: '#/definitions/LibraryOptions' },
      name: { type: 'string', minLength: 1 },
      runtime: { $ref: '#/definitions/EntryRuntime' },
      shareScope: {
        anyOf: [
          { type: 'string', minLength: 1 },
          { type: 'array', items: { type: 'string', minLength: 1 } },
        ],
      },
      experiments: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          asyncStartup: { type: 'boolean' },
          externalRuntime: { type: 'boolean', default: !1 },
          provideExternalRuntime: { type: 'boolean', default: !1 },
        },
      },
      dataPrefetch: { type: 'boolean' },
      runtimePlugins: { type: 'array', items: { type: 'string' } },
    },
    required: ['name', 'exposes'],
  },
  r = { anyOf: [{ enum: [!1] }, { type: 'string', minLength: 1 }] },
  n = Object.prototype.hasOwnProperty;
function s(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: n,
    rootData: a = t,
  } = {},
) {
  if (!Array.isArray(t))
    return (s.errors = [{ params: { type: 'array' } }]), !1;
  {
    const e = t.length;
    for (let r = 0; r < e; r++) {
      let e = t[r];
      const n = 0;
      if ('string' != typeof e)
        return (s.errors = [{ params: { type: 'string' } }]), !1;
      if (e.length < 1) return (s.errors = [{ params: {} }]), !1;
      if (0 !== n) break;
    }
  }
  return (s.errors = null), !0;
}
function a(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: n,
    rootData: o = t,
  } = {},
) {
  let i = null,
    p = 0;
  if (0 === p) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === t.import && (r = 'import'))
        return (a.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = p;
        for (const e in t)
          if ('import' !== e && 'name' !== e)
            return (a.errors = [{ params: { additionalProperty: e } }]), !1;
        if (r === p) {
          if (void 0 !== t.import) {
            let r = t.import;
            const n = p,
              m = p;
            let u = !1;
            const c = p;
            if (p == p)
              if ('string' == typeof r) {
                if (r.length < 1) {
                  const t = { params: {} };
                  null === i ? (i = [t]) : i.push(t), p++;
                }
              } else {
                const t = { params: { type: 'string' } };
                null === i ? (i = [t]) : i.push(t), p++;
              }
            var l = c === p;
            if (((u = u || l), !u)) {
              const n = p;
              s(r, {
                instancePath: e + '/import',
                parentData: t,
                parentDataProperty: 'import',
                rootData: o,
              }) ||
                ((i = null === i ? s.errors : i.concat(s.errors)),
                (p = i.length)),
                (l = n === p),
                (u = u || l);
            }
            if (!u) {
              const t = { params: {} };
              return (
                null === i ? (i = [t]) : i.push(t), p++, (a.errors = i), !1
              );
            }
            (p = m), null !== i && (m ? (i.length = m) : (i = null));
            var f = n === p;
          } else f = !0;
          if (f)
            if (void 0 !== t.name) {
              const e = p;
              if ('string' != typeof t.name)
                return (a.errors = [{ params: { type: 'string' } }]), !1;
              f = e === p;
            } else f = !0;
        }
      }
    }
  }
  return (a.errors = i), 0 === p;
}
function o(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: n,
    rootData: i = t,
  } = {},
) {
  let p = null,
    l = 0;
  if (0 === l) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (o.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in t) {
      let n = t[r];
      const m = l,
        u = l;
      let c = !1;
      const y = l;
      a(n, {
        instancePath: e + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: t,
        parentDataProperty: r,
        rootData: i,
      }) || ((p = null === p ? a.errors : p.concat(a.errors)), (l = p.length));
      var f = y === l;
      if (((c = c || f), !c)) {
        const a = l;
        if (l == l)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const t = { params: {} };
              null === p ? (p = [t]) : p.push(t), l++;
            }
          } else {
            const t = { params: { type: 'string' } };
            null === p ? (p = [t]) : p.push(t), l++;
          }
        if (((f = a === l), (c = c || f), !c)) {
          const a = l;
          s(n, {
            instancePath: e + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: t,
            parentDataProperty: r,
            rootData: i,
          }) ||
            ((p = null === p ? s.errors : p.concat(s.errors)), (l = p.length)),
            (f = a === l),
            (c = c || f);
        }
      }
      if (!c) {
        const t = { params: {} };
        return null === p ? (p = [t]) : p.push(t), l++, (o.errors = p), !1;
      }
      if (((l = u), null !== p && (u ? (p.length = u) : (p = null)), m !== l))
        break;
    }
  }
  return (o.errors = p), 0 === l;
}
function i(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = t,
  } = {},
) {
  let a = null,
    p = 0;
  const l = p;
  let f = !1;
  const m = p;
  if (p === m)
    if (Array.isArray(t)) {
      const r = t.length;
      for (let n = 0; n < r; n++) {
        let r = t[n];
        const i = p,
          l = p;
        let f = !1;
        const m = p;
        if (p == p)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const t = { params: {} };
              null === a ? (a = [t]) : a.push(t), p++;
            }
          } else {
            const t = { params: { type: 'string' } };
            null === a ? (a = [t]) : a.push(t), p++;
          }
        var u = m === p;
        if (((f = f || u), !f)) {
          const i = p;
          o(r, {
            instancePath: e + '/' + n,
            parentData: t,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((a = null === a ? o.errors : a.concat(o.errors)), (p = a.length)),
            (u = i === p),
            (f = f || u);
        }
        if (f) (p = l), null !== a && (l ? (a.length = l) : (a = null));
        else {
          const t = { params: {} };
          null === a ? (a = [t]) : a.push(t), p++;
        }
        if (i !== p) break;
      }
    } else {
      const t = { params: { type: 'array' } };
      null === a ? (a = [t]) : a.push(t), p++;
    }
  var c = m === p;
  if (((f = f || c), !f)) {
    const i = p;
    o(t, {
      instancePath: e,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((a = null === a ? o.errors : a.concat(o.errors)), (p = a.length)),
      (c = i === p),
      (f = f || c);
  }
  if (!f) {
    const t = { params: {} };
    return null === a ? (a = [t]) : a.push(t), p++, (i.errors = a), !1;
  }
  return (
    (p = l),
    null !== a && (l ? (a.length = l) : (a = null)),
    (i.errors = a),
    0 === p
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
function l(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = t,
  } = {},
) {
  let a = null,
    o = 0;
  const i = o;
  let p = !1;
  const f = o;
  if ('string' != typeof t) {
    const t = { params: { type: 'string' } };
    null === a ? (a = [t]) : a.push(t), o++;
  }
  var m = f === o;
  if (((p = p || m), !p)) {
    const e = o;
    if (o == o)
      if (t && 'object' == typeof t && !Array.isArray(t)) {
        const e = o;
        for (const e in t)
          if (
            'amd' !== e &&
            'commonjs' !== e &&
            'commonjs2' !== e &&
            'root' !== e
          ) {
            const t = { params: { additionalProperty: e } };
            null === a ? (a = [t]) : a.push(t), o++;
            break;
          }
        if (e === o) {
          if (void 0 !== t.amd) {
            const e = o;
            if ('string' != typeof t.amd) {
              const t = { params: { type: 'string' } };
              null === a ? (a = [t]) : a.push(t), o++;
            }
            var u = e === o;
          } else u = !0;
          if (u) {
            if (void 0 !== t.commonjs) {
              const e = o;
              if ('string' != typeof t.commonjs) {
                const t = { params: { type: 'string' } };
                null === a ? (a = [t]) : a.push(t), o++;
              }
              u = e === o;
            } else u = !0;
            if (u) {
              if (void 0 !== t.commonjs2) {
                const e = o;
                if ('string' != typeof t.commonjs2) {
                  const t = { params: { type: 'string' } };
                  null === a ? (a = [t]) : a.push(t), o++;
                }
                u = e === o;
              } else u = !0;
              if (u)
                if (void 0 !== t.root) {
                  const e = o;
                  if ('string' != typeof t.root) {
                    const t = { params: { type: 'string' } };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                  u = e === o;
                } else u = !0;
            }
          }
        }
      } else {
        const t = { params: { type: 'object' } };
        null === a ? (a = [t]) : a.push(t), o++;
      }
    (m = e === o), (p = p || m);
  }
  if (!p) {
    const t = { params: {} };
    return null === a ? (a = [t]) : a.push(t), o++, (l.errors = a), !1;
  }
  return (
    (o = i),
    null !== a && (i ? (a.length = i) : (a = null)),
    (l.errors = a),
    0 === o
  );
}
function f(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = t,
  } = {},
) {
  let a = null,
    o = 0;
  const i = o;
  let p = !1;
  const l = o;
  if (o === l)
    if (Array.isArray(t))
      if (t.length < 1) {
        const t = { params: { limit: 1 } };
        null === a ? (a = [t]) : a.push(t), o++;
      } else {
        const e = t.length;
        for (let r = 0; r < e; r++) {
          let e = t[r];
          const n = o;
          if (o === n)
            if ('string' == typeof e) {
              if (e.length < 1) {
                const t = { params: {} };
                null === a ? (a = [t]) : a.push(t), o++;
              }
            } else {
              const t = { params: { type: 'string' } };
              null === a ? (a = [t]) : a.push(t), o++;
            }
          if (n !== o) break;
        }
      }
    else {
      const t = { params: { type: 'array' } };
      null === a ? (a = [t]) : a.push(t), o++;
    }
  var m = l === o;
  if (((p = p || m), !p)) {
    const e = o;
    if (o === e)
      if ('string' == typeof t) {
        if (t.length < 1) {
          const t = { params: {} };
          null === a ? (a = [t]) : a.push(t), o++;
        }
      } else {
        const t = { params: { type: 'string' } };
        null === a ? (a = [t]) : a.push(t), o++;
      }
    if (((m = e === o), (p = p || m), !p)) {
      const e = o;
      if (o == o)
        if (t && 'object' == typeof t && !Array.isArray(t)) {
          const e = o;
          for (const e in t)
            if ('amd' !== e && 'commonjs' !== e && 'root' !== e) {
              const t = { params: { additionalProperty: e } };
              null === a ? (a = [t]) : a.push(t), o++;
              break;
            }
          if (e === o) {
            if (void 0 !== t.amd) {
              let e = t.amd;
              const r = o;
              if (o === r)
                if ('string' == typeof e) {
                  if (e.length < 1) {
                    const t = { params: {} };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                } else {
                  const t = { params: { type: 'string' } };
                  null === a ? (a = [t]) : a.push(t), o++;
                }
              var u = r === o;
            } else u = !0;
            if (u) {
              if (void 0 !== t.commonjs) {
                let e = t.commonjs;
                const r = o;
                if (o === r)
                  if ('string' == typeof e) {
                    if (e.length < 1) {
                      const t = { params: {} };
                      null === a ? (a = [t]) : a.push(t), o++;
                    }
                  } else {
                    const t = { params: { type: 'string' } };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                u = r === o;
              } else u = !0;
              if (u)
                if (void 0 !== t.root) {
                  let e = t.root;
                  const r = o,
                    n = o;
                  let s = !1;
                  const i = o;
                  if (o === i)
                    if (Array.isArray(e)) {
                      const t = e.length;
                      for (let r = 0; r < t; r++) {
                        let t = e[r];
                        const n = o;
                        if (o === n)
                          if ('string' == typeof t) {
                            if (t.length < 1) {
                              const t = { params: {} };
                              null === a ? (a = [t]) : a.push(t), o++;
                            }
                          } else {
                            const t = { params: { type: 'string' } };
                            null === a ? (a = [t]) : a.push(t), o++;
                          }
                        if (n !== o) break;
                      }
                    } else {
                      const t = { params: { type: 'array' } };
                      null === a ? (a = [t]) : a.push(t), o++;
                    }
                  var c = i === o;
                  if (((s = s || c), !s)) {
                    const t = o;
                    if (o === t)
                      if ('string' == typeof e) {
                        if (e.length < 1) {
                          const t = { params: {} };
                          null === a ? (a = [t]) : a.push(t), o++;
                        }
                      } else {
                        const t = { params: { type: 'string' } };
                        null === a ? (a = [t]) : a.push(t), o++;
                      }
                    (c = t === o), (s = s || c);
                  }
                  if (s)
                    (o = n), null !== a && (n ? (a.length = n) : (a = null));
                  else {
                    const t = { params: {} };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                  u = r === o;
                } else u = !0;
            }
          }
        } else {
          const t = { params: { type: 'object' } };
          null === a ? (a = [t]) : a.push(t), o++;
        }
      (m = e === o), (p = p || m);
    }
  }
  if (!p) {
    const t = { params: {} };
    return null === a ? (a = [t]) : a.push(t), o++, (f.errors = a), !1;
  }
  return (
    (o = i),
    null !== a && (i ? (a.length = i) : (a = null)),
    (f.errors = a),
    0 === o
  );
}
function m(
  t,
  {
    instancePath: e = '',
    parentData: r,
    parentDataProperty: n,
    rootData: s = t,
  } = {},
) {
  let a = null,
    o = 0;
  if (0 === o) {
    if (!t || 'object' != typeof t || Array.isArray(t))
      return (m.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === t.type && (r = 'type'))
        return (m.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = o;
        for (const e in t)
          if (
            'amdContainer' !== e &&
            'auxiliaryComment' !== e &&
            'export' !== e &&
            'name' !== e &&
            'type' !== e &&
            'umdNamedDefine' !== e
          )
            return (m.errors = [{ params: { additionalProperty: e } }]), !1;
        if (r === o) {
          if (void 0 !== t.amdContainer) {
            let e = t.amdContainer;
            const r = o;
            if (o == o) {
              if ('string' != typeof e)
                return (m.errors = [{ params: { type: 'string' } }]), !1;
              if (e.length < 1) return (m.errors = [{ params: {} }]), !1;
            }
            var i = r === o;
          } else i = !0;
          if (i) {
            if (void 0 !== t.auxiliaryComment) {
              const r = o;
              l(t.auxiliaryComment, {
                instancePath: e + '/auxiliaryComment',
                parentData: t,
                parentDataProperty: 'auxiliaryComment',
                rootData: s,
              }) ||
                ((a = null === a ? l.errors : a.concat(l.errors)),
                (o = a.length)),
                (i = r === o);
            } else i = !0;
            if (i) {
              if (void 0 !== t.export) {
                let e = t.export;
                const r = o,
                  n = o;
                let s = !1;
                const p = o;
                if (o === p)
                  if (Array.isArray(e)) {
                    const t = e.length;
                    for (let r = 0; r < t; r++) {
                      let t = e[r];
                      const n = o;
                      if (o === n)
                        if ('string' == typeof t) {
                          if (t.length < 1) {
                            const t = { params: {} };
                            null === a ? (a = [t]) : a.push(t), o++;
                          }
                        } else {
                          const t = { params: { type: 'string' } };
                          null === a ? (a = [t]) : a.push(t), o++;
                        }
                      if (n !== o) break;
                    }
                  } else {
                    const t = { params: { type: 'array' } };
                    null === a ? (a = [t]) : a.push(t), o++;
                  }
                var u = p === o;
                if (((s = s || u), !s)) {
                  const t = o;
                  if (o === t)
                    if ('string' == typeof e) {
                      if (e.length < 1) {
                        const t = { params: {} };
                        null === a ? (a = [t]) : a.push(t), o++;
                      }
                    } else {
                      const t = { params: { type: 'string' } };
                      null === a ? (a = [t]) : a.push(t), o++;
                    }
                  (u = t === o), (s = s || u);
                }
                if (!s) {
                  const t = { params: {} };
                  return (
                    null === a ? (a = [t]) : a.push(t), o++, (m.errors = a), !1
                  );
                }
                (o = n),
                  null !== a && (n ? (a.length = n) : (a = null)),
                  (i = r === o);
              } else i = !0;
              if (i) {
                if (void 0 !== t.name) {
                  const r = o;
                  f(t.name, {
                    instancePath: e + '/name',
                    parentData: t,
                    parentDataProperty: 'name',
                    rootData: s,
                  }) ||
                    ((a = null === a ? f.errors : a.concat(f.errors)),
                    (o = a.length)),
                    (i = r === o);
                } else i = !0;
                if (i) {
                  if (void 0 !== t.type) {
                    let e = t.type;
                    const r = o,
                      n = o;
                    let s = !1;
                    const l = o;
                    if (
                      'var' !== e &&
                      'module' !== e &&
                      'assign' !== e &&
                      'assign-properties' !== e &&
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
                      'system' !== e
                    ) {
                      const t = { params: { allowedValues: p.anyOf[0].enum } };
                      null === a ? (a = [t]) : a.push(t), o++;
                    }
                    var c = l === o;
                    if (((s = s || c), !s)) {
                      const t = o;
                      if ('string' != typeof e) {
                        const t = { params: { type: 'string' } };
                        null === a ? (a = [t]) : a.push(t), o++;
                      }
                      (c = t === o), (s = s || c);
                    }
                    if (!s) {
                      const t = { params: {} };
                      return (
                        null === a ? (a = [t]) : a.push(t),
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
                    if (void 0 !== t.umdNamedDefine) {
                      const e = o;
                      if ('boolean' != typeof t.umdNamedDefine)
                        return (
                          (m.errors = [{ params: { type: 'boolean' } }]), !1
                        );
                      i = e === o;
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
function u(
  s,
  {
    instancePath: a = '',
    parentData: o,
    parentDataProperty: p,
    rootData: l = s,
  } = {},
) {
  let f = null,
    c = 0;
  if (0 === c) {
    if (!s || 'object' != typeof s || Array.isArray(s))
      return (u.errors = [{ params: { type: 'object' } }]), !1;
    {
      let o;
      if (
        (void 0 === s.name && (o = 'name')) ||
        (void 0 === s.exposes && (o = 'exposes'))
      )
        return (u.errors = [{ params: { missingProperty: o } }]), !1;
      {
        const o = c;
        for (const t in s)
          if (!n.call(e.properties, t))
            return (u.errors = [{ params: { additionalProperty: t } }]), !1;
        if (o === c) {
          if (void 0 !== s.exposes) {
            const t = c;
            i(s.exposes, {
              instancePath: a + '/exposes',
              parentData: s,
              parentDataProperty: 'exposes',
              rootData: l,
            }) ||
              ((f = null === f ? i.errors : f.concat(i.errors)),
              (c = f.length));
            var y = t === c;
          } else y = !0;
          if (y) {
            if (void 0 !== s.filename) {
              let e = s.filename;
              const r = c;
              if (c === r) {
                if ('string' != typeof e)
                  return (u.errors = [{ params: { type: 'string' } }]), !1;
                if (e.length < 1) return (u.errors = [{ params: {} }]), !1;
                if (e.includes('!') || !1 !== t.test(e))
                  return (u.errors = [{ params: {} }]), !1;
              }
              y = r === c;
            } else y = !0;
            if (y) {
              if (void 0 !== s.library) {
                const t = c;
                m(s.library, {
                  instancePath: a + '/library',
                  parentData: s,
                  parentDataProperty: 'library',
                  rootData: l,
                }) ||
                  ((f = null === f ? m.errors : f.concat(m.errors)),
                  (c = f.length)),
                  (y = t === c);
              } else y = !0;
              if (y) {
                if (void 0 !== s.name) {
                  let t = s.name;
                  const e = c;
                  if (c === e) {
                    if ('string' != typeof t)
                      return (u.errors = [{ params: { type: 'string' } }]), !1;
                    if (t.length < 1) return (u.errors = [{ params: {} }]), !1;
                  }
                  y = e === c;
                } else y = !0;
                if (y) {
                  if (void 0 !== s.runtime) {
                    let t = s.runtime;
                    const e = c,
                      n = c;
                    let a = !1;
                    const o = c;
                    if (!1 !== t) {
                      const t = { params: { allowedValues: r.anyOf[0].enum } };
                      null === f ? (f = [t]) : f.push(t), c++;
                    }
                    var g = o === c;
                    if (((a = a || g), !a)) {
                      const e = c;
                      if (c === e)
                        if ('string' == typeof t) {
                          if (t.length < 1) {
                            const t = { params: {} };
                            null === f ? (f = [t]) : f.push(t), c++;
                          }
                        } else {
                          const t = { params: { type: 'string' } };
                          null === f ? (f = [t]) : f.push(t), c++;
                        }
                      (g = e === c), (a = a || g);
                    }
                    if (!a) {
                      const t = { params: {} };
                      return (
                        null === f ? (f = [t]) : f.push(t),
                        c++,
                        (u.errors = f),
                        !1
                      );
                    }
                    (c = n),
                      null !== f && (n ? (f.length = n) : (f = null)),
                      (y = e === c);
                  } else y = !0;
                  if (y) {
                    if (void 0 !== s.shareScope) {
                      let t = s.shareScope;
                      const e = c,
                        r = c;
                      let n = !1;
                      const a = c;
                      if (c === a)
                        if ('string' == typeof t) {
                          if (t.length < 1) {
                            const t = { params: {} };
                            null === f ? (f = [t]) : f.push(t), c++;
                          }
                        } else {
                          const t = { params: { type: 'string' } };
                          null === f ? (f = [t]) : f.push(t), c++;
                        }
                      var h = a === c;
                      if (((n = n || h), !n)) {
                        const e = c;
                        if (c === e)
                          if (Array.isArray(t)) {
                            const e = t.length;
                            for (let r = 0; r < e; r++) {
                              let e = t[r];
                              const n = c;
                              if (c === n)
                                if ('string' == typeof e) {
                                  if (e.length < 1) {
                                    const t = { params: {} };
                                    null === f ? (f = [t]) : f.push(t), c++;
                                  }
                                } else {
                                  const t = { params: { type: 'string' } };
                                  null === f ? (f = [t]) : f.push(t), c++;
                                }
                              if (n !== c) break;
                            }
                          } else {
                            const t = { params: { type: 'array' } };
                            null === f ? (f = [t]) : f.push(t), c++;
                          }
                        (h = e === c), (n = n || h);
                      }
                      if (!n) {
                        const t = { params: {} };
                        return (
                          null === f ? (f = [t]) : f.push(t),
                          c++,
                          (u.errors = f),
                          !1
                        );
                      }
                      (c = r),
                        null !== f && (r ? (f.length = r) : (f = null)),
                        (y = e === c);
                    } else y = !0;
                    if (y) {
                      if (void 0 !== s.experiments) {
                        let t = s.experiments;
                        const e = c;
                        if (c === e) {
                          if (!t || 'object' != typeof t || Array.isArray(t))
                            return (
                              (u.errors = [{ params: { type: 'object' } }]), !1
                            );
                          {
                            const e = c;
                            for (const e in t)
                              if (
                                'asyncStartup' !== e &&
                                'externalRuntime' !== e &&
                                'provideExternalRuntime' !== e
                              )
                                return (
                                  (u.errors = [
                                    { params: { additionalProperty: e } },
                                  ]),
                                  !1
                                );
                            if (e === c) {
                              if (void 0 !== t.asyncStartup) {
                                const e = c;
                                if ('boolean' != typeof t.asyncStartup)
                                  return (
                                    (u.errors = [
                                      { params: { type: 'boolean' } },
                                    ]),
                                    !1
                                  );
                                var d = e === c;
                              } else d = !0;
                              if (d) {
                                if (void 0 !== t.externalRuntime) {
                                  const e = c;
                                  if ('boolean' != typeof t.externalRuntime)
                                    return (
                                      (u.errors = [
                                        { params: { type: 'boolean' } },
                                      ]),
                                      !1
                                    );
                                  d = e === c;
                                } else d = !0;
                                if (d)
                                  if (void 0 !== t.provideExternalRuntime) {
                                    const e = c;
                                    if (
                                      'boolean' !=
                                      typeof t.provideExternalRuntime
                                    )
                                      return (
                                        (u.errors = [
                                          { params: { type: 'boolean' } },
                                        ]),
                                        !1
                                      );
                                    d = e === c;
                                  } else d = !0;
                              }
                            }
                          }
                        }
                        y = e === c;
                      } else y = !0;
                      if (y) {
                        if (void 0 !== s.dataPrefetch) {
                          const t = c;
                          if ('boolean' != typeof s.dataPrefetch)
                            return (
                              (u.errors = [{ params: { type: 'boolean' } }]), !1
                            );
                          y = t === c;
                        } else y = !0;
                        if (y)
                          if (void 0 !== s.runtimePlugins) {
                            let t = s.runtimePlugins;
                            const e = c;
                            if (c === e) {
                              if (!Array.isArray(t))
                                return (
                                  (u.errors = [{ params: { type: 'array' } }]),
                                  !1
                                );
                              {
                                const e = t.length;
                                for (let r = 0; r < e; r++) {
                                  const e = c;
                                  if ('string' != typeof t[r])
                                    return (
                                      (u.errors = [
                                        { params: { type: 'string' } },
                                      ]),
                                      !1
                                    );
                                  if (e !== c) break;
                                }
                              }
                            }
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
  return (u.errors = f), 0 === c;
}
