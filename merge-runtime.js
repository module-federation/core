const path = require("path");
const fs = require("fs");
module.exports = class MergeRemoteChunksPlugin {
  constructor(options) {
    this._options = Object.assign(
      {},
      {
        filename: "remoteEntry",
      },
      options
    );
  }
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    if (!this._options) return null;
    const options = this._options;

    // Specify the event hook to attach to
    compiler.hooks.afterEmit.tap("MergeRemoteChunksPlugin", (output) => {
      const emittedAssets = Array.from(output.emittedAssets);
      const { dir, name } = path.parse(options.filename);
      const files = ["static/chunks/webpack", path.join(dir, name)]
        .filter((neededChunk) =>
          emittedAssets.some((emmitedAsset) =>
            emmitedAsset.includes(neededChunk)
          )
        )
        .map((neededChunk) =>
          emittedAssets.find((emittedAsset) =>
            emittedAsset.includes(neededChunk)
          )
        )
        .map((file) => path.join(compiler.options.output.path, file));

      if (files.length > 1) {
        const runtime = fs.readFileSync(files[0], "utf-8");
        const remoteContainer = fs.readFileSync(files[1], "utf-8");
        const merged = [runtime, remoteContainer].join("\n");
        const remotePath = path.join(compiler.options.output.path, "static");
        if (fs.existsSync(remotePath)) {
          fs.mkdir(remotePath, { recursive: true }, (err) => {
            if (err) throw err;
          });
        }
        fs.writeFile(
          path.join(
            remotePath,
            "/remoteEntryMerged.js"
          ),
          merged,
          () => {}
        );
      }
    });
  }
};
