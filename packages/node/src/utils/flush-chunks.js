export const usedChunks = global.usedChunks || new Set();
global.usedChunks = usedChunks;

export const flushChunks = async () => {
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
        );
        const stats = await fetch(statsFile).then(
          async (res) => await res.json()
        );
        chunks.add(
          global.__remote_scope__._config[remote].replace('ssr', 'chunks')
        );
        const [prefix] =
          global.__remote_scope__._config[remote].split('static/');
        if (stats.federatedModules) {
          stats.federatedModules.forEach((modules) => {
            if (modules.exposes?.[request]) {
              modules.exposes[request].forEach((chunk) => {
                Object.values(chunk).forEach((chunk) => {
                  chunk.forEach((chunk) => {
                    chunks.add(prefix + chunk);
                  });
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
        console.log(e);
      }
    })
  );

  const dedupe = Array.from(new Set([...allFlushed.flat()]));

  // usedChunks.clear();
  return dedupe.filter(Boolean);
};
