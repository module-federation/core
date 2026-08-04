// Exposed module. The dynamic import() below forces webpack to emit a
// separate async ESM chunk, so consuming this module over HTTP exercises
// native `import()` chunk loading through the Node loader hooks.
export async function greeting(consumer) {
  const { deepThought } = await import('./deep-thought.js');
  const answer = await deepThought();
  return `[node-esm-remote] Hello ${consumer}! The answer is ${answer} (computed in an async ESM chunk).`;
}
