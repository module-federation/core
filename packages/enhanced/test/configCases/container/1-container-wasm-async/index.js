import('./wasm-module.wasm').then((wasmModule) => {
  console.log('WebAssembly module loaded:', wasmModule);
  document.getElementById('result').innerHTML =
    `WebAssembly loaded: ${typeof wasmModule.exports}`;
});

export default function App() {
  return <div id="result">Loading WebAssembly...</div>;
}
