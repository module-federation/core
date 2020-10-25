const shell = require("shelljs");
const path = require("path");
module.exports = class MergeRemoteChunksPlugin {
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    // Specify the event hook to attach to
    compiler.hooks.afterEmit.tap("MergeRemoteChunksPlugin", (output) => {
      const emittedAssets = Array.from(output.emittedAssets);
      const files = [
        "static/chunks/webpack",
        "static/runtime/remoteEntry",
      ]
        .filter((neededChunk) =>
          emittedAssets.some((emmitedAsset) =>
            emmitedAsset.includes(neededChunk),
          ),
        )
        .map((neededChunk) =>
          emittedAssets.find((emittedAsset) =>
            emittedAsset.includes(neededChunk),
          ),
        )
        .map((file) => path.resolve(__dirname, ".next", file));
      if (files.length > 0) {
        shell
          .cat(files)
          .to(
            path.resolve(
              ".next/static/runtime/remoteEntryMerged.js",
            ),
          );
      }
    });
  }
};
