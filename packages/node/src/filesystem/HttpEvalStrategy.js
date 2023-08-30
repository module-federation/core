class HttpEvalStrategy {
  constructor(logger) {
    this.logger = logger;
  }

  async loadChunk(chunkId,rootOutputDir, remotes, callback) {
    // Build the URL to fetch the chunk
    const chunkUrl = new URL(remoteUrl);
    chunkUrl.pathname += `/${chunkId}.js`;

    // Log the chunk loading attempt
    this.logger(`'Will load remote chunk from'`, chunkUrl.toString());

    try {
      const response = await fetch(chunkUrl.toString());
      if (response.ok) {
        const content = await response.text();
        const chunk = {};

        try {
          eval(`(function(exports, require, self) {${content}\n})`)(chunk, require, self);
          callback(null, chunk);
        } catch (e) {
          this.logger(`'Eval threw'`, e);
          callback(e, null);
        }
      } else {
        const err = new Error(`Failed to load chunk from ${chunkUrl}. Status: ${response.status}`);
        callback(err, null);
      }
    } catch (e) {
      const err = new Error(`Error fetching chunk from ${chunkUrl}`);
      callback(err, null);
    }
  }
}
