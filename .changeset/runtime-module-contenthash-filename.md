---
'@module-federation/enhanced': patch
---

Fix federation runtime generation failing when the chunk filename template
contains hash placeholders such as `[contenthash]` or `[chunkhash]`. The runtime
module needs the chunk's output directory depth, but those hashes aren't settled
when it is generated, so resolving the filename threw. It now uses webpack's
`runtimeTemplate.chunkRootOutputDir` when available, and falls back to resolving
the filename with a placeholder content hash on older webpack versions.
