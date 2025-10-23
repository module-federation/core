// Main thread code that creates and communicates with the worker
// According to webpack docs, Node.js requires importing Worker from 'worker_threads'
// and only works with ESM: https://webpack.js.org/guides/web-workers/

export function createWorker() {
  return new Worker(new URL('./worker.js', import.meta.url));
}

export function testWorker() {
  return new Promise((resolve, reject) => {
    const worker = createWorker();

    worker.onmessage = function (e) {
      if (e.data.success) {
        resolve(e.data);
      } else {
        reject(new Error(`Worker failed: ${e.data.error}`));
      }
      worker.terminate();
    };

    worker.onerror = function (error) {
      reject(error);
      worker.terminate();
    };

    // Send message to trigger worker
    worker.postMessage({ test: true });
  });
}
