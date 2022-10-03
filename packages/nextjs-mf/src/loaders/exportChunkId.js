
const exportChunkId = (content) => {
  [content,'export const chunkId = exports.id'].join('\n')
}

export default exportChunkId
