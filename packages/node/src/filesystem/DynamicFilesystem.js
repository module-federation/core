class DynamicFileSystem {
  constructor(strategy) {
    this.strategy = strategy;
  }

  async loadChunk(chunkId, chunkName, remotes, logger, callback) {
    return await this.strategy.loadChunk(chunkId, chunkName, remotes, logger, callback);
  }
}

export default DynamicFileSystem;
