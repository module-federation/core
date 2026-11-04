// Build-time prototype: producer declares kind once; the manifest carries it.
export function createReactExpose(source: string, type: 'app' | 'component') {
  return { source, type };
}
export const exposes = {
  App: createReactExpose('./src/exposes/App.tsx', 'app'),
  Plain: createReactExpose('./src/exposes/Plain.tsx', 'component'),
  Data: createReactExpose('./src/exposes/Data.tsx', 'component'),
  DataByLoader: createReactExpose(
    './src/exposes/DataByLoader.tsx',
    'component',
  ),
  DataCSR: createReactExpose('./src/exposes/DataCSR.tsx', 'component'),
};
export const reactExposes = Object.fromEntries(
  Object.entries(exposes).map(([name, { type }]) => [
    name,
    { default: { type } },
  ]),
);
