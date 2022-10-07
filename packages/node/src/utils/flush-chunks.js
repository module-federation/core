export const usedChunks = new Set()
global.usedChunks = usedChunks

export const flushChunks = async () => {
  const allFlushed = await Promise.all(Array.from(usedChunks).map(async (chunk) => {
    const chunks = new Set();
    const [remote, request] = chunk.split('->');
    if(!global.__remote_scope__._config[remote]) {
      return
    }
    const statsFile = global.__remote_scope__._config[remote].replace('remoteEntry.js', 'federated-stats.json')
    // fetch the json file
    const stats = await fetch(statsFile).then(async (res) => {
      return await res.json()
    })

    chunks.add(global.__remote_scope__._config[remote].replace('ssr', 'chunks'))
    const [prefix] = global.__remote_scope__._config[remote].split('static/')
    if (stats.federatedModules) {
      stats.federatedModules.forEach((modules) => {
        if (modules.exposes && modules.exposes[request]) {
          modules.exposes[request].forEach((chunk) => {
            Object.values(chunk).forEach((chunk) => {
              chunk.forEach((chunk) => {
                chunks.add(prefix + chunk)
              })
            })
          })
        }
      })
    }
    return Array.from(chunks)
  }))

  const dedupe = Array.from(new Set([...allFlushed.flat()]))

  usedChunks.clear()
  return dedupe.filter(Boolean)
}
