export const usedChunks = global.usedChunks || new Set();
global.usedChunks = usedChunks;
export const flushChunks = async () => {
  let hostStats = {};
  try {
     hostStats = __non_webpack_require__('../host-stats.json');
  } catch (e) {

  }

  let shareMap = {};
  if(__webpack_share_scopes__?.default) {
     shareMap = Object.keys(__webpack_share_scopes__.default).reduce((acc, key) => {
      const loadedModules = Object.values(__webpack_share_scopes__.default[key]).filter((sharedModule) => {
        return sharedModule.loaded
      }).map((sharedModule) => {
        return sharedModule.from;
      })
      if (loadedModules.length > 0) {
        acc[key] = loadedModules;
      }
      return acc
    }, {});
  }
  const allFlushed = await Promise.all(
    Array.from(usedChunks).map(async (chunk) => {
      const chunks = new Set();
      const [remote, request] = chunk.split('->');
      if (!global.__remote_scope__._config[remote]) {
        return;
      }
      // fetch the json file
      try {
        const remoteName = new URL(global.__remote_scope__._config[remote]).pathname.split('/').pop();
        const statsFile = global.__remote_scope__._config[remote].replace(
          remoteName,
          'federated-stats.json'
        ).replace('ssr','chunks');

        let stats = {}
        try {
          await fetch(global.__remote_scope__._config[remote])
           stats = await fetch(statsFile).then((res)=>res.json());
        } catch (e) {
console.error("flush errer",e);
        }

        chunks.add(
          global.__remote_scope__._config[remote].replace('ssr', 'chunks')
        );
        const [prefix] =
          global.__remote_scope__._config[remote].split('static/');
        if (stats.federatedModules) {
          // console.log(shareMap)
          stats.federatedModules.forEach((modules) => {
            if (modules.exposes?.[request]) {
              console.log('modules.exposes[request]', request, modules.exposes[request])
              modules.exposes[request].forEach((chunk) => {
                Object.values(chunk).forEach((chunk) => {
                  if(chunk.files) chunk.files.forEach((file) => {
                    chunks.add(prefix + file)
                  });
                  if(chunk.requiredModules) {
                    console.log('chunk.requiredModules',request, chunk.requiredModules)
                    chunk.requiredModules.forEach((module) => {
                      console.log('shareMap[module]', module, shareMap[module])

                      if (shareMap[module]) {

                        if(shareMap[module][0].startsWith('host__')) {
                          console.log('host',hostStats)
                        }
                        console.log('shareMap[module]', module, shareMap[module])
                        // shareMap[module].forEach((file) => {
                        //   chunks.add(prefix + file)
                        // })
                      }
                    })
                  }
                });
              });
            }

            // todo: come back to this later
            // if(modules.sharedModules?.[0]) {
            //   const sharedModules = modules.sharedModules.find((sharedModule) => {
            //     return sharedModule.provides.find((provide) => {return provide.shareKey === request})
            //   });
            //   sharedModules.chunks.forEach((chunk) => {
            //     chunks.add(prefix + chunk);
            //   });
            // }
          });
        }

        return Array.from(chunks);
      } catch (e) {
        // console.log(e);
      }
    })
  );

  const dedupe = Array.from(new Set([...allFlushed.flat()]));

  // usedChunks.clear();
  return dedupe.filter(Boolean);
};
