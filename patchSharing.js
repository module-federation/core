const path = require("path");
const fs = require("fs");
const patchSharing = () => {
  const React = require("react");
  global.React = React;
  const isWebpack = typeof __non_webpack_require__ !== undefined
  const reactPath = path.dirname(isWebpack ? __non_webpack_require__.resolve("react") : require.resolve('react'));
  const umdReact =
    process.env.NODE_ENV === "production"
      ? path.join(reactPath, "umd/react.production.min.js")
      : path.join(reactPath, "umd/react.development.js");
  const stringReact = fs.readFileSync(umdReact, "utf-8");
  return React.createElement("script", {
    dangerouslySetInnerHTML: {
      __html: stringReact,
    },
  });
};
module.exports = patchSharing;
