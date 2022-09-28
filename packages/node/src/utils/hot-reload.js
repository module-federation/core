const hashmap = {};
export const revalidate = (options) => {
  if (global.__remote_scope__) {
    const remoteScope = global.__remote_scope__;
    console.log('global.__remote_scope__',global.__remote_scope__);
    return new Promise(async (res) => {
      for (const property in remoteScope._config) {
        let remote = remoteScope._config[property];
        if (typeof remote === "function") {
          remote = await remote();
        }
        console.log("flush chunks: ", remote);
        const [name, url] = remote.split("@");
        (global.webpackChunkLoad || fetch)(url)
          .then((re) => re.text())
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
            res(true);
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

      if (global.hotLoad) {
        global.hotLoad();
      }
      global.loadedRemotes = {};
      Object.keys(req.cache).forEach((k) => {
        if (
          k.includes("remote") ||
          k.includes("runtime") ||
          k.includes("server") ||
          k.includes("flushChunks") ||
          k.includes("react-loadable-manifest")
        ) {
          delete req.cache[k];
        }
      });
    });
  }
  return true;
};
