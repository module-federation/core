class DynamicFileSystem {
  constructor(strategy) {
    this.strategy = strategy;
  }

  async loadChunk(chunkId,rootOutputDir, remotes, callback) {
    return await this.strategy.loadChunk(chunkId,rootOutputDir, remotes, callback);
  }
}

export default DynamicFileSystem;
