const path = require("path");
const fs = require("fs");
const __require__ =
  typeof __non_webpack_require__ !== "undefined"
    ? __non_webpack_require__
    : require;
const patchSharing = () => {
  const React = require("react");
  const reactPath = path.dirname(__require__.resolve("react"));
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
