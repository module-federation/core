const { fileURLToPath } = __non_webpack_require__('url');
const { basename } = __non_webpack_require__('path');

it('should initialize the federation runtime in a worker chunk', async () => {
  const worker = new Worker(new URL('./worker.js', import.meta.url));
  __non_webpack_require__(`./${basename(fileURLToPath(worker.url))}`);
  expect(await globalThis.workerRemote).toBe('remote ./x');
});

it('should keep a hoisted module in a chunk whose runtime did not receive it', async () => {
  __non_webpack_require__('./other.js');
  expect(await globalThis.otherHelper).toBe('remote');
});
