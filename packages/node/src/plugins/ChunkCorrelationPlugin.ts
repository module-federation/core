// Preserve existing CommonJS implementation while exposing a TS default export
// that tsdown can analyze for dual-format output.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ChunkCorrelationPlugin = require('./ChunkCorrelationPlugin');

export default ChunkCorrelationPlugin;
