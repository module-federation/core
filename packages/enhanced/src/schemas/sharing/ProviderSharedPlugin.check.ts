/* eslint-disable */
//@ts-nocheck
/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `yarn special-lint-fix` to update
 */

'use strict';

function r(
  e,
  {
    instancePath: t = '',
    parentData: s,
    parentDataProperty: n,
    rootData: o = e,
  } = {},
) {
  let a = null,
    l = 0;
  if (0 === l) {
    if (!e || 'object' != typeof e || Array.isArray(e))
      return (
        (r.errors = [
          {
            params: {
              type: 'object',
            },
          },
        ]),
        !1
      );
    for (const t in e) {
      let s = e[t];
      const n = l,
        o = l;
      let c = !1;
      const h = l;
      if (l == l)
        if (s && 'object' == typeof s && !Array.isArray(s)) {
          const r = l;
          for (const r in s)
            if (
              'eager' !== r &&
              'requiredVersion' !== r &&
              'shareKey' !== r &&
              'shareScope' !== r &&
              'singleton' !== r &&
              'strictVersion' !== r &&
              'version' !== r
            ) {
              const e = {
                params: {
                  additionalProperty: r,
                },
              };
              null === a ? (a = [e]) : a.push(e), l++;
              break;
            }
          if (r === l) {
            if (void 0 !== s.eager) {
              const r = l;
              if ('boolean' != typeof s.eager) {
                const r = {
                  params: {
                    type: 'boolean',
                  },
                };
                null === a ? (a = [r]) : a.push(r), l++;
              }
              var i = r === l;
            } else i = !0;
            if (i) {
              if (void 0 !== s.requiredVersion) {
                let r = s.requiredVersion;
                const e = l,
                  t = l;
                let n = !1;
                const o = l;
                if (!1 !== r) {
                  const r = {
                    params: {},
                  };
                  null === a ? (a = [r]) : a.push(r), l++;
                }
                var p = o === l;
                if (((n = n || p), !n)) {
                  const e = l;
                  if ('string' != typeof r) {
                    const r = {
                      params: {
                        type: 'string',
                      },
                    };
                    null === a ? (a = [r]) : a.push(r), l++;
                  }
                  (p = e === l), (n = n || p);
                }
                if (n) (l = t), null !== a && (t ? (a.length = t) : (a = null));
                else {
                  const r = {
                    params: {},
                  };
                  null === a ? (a = [r]) : a.push(r), l++;
                }
                i = e === l;
              } else i = !0;
              if (i) {
                if (void 0 !== s.shareKey) {
                  let r = s.shareKey;
                  const e = l;
                  if (l === e)
                    if ('string' == typeof r) {
                      if (r.length < 1) {
                        const r = {
                          params: {},
                        };
                        null === a ? (a = [r]) : a.push(r), l++;
                      }
                    } else {
                      const r = {
                        params: {
                          type: 'string',
                        },
                      };
                      null === a ? (a = [r]) : a.push(r), l++;
                    }
                  i = e === l;
                } else i = !0;
                if (i) {
                  if (void 0 !== s.shareScope) {
                    let r = s.shareScope;
                    const e = l;
                    if (l === e)
                      if ('string' == typeof r) {
                        if (r.length < 1) {
                          const r = {
                            params: {},
                          };
                          null === a ? (a = [r]) : a.push(r), l++;
                        }
                      } else {
                        const r = {
                          params: {
                            type: 'string',
                          },
                        };
                        null === a ? (a = [r]) : a.push(r), l++;
                      }
                    i = e === l;
                  } else i = !0;
                  if (i) {
                    if (void 0 !== s.singleton) {
                      const r = l;
                      if ('boolean' != typeof s.singleton) {
                        const r = {
                          params: {
                            type: 'boolean',
                          },
                        };
                        null === a ? (a = [r]) : a.push(r), l++;
                      }
                      i = r === l;
                    } else i = !0;
                    if (i) {
                      if (void 0 !== s.strictVersion) {
                        const r = l;
                        if ('boolean' != typeof s.strictVersion) {
                          const r = {
                            params: {
                              type: 'boolean',
                            },
                          };
                          null === a ? (a = [r]) : a.push(r), l++;
                        }
                        i = r === l;
                      } else i = !0;
                      if (i)
                        if (void 0 !== s.version) {
                          let r = s.version;
                          const e = l,
                            t = l;
                          let n = !1;
                          const o = l;
                          if (!1 !== r) {
                            const r = {
                              params: {},
                            };
                            null === a ? (a = [r]) : a.push(r), l++;
                          }
                          var f = o === l;
                          if (((n = n || f), !n)) {
                            const e = l;
                            if ('string' != typeof r) {
                              const r = {
                                params: {
                                  type: 'string',
                                },
                              };
                              null === a ? (a = [r]) : a.push(r), l++;
                            }
                            (f = e === l), (n = n || f);
                          }
                          if (n)
                            (l = t),
                              null !== a && (t ? (a.length = t) : (a = null));
                          else {
                            const r = {
                              params: {},
                            };
                            null === a ? (a = [r]) : a.push(r), l++;
                          }
                          i = e === l;
                        } else i = !0;
                    }
                  }
                }
              }
            }
          }
        } else {
          const r = {
            params: {
              type: 'object',
            },
          };
          null === a ? (a = [r]) : a.push(r), l++;
        }
      var u = h === l;
      if (((c = c || u), !c)) {
        const r = l;
        if (l == l)
          if ('string' == typeof s) {
            if (s.length < 1) {
              const r = {
                params: {},
              };
              null === a ? (a = [r]) : a.push(r), l++;
            }
          } else {
            const r = {
              params: {
                type: 'string',
              },
            };
            null === a ? (a = [r]) : a.push(r), l++;
          }
        (u = r === l), (c = c || u);
      }
      if (!c) {
        const e = {
          params: {},
        };
        return null === a ? (a = [e]) : a.push(e), l++, (r.errors = a), !1;
      }
      if (((l = o), null !== a && (o ? (a.length = o) : (a = null)), n !== l))
        break;
    }
  }
  return (r.errors = a), 0 === l;
}

