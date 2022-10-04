const hashmap = {};
import crypto from "crypto";

export const revalidate = (options) => {
  if (global.__remote_scope__) {
    const remoteScope = global.__remote_scope__;

    return new Promise(async (res) => {
      for (const property in remoteScope._config) {
        let remote = remoteScope._config[property];
        if (typeof remote === "function") {
          remote = await remote();
        }

        const name = property;
        const url = remote;
        (global.webpackChunkLoad || global.fetch || require('node-fetch'))(url)
          .then((re) => {
            if(!re.ok) {
              throw new Error(`Error loading remote: status: ${re.status}, content-type: ${re.headers.get("content-type")}`);
            }
            return re.text()
          })
          .then((contents) => {
            var hash = crypto.createHash("md5").update(contents).digest("hex");
            if (hashmap[name]) {
              if (hashmap[name] !== hash) {
                hashmap[name] = hash;
                console.log(name, "hash is different - must hot reload server");
                res(true);
              }
            } else {
              hashmap[name] = hash;
              res(false);
            }
          })
          .catch((e) => {
            console.error(
              "Remote",
              name,
              url,
              "Failed to load or is not online",
              e
            );
            res(false);
          });
      }
    }).then((shouldReload) => {
      if (!shouldReload) {
        return false;
      }
      let req;
      if (typeof __non_webpack_require__ === "undefined") {
        req = require;
      } else {
        req = __non_webpack_require__;
      }

      global.__remote_scope__ = {
        _config: {},
      };
      Object.keys(req.cache).forEach((k) => {
        if (
          k.includes("remote") ||
          k.includes("runtime") ||
          k.includes("server") ||
          k.includes("hot-reload") ||
          k.includes("react-loadable-manifest")
        ) {
          delete req.cache[k];
        }
      });

      return true
    });
  }
  return Promise.resolve(false);
};
