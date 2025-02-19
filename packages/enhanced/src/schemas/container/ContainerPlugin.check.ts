// @ts-nocheck
/* eslint-disable */
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 */
const e = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/;
export const validate = u;
export default u;
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
      shareScope: { type: 'string', minLength: 1 },
      experiments: {
        type: 'object',
        additionalProperties: !1,
        properties: {
          federationRuntime: { oneOf: [{ enum: [!1] }, { enum: ['hoisted'] }] },
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
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: o = e,
  } = {},
) {
  if (!Array.isArray(e))
    return (s.errors = [{ params: { type: 'array' } }]), !1;
  {
    const t = e.length;
    for (let r = 0; r < t; r++) {
      let t = e[r];
      const n = 0;
      if ('string' != typeof t)
        return (s.errors = [{ params: { type: 'string' } }]), !1;
      if (t.length < 1) return (s.errors = [{ params: {} }]), !1;
      if (0 !== n) break;
    }
  }
  return (s.errors = null), !0;
}
function o(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: a = e,
  } = {},
) {
  let i = null,
    p = 0;
  if (0 === p) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (o.errors = [{ params: { type: 'object' } }]), !1;
    {
      let r;
      if (void 0 === e.import && (r = 'import'))
        return (o.errors = [{ params: { missingProperty: r } }]), !1;
      {
        const r = p;
        for (const t in e)
          if ('import' !== t && 'name' !== t)
            return (o.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === p) {
          if (void 0 !== e.import) {
            let r = e.import;
            const n = p,
              m = p;
            let u = !1;
            const c = p;
            if (p == p)
              if ('string' == typeof r) {
                if (r.length < 1) {
                  const e = { params: {} };
                  null === i ? (i = [e]) : i.push(e), p++;
                }
              } else {
                const e = { params: { type: 'string' } };
                null === i ? (i = [e]) : i.push(e), p++;
              }
            var l = c === p;
            if (((u = u || l), !u)) {
              const n = p;
              s(r, {
                instancePath: t + '/import',
                parentData: e,
                parentDataProperty: 'import',
                rootData: a,
              }) ||
                ((i = null === i ? s.errors : i.concat(s.errors)),
                (p = i.length)),
                (l = n === p),
                (u = u || l);
            }
            if (!u) {
              const e = { params: {} };
              return (
                null === i ? (i = [e]) : i.push(e), p++, (o.errors = i), !1
              );
            }
            (p = m), null !== i && (m ? (i.length = m) : (i = null));
            var f = n === p;
          } else f = !0;
          if (f)
            if (void 0 !== e.name) {
              const t = p;
              if ('string' != typeof e.name)
                return (o.errors = [{ params: { type: 'string' } }]), !1;
              f = t === p;
            } else f = !0;
        }
      }
    }
  }
  return (o.errors = i), 0 === p;
}
function a(
  e,
  {
    instancePath: t = '',
    parentData: r,
    parentDataProperty: n,
    rootData: i = e,
  } = {},
) {
  let p = null,
    l = 0;
  if (0 === l) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (a.errors = [{ params: { type: 'object' } }]), !1;
    for (const r in e) {
      let n = e[r];
      const m = l,
        u = l;
      let c = !1;
      const y = l;
      o(n, {
        instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: e,
        parentDataProperty: r,
        rootData: i,
      }) || ((p = null === p ? o.errors : p.concat(o.errors)), (l = p.length));
      var f = y === l;
      if (((c = c || f), !c)) {
        const o = l;
        if (l == l)
          if ('string' == typeof n) {
            if (n.length < 1) {
              const e = { params: {} };
              null === p ? (p = [e]) : p.push(e), l++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === p ? (p = [e]) : p.push(e), l++;
          }
        if (((f = o === l), (c = c || f), !c)) {
          const o = l;
          s(n, {
            instancePath: t + '/' + r.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: e,
            parentDataProperty: r,
            rootData: i,
          }) ||
            ((p = null === p ? s.errors : p.concat(s.errors)), (l = p.length)),
            (f = o === l),
            (c = c || f);
        }
      }
      if (!c) {
        const e = { params: {} };
        return null === p ? (p = [e]) : p.push(e), l++, (a.errors = p), !1;
      }
      if (((l = u), null !== p && (u ? (p.length = u) : (p = null)), m !== l))
        break;
    }
  }
  return (a.errors = p), 0 === l;
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
  let o = null,
    p = 0;
  const l = p;
  let f = !1;
  const m = p;
  if (p === m)
    if (Array.isArray(e)) {
      const r = e.length;
      for (let n = 0; n < r; n++) {
        let r = e[n];
        const i = p,
          l = p;
        let f = !1;
        const m = p;
        if (p == p)
          if ('string' == typeof r) {
            if (r.length < 1) {
              const e = { params: {} };
              null === o ? (o = [e]) : o.push(e), p++;
            }
          } else {
            const e = { params: { type: 'string' } };
            null === o ? (o = [e]) : o.push(e), p++;
          }
        var u = m === p;
        if (((f = f || u), !f)) {
          const i = p;
          a(r, {
            instancePath: t + '/' + n,
            parentData: e,
            parentDataProperty: n,
            rootData: s,
          }) ||
            ((o = null === o ? a.errors : o.concat(a.errors)), (p = o.length)),
            (u = i === p),
            (f = f || u);
        }
        if (f) (p = l), null !== o && (l ? (o.length = l) : (o = null));
        else {
          const e = { params: {} };
          null === o ? (o = [e]) : o.push(e), p++;
        }
        if (i !== p) break;
      }
    } else {
      const e = { params: { type: 'array' } };
      null === o ? (o = [e]) : o.push(e), p++;
    }
  var c = m === p;
  if (((f = f || c), !f)) {
    const i = p;
    a(e, {
      instancePath: t,
      parentData: r,
      parentDataProperty: n,
      rootData: s,
    }) || ((o = null === o ? a.errors : o.concat(a.errors)), (p = o.length)),
      (c = i === p),
      (f = f || c);
  }
  if (!f) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), p++, (i.errors = o), !1;
  }
  return (
    (p = l),
    null !== o && (l ? (o.length = l) : (o = null)),
    (i.errors = o),
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
  let p = !1;
  const f = a;
  if ('string' != typeof e) {
    const e = { params: { type: 'string' } };
    null === o ? (o = [e]) : o.push(e), a++;
  }
  var m = f === a;
  if (((p = p || m), !p)) {
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
    (m = t === a), (p = p || m);
  }
  if (!p) {
    const e = { params: {} };
    return null === o ? (o = [e]) : o.push(e), a++, (l.errors = o), !1;
  }
  return (
    (a = i),
    null !== o && (i ? (o.length = i) : (o = null)),
    (l.errors = o),
    0 === a
  );
}
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
  let p = !1;
  const l = a;
  if (a === l)
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
  var m = l === a;
  if (((p = p || m), !p)) {
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
    if (((m = t === a), (p = p || m), !p)) {
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
      (m = t === a), (p = p || m);
    }
  }
  if (!p) {
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
      if (void 0 === e.type && (r = 'type'))
        return (m.errors = [{ params: { missingProperty: r } }]), !1;
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
            return (m.errors = [{ params: { additionalProperty: t } }]), !1;
        if (r === a) {
          if (void 0 !== e.amdContainer) {
            let t = e.amdContainer;
            const r = a;
            if (a == a) {
              if ('string' != typeof t)
                return (m.errors = [{ params: { type: 'string' } }]), !1;
              if (t.length < 1) return (m.errors = [{ params: {} }]), !1;
            }
            var i = r === a;
          } else i = !0;
          if (i) {
            if (void 0 !== e.auxiliaryComment) {
              const r = a;
              l(e.auxiliaryComment, {
                instancePath: t + '/auxiliaryComment',
                parentData: e,
                parentDataProperty: 'auxiliaryComment',
                rootData: s,
              }) ||
                ((o = null === o ? l.errors : o.concat(l.errors)),
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
                var u = p === a;
                if (((s = s || u), !s)) {
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
                  (u = e === a), (s = s || u);
                }
                if (!s) {
                  const e = { params: {} };
                  return (
                    null === o ? (o = [e]) : o.push(e), a++, (m.errors = o), !1
                  );
                }
                (a = n),
                  null !== o && (n ? (o.length = n) : (o = null)),
                  (i = r === a);
              } else i = !0;
              if (i) {
                if (void 0 !== e.name) {
                  const r = a;
                  f(e.name, {
                    instancePath: t + '/name',
                    parentData: e,
                    parentDataProperty: 'name',
                    rootData: s,
                  }) ||
                    ((o = null === o ? f.errors : o.concat(f.errors)),
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
                        (m.errors = o),
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
                          (m.errors = [{ params: { type: 'boolean' } }]), !1
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
  return (m.errors = o), 0 === a;
}
function u(
  s,
  {
    instancePath: o = '',
    parentData: a,
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
      let a;
      if (
        (void 0 === s.name && (a = 'name')) ||
        (void 0 === s.exposes && (a = 'exposes'))
      )
        return (u.errors = [{ params: { missingProperty: a } }]), !1;
      {
        const a = c;
        for (const e in s)
          if (!n.call(t.properties, e))
            return (u.errors = [{ params: { additionalProperty: e } }]), !1;
        if (a === c) {
          if (void 0 !== s.exposes) {
            const e = c;
            i(s.exposes, {
              instancePath: o + '/exposes',
              parentData: s,
              parentDataProperty: 'exposes',
              rootData: l,
            }) ||
              ((f = null === f ? i.errors : f.concat(i.errors)),
              (c = f.length));
            var y = e === c;
          } else y = !0;
          if (y) {
            if (void 0 !== s.filename) {
              let t = s.filename;
              const r = c;
              if (c === r) {
                if ('string' != typeof t)
                  return (u.errors = [{ params: { type: 'string' } }]), !1;
                if (t.length < 1) return (u.errors = [{ params: {} }]), !1;
                if (t.includes('!') || !1 !== e.test(t))
                  return (u.errors = [{ params: {} }]), !1;
              }
              y = r === c;
            } else y = !0;
            if (y) {
              if (void 0 !== s.library) {
                const e = c;
                m(s.library, {
                  instancePath: o + '/library',
                  parentData: s,
                  parentDataProperty: 'library',
                  rootData: l,
                }) ||
                  ((f = null === f ? m.errors : f.concat(m.errors)),
                  (c = f.length)),
                  (y = e === c);
              } else y = !0;
              if (y) {
                if (void 0 !== s.name) {
                  let e = s.name;
                  const t = c;
                  if (c === t) {
                    if ('string' != typeof e)
                      return (u.errors = [{ params: { type: 'string' } }]), !1;
                    if (e.length < 1) return (u.errors = [{ params: {} }]), !1;
                  }
                  y = t === c;
                } else y = !0;
                if (y) {
                  if (void 0 !== s.runtime) {
                    let e = s.runtime;
                    const t = c,
                      n = c;
                    let o = !1;
                    const a = c;
                    if (!1 !== e) {
                      const e = { params: { allowedValues: r.anyOf[0].enum } };
                      null === f ? (f = [e]) : f.push(e), c++;
                    }
                    var d = a === c;
                    if (((o = o || d), !o)) {
                      const t = c;
                      if (c === t)
                        if ('string' == typeof e) {
                          if (e.length < 1) {
                            const e = { params: {} };
                            null === f ? (f = [e]) : f.push(e), c++;
                          }
                        } else {
                          const e = { params: { type: 'string' } };
                          null === f ? (f = [e]) : f.push(e), c++;
                        }
                      (d = t === c), (o = o || d);
                    }
                    if (!o) {
                      const e = { params: {} };
                      return (
                        null === f ? (f = [e]) : f.push(e),
                        c++,
                        (u.errors = f),
                        !1
                      );
                    }
                    (c = n),
                      null !== f && (n ? (f.length = n) : (f = null)),
                      (y = t === c);
                  } else y = !0;
                  if (y) {
                    if (void 0 !== s.shareScope) {
                      let e = s.shareScope;
                      const t = c;
                      if (c === t) {
                        if ('string' != typeof e)
                          return (
                            (u.errors = [{ params: { type: 'string' } }]), !1
                          );
                        if (e.length < 1)
                          return (u.errors = [{ params: {} }]), !1;
                      }
                      y = t === c;
                    } else y = !0;
                    if (y) {
                      if (void 0 !== s.experiments) {
                        let e = s.experiments;
                        const r = c;
                        if (c === r) {
                          if (!e || 'object' != typeof e || Array.isArray(e))
                            return (
                              (u.errors = [{ params: { type: 'object' } }]), !1
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
                                  (u.errors = [
                                    { params: { additionalProperty: t } },
                                  ]),
                                  !1
                                );
                            if (r === c) {
                              if (void 0 !== e.federationRuntime) {
                                let r = e.federationRuntime;
                                const n = c,
                                  s = c;
                                let o = !1,
                                  a = null;
                                const i = c;
                                if (!1 !== r) {
                                  const e = {
                                    params: {
                                      allowedValues:
                                        t.properties.experiments.properties
                                          .federationRuntime.oneOf[0].enum,
                                    },
                                  };
                                  null === f ? (f = [e]) : f.push(e), c++;
                                }
                                i === c && ((o = !0), (a = 0));
                                const p = c;
                                if ('hoisted' !== r) {
                                  const e = {
                                    params: {
                                      allowedValues:
                                        t.properties.experiments.properties
                                          .federationRuntime.oneOf[1].enum,
                                    },
                                  };
                                  null === f ? (f = [e]) : f.push(e), c++;
                                }
                                var g;
                                if (
                                  ((g = p === c) && o
                                    ? ((o = !1), (a = [a, 1]))
                                    : g && ((o = !0), (a = 1)),
                                  !o)
                                ) {
                                  const e = { params: { passingSchemas: a } };
                                  return (
                                    null === f ? (f = [e]) : f.push(e),
                                    c++,
                                    (u.errors = f),
                                    !1
                                  );
                                }
                                (c = s),
                                  null !== f &&
                                    (s ? (f.length = s) : (f = null));
                                var h = n === c;
                              } else h = !0;
                              if (h) {
                                if (void 0 !== e.externalRuntime) {
                                  const t = c;
                                  if ('boolean' != typeof e.externalRuntime)
                                    return (
                                      (u.errors = [
                                        { params: { type: 'boolean' } },
                                      ]),
                                      !1
                                    );
                                  h = t === c;
                                } else h = !0;
                                if (h)
                                  if (void 0 !== e.provideExternalRuntime) {
                                    const t = c;
                                    if (
                                      'boolean' !=
                                      typeof e.provideExternalRuntime
                                    )
                                      return (
                                        (u.errors = [
                                          { params: { type: 'boolean' } },
                                        ]),
                                        !1
                                      );
                                    h = t === c;
                                  } else h = !0;
                              }
                            }
                          }
                        }
                        y = r === c;
                      } else y = !0;
                      if (y) {
                        if (void 0 !== s.dataPrefetch) {
                          const e = c;
                          if ('boolean' != typeof s.dataPrefetch)
                            return (
                              (u.errors = [{ params: { type: 'boolean' } }]), !1
                            );
                          y = e === c;
                        } else y = !0;
                        if (y)
                          if (void 0 !== s.runtimePlugins) {
                            let e = s.runtimePlugins;
                            const t = c;
                            if (c === t) {
                              if (!Array.isArray(e))
                                return (
                                  (u.errors = [{ params: { type: 'array' } }]),
                                  !1
                                );
                              {
                                const t = e.length;
                                for (let r = 0; r < t; r++) {
                                  const t = c;
                                  if ('string' != typeof e[r])
                                    return (
                                      (u.errors = [
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
