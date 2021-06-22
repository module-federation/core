const shareNextInternals = `if (process.browser) {
  Object.assign(__webpack_share_scopes__.default, {
    "next/link": {
      [next.version]: {
        loaded: true,
        get: () => Promise.resolve(() => require("next/link")),
      },
    },
    "next/head": {
      [next.version]: {
        loaded: true,
        get: () => Promise.resolve(() => require("next/head")),
      },
    },
    "next/dynamic": {
      [next.version]: {
        loaded: true,
        get: () => Promise.resolve(() => require("next/dynamic")),
      },
    },
  });
}
`

module.exports = function (source) {
  return shareNextInternals + source
};
