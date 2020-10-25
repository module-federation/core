const path = require("path");
const fs = require("fs");
module.exports = class MergeRemoteChunksPlugin {
  // Define `apply` as its prototype method which is supplied with compiler as its argument
  apply(compiler) {
    // Specify the event hook to attach to
    compiler.hooks.afterEmit.tap("MergeRemoteChunksPlugin", (output) => {
      const emittedAssets = Array.from(output.emittedAssets);
      const files = ["static/chunks/webpack", "static/runtime/remoteEntry"]
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
        .map((file) => path.join(output.compiler.context, ".next", file));

      if (files.length > 1) {
        const runtime = fs.readFileSync(files[0], "utf-8");
        const remoteContainer = fs.readFileSync(files[1], "utf-8");
        const merged = [runtime, remoteContainer].join("\n");
        const remotePath = path.join(output.compiler.context, ".next/static");
        if (fs.existsSync(remotePath)) {
          fs.mkdir(remotePath, { recursive: true }, (err) => {
            if (err) throw err;
          });
        }
        fs.writeFile(
          path.resolve(
            output.compiler.context,
            ".next/static/remoteEntryMerged.js"
          ),
          merged,
          () => {}
        );
      }
    });
  }
};
