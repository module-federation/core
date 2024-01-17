/* eslint-disable */
//@ts-nocheck
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn special-lint-fix` to update
 */
'use strict';

function r(
  t,
  {
    instancePath: e = '',
    parentData: a,
    parentDataProperty: n,
    rootData: s = t,
  } = {},
) {
  if (!Array.isArray(t))
    return (
      (r.errors = [
        {
          params: {
            type: 'array',
          },
        },
      ]),
      !1
    );
  {
    const e = t.length;
    for (let a = 0; a < e; a++) {
      let e = t[a];
      const n = 0;
      if ('string' != typeof e)
        return (
          (r.errors = [
            {
              params: {
                type: 'string',
              },
            },
          ]),
          !1
        );
      if (e.length < 1)
        return (
          (r.errors = [
            {
              params: {},
            },
          ]),
          !1
        );
      if (0 !== n) break;
    }
  }
  return (r.errors = null), !0;
}

function t(
  e,
  {
    instancePath: a = '',
    parentData: n,
    parentDataProperty: s,
    rootData: o = e,
  } = {},
) {
  let l = null,
    i = 0;
  if (0 === i) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (
        (t.errors = [
          {
            params: {
              type: 'object',
            },
          },
        ]),
        !1
      );
    {
      let n;
      if (void 0 === e.external && (n = 'external'))
        return (
          (t.errors = [
            {
              params: {
                missingProperty: n,
              },
            },
          ]),
          !1
        );
      {
        const n = i;
        for (const r in e)
          if ('external' !== r && 'name' !== r && 'shareScope' !== r)
            return (
              (t.errors = [
                {
                  params: {
                    additionalProperty: r,
                  },
                },
              ]),
              !1
            );
        if (n === i) {
          if (void 0 !== e.external) {
            let n = e.external;
            const s = i,
              u = i;
            let f = !1;
            const m = i;
            if (i == i)
              if ('string' == typeof n) {
                if (n.length < 1) {
                  const r = {
                    params: {},
                  };
                  null === l ? (l = [r]) : l.push(r), i++;
                }
              } else {
                const r = {
                  params: {
                    type: 'string',
                  },
                };
                null === l ? (l = [r]) : l.push(r), i++;
              }
            var p = m === i;
            if (((f = f || p), !f)) {
              const t = i;
              r(n, {
                instancePath: a + '/external',
                parentData: e,
                parentDataProperty: 'external',
                rootData: o,
              }) ||
                ((l = null === l ? r.errors : l.concat(r.errors)),
                (i = l.length)),
                (p = t === i),
                (f = f || p);
            }
            if (!f) {
              const r = {
                params: {},
              };
              return (
                null === l ? (l = [r]) : l.push(r), i++, (t.errors = l), !1
              );
            }
            (i = u), null !== l && (u ? (l.length = u) : (l = null));
            var c = s === i;
          } else c = !0;
          if (c) {
            if (void 0 !== e.name) {
              let r = e.name;
              const a = i;
              if (i === a) {
                if ('string' != typeof r)
                  return (
                    (t.errors = [
                      {
                        params: {
                          type: 'string',
                        },
                      },
                    ]),
                    !1
                  );
                if (r.length < 1)
                  return (
                    (t.errors = [
                      {
                        params: {},
                      },
                    ]),
                    !1
                  );
              }
              c = a === i;
            } else c = !0;
            if (c)
              if (void 0 !== e.shareScope) {
                let r = e.shareScope;
                const a = i;
                if (i === a) {
                  if ('string' != typeof r)
                    return (
                      (t.errors = [
                        {
                          params: {
                            type: 'string',
                          },
                        },
                      ]),
                      !1
                    );
                  if (r.length < 1)
                    return (
                      (t.errors = [
                        {
                          params: {},
                        },
                      ]),
                      !1
                    );
                }
                c = a === i;
              } else c = !0;
          }
        }
      }
    }
  }
  return (t.errors = l), 0 === i;
}

function e(
  a,
  {
    instancePath: n = '',
    parentData: s,
    parentDataProperty: o,
    rootData: l = a,
  } = {},
) {
  let i = null,
    p = 0;
  if (0 === p) {
    if (!a || 'object' != typeof a || Array.isArray(a))
      return (
        (e.errors = [
          {
            params: {
              type: 'object',
            },
          },
        ]),
        !1
      );
    for (const s in a) {
      let o = a[s];
      const u = p,
        f = p;
      let m = !1;
      const y = p;
      t(o, {
        instancePath: n + '/' + s.replace(/~/g, '~0').replace(/\//g, '~1'),
        parentData: a,
        parentDataProperty: s,
        rootData: l,
      }) || ((i = null === i ? t.errors : i.concat(t.errors)), (p = i.length));
      var c = y === p;
      if (((m = m || c), !m)) {
        const t = p;
        if (p == p)
          if ('string' == typeof o) {
            if (o.length < 1) {
              const r = {
                params: {},
              };
              null === i ? (i = [r]) : i.push(r), p++;
            }
          } else {
            const r = {
              params: {
                type: 'string',
              },
            };
            null === i ? (i = [r]) : i.push(r), p++;
          }
        if (((c = t === p), (m = m || c), !m)) {
          const t = p;
          r(o, {
            instancePath: n + '/' + s.replace(/~/g, '~0').replace(/\//g, '~1'),
            parentData: a,
            parentDataProperty: s,
            rootData: l,
          }) ||
            ((i = null === i ? r.errors : i.concat(r.errors)), (p = i.length)),
            (c = t === p),
            (m = m || c);
        }
      }
      if (!m) {
        const r = {
          params: {},
        };
        return null === i ? (i = [r]) : i.push(r), p++, (e.errors = i), !1;
      }
      if (((p = f), null !== i && (f ? (i.length = f) : (i = null)), u !== p))
        break;
    }
  }
  return (e.errors = i), 0 === p;
}

function a(
  r,
  {
    instancePath: t = '',
    parentData: n,
    parentDataProperty: s,
    rootData: o = r,
  } = {},
) {
  let l = null,
    i = 0;
  const p = i;
  let c = !1;
  const u = i;
  if (i === u)
    if (Array.isArray(r)) {
      const a = r.length;
      for (let n = 0; n < a; n++) {
        let a = r[n];
        const s = i,
          p = i;
        let c = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof a) {
            if (a.length < 1) {
              const r = {
                params: {},
              };
              null === l ? (l = [r]) : l.push(r), i++;
            }
          } else {
            const r = {
              params: {
                type: 'string',
              },
            };
            null === l ? (l = [r]) : l.push(r), i++;
          }
        var f = u === i;
        if (((c = c || f), !c)) {
          const s = i;
          e(a, {
            instancePath: t + '/' + n,
            parentData: r,
            parentDataProperty: n,
            rootData: o,
          }) ||
            ((l = null === l ? e.errors : l.concat(e.errors)), (i = l.length)),
            (f = s === i),
            (c = c || f);
        }
        if (c) (i = p), null !== l && (p ? (l.length = p) : (l = null));
        else {
          const r = {
            params: {},
          };
          null === l ? (l = [r]) : l.push(r), i++;
        }
        if (s !== i) break;
      }
    } else {
      const r = {
        params: {
          type: 'array',
        },
      };
      null === l ? (l = [r]) : l.push(r), i++;
    }
  var m = u === i;
  if (((c = c || m), !c)) {
    const a = i;
    e(r, {
      instancePath: t,
      parentData: n,
      parentDataProperty: s,
      rootData: o,
    }) || ((l = null === l ? e.errors : l.concat(e.errors)), (i = l.length)),
      (m = a === i),
      (c = c || m);
  }
  if (!c) {
    const r = {
      params: {},
    };
    return null === l ? (l = [r]) : l.push(r), i++, (a.errors = l), !1;
  }
  return (
    (i = p),
    null !== l && (p ? (l.length = p) : (l = null)),
    (a.errors = l),
    0 === i
  );
}

function n(
  r,
  {
    instancePath: t = '',
    parentData: e,
    parentDataProperty: s,
    rootData: o = r,
  } = {},
) {
  let l = null,
    i = 0;
  if (0 === i) {
    if (!r || 'object' != typeof r || Array.isArray(r))
      return (
        (n.errors = [
          {
            params: {
              type: 'object',
            },
          },
        ]),
        !1
      );
    {
      let e;
      if (
        (void 0 === r.remoteType && (e = 'remoteType')) ||
        (void 0 === r.remotes && (e = 'remotes'))
      )
        return (
          (n.errors = [
            {
              params: {
                missingProperty: e,
              },
            },
          ]),
          !1
        );
      {
        const e = i;
        for (const t in r)
          if ('remoteType' !== t && 'remotes' !== t && 'shareScope' !== t)
            return (
              (n.errors = [
                {
                  params: {
                    additionalProperty: t,
                  },
                },
              ]),
              !1
            );
        if (e === i) {
          if (void 0 !== r.remoteType) {
            let t = r.remoteType;
            const e = i,
              a = i;
            let s = !1,
              o = null;
            const c = i;
            if (
              'var' !== t &&
              'module' !== t &&
              'assign' !== t &&
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
              'system' !== t &&
              'promise' !== t &&
              'import' !== t &&
              'script' !== t &&
              'node-commonjs' !== t
            ) {
              const r = {
                params: {},
              };
              null === l ? (l = [r]) : l.push(r), i++;
            }
            if ((c === i && ((s = !0), (o = 0)), !s)) {
              const r = {
                params: {
                  passingSchemas: o,
                },
              };
              return (
                null === l ? (l = [r]) : l.push(r), i++, (n.errors = l), !1
              );
            }
            (i = a), null !== l && (a ? (l.length = a) : (l = null));
            var p = e === i;
          } else p = !0;
          if (p) {
            if (void 0 !== r.remotes) {
              const e = i;
              a(r.remotes, {
                instancePath: t + '/remotes',
                parentData: r,
                parentDataProperty: 'remotes',
                rootData: o,
              }) ||
                ((l = null === l ? a.errors : l.concat(a.errors)),
                (i = l.length)),
                (p = e === i);
            } else p = !0;
            if (p)
              if (void 0 !== r.shareScope) {
                let t = r.shareScope;
                const e = i;
                if (i === e) {
                  if ('string' != typeof t)
                    return (
                      (n.errors = [
                        {
                          params: {
                            type: 'string',
                          },
                        },
                      ]),
                      !1
                    );
                  if (t.length < 1)
                    return (
                      (n.errors = [
                        {
                          params: {},
                        },
                      ]),
                      !1
                    );
                }
                p = e === i;
              } else p = !0;
          }
        }
      }
    }
  }
  return (n.errors = l), 0 === i;
}
export default n;