function e(
  t,
  {
    instancePath: s = '',
    parentData: n,
    parentDataProperty: o,
    rootData: a = t,
  } = {},
) {
  let l = null,
    i = 0;
  const p = i;
  let f = !1;
  const u = i;
  if (i === u)
    if (Array.isArray(t)) {
      const e = t.length;
      for (let n = 0; n < e; n++) {
        let e = t[n];
        const o = i,
          p = i;
        let f = !1;
        const u = i;
        if (i == i)
          if ('string' == typeof e) {
            if (e.length < 1) {
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
        var c = u === i;
        if (((f = f || c), !f)) {
          const o = i;
          r(e, {
            instancePath: s + '/' + n,
            parentData: t,
            parentDataProperty: n,
            rootData: a,
          }) ||
            ((l = null === l ? r.errors : l.concat(r.errors)), (i = l.length)),
            (c = o === i),
            (f = f || c);
        }
        if (f) (i = p), null !== l && (p ? (l.length = p) : (l = null));
        else {
          const r = {
            params: {},
          };
          null === l ? (l = [r]) : l.push(r), i++;
        }
        if (o !== i) break;
      }
    } else {
      const r = {
        params: {
          type: 'array',
        },
      };
      null === l ? (l = [r]) : l.push(r), i++;
    }
  var h = u === i;
  if (((f = f || h), !f)) {
    const e = i;
    r(t, {
      instancePath: s,
      parentData: n,
      parentDataProperty: o,
      rootData: a,
    }) || ((l = null === l ? r.errors : l.concat(r.errors)), (i = l.length)),
      (h = e === i),
      (f = f || h);
  }
  if (!f) {
    const r = {
      params: {},
    };
    return null === l ? (l = [r]) : l.push(r), i++, (e.errors = l), !1;
  }
  return (
    (i = p),
    null !== l && (p ? (l.length = p) : (l = null)),
    (e.errors = l),
    0 === i
  );
}

function t(
  r,
  {
    instancePath: s = '',
    parentData: n,
    parentDataProperty: o,
    rootData: a = r,
  } = {},
) {
  let l = null,
    i = 0;
  if (0 === i) {
    if (!r || 'object' != typeof r || Array.isArray(r))
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
      if (void 0 === r.provides && (n = 'provides'))
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
        for (const e in r)
          if ('provides' !== e && 'shareScope' !== e)
            return (
              (t.errors = [
                {
                  params: {
                    additionalProperty: e,
                  },
                },
              ]),
              !1
            );
        if (n === i) {
          if (void 0 !== r.provides) {
            const t = i;
            e(r.provides, {
              instancePath: s + '/provides',
              parentData: r,
              parentDataProperty: 'provides',
              rootData: a,
            }) ||
              ((l = null === l ? e.errors : l.concat(e.errors)),
              (i = l.length));
            var p = t === i;
          } else p = !0;
          if (p)
            if (void 0 !== r.shareScope) {
              let e = r.shareScope;
              const s = i;
              if (i === s) {
                if ('string' != typeof e)
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
                if (e.length < 1)
                  return (
                    (t.errors = [
                      {
                        params: {},
                      },
                    ]),
                    !1
                  );
              }
              p = s === i;
            } else p = !0;
        }
      }
    }
  }
  return (t.errors = l), 0 === i;
}

export default t;
