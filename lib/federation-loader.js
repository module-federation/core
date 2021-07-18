const shareNextInternals = `if (process.browser) {
  try {
  __webpack_init_sharing__('default');
  } catch (e) {}

   Object.assign(__webpack_share_scopes__.default, {
   "react": {
      [require('react/package.json').version]: {
        loaded: true,
        get: () => Promise.resolve(() => require("react")),
      },
    },
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
