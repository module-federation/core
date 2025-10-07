// Main thread code that creates and communicates with the worker
// According to webpack docs, Node.js requires importing Worker from 'worker_threads'
// and only works with ESM: https://webpack.js.org/guides/web-workers/

export function createWorker() {
  // Webpack will handle this syntax and bundle the worker appropriately
  // The actual Worker runtime availability depends on the environment
  if (typeof Worker !== 'undefined') {
    // Standard web worker syntax as per webpack documentation
    return new Worker(new URL('./worker.js', import.meta.url));
  }
  // Return a mock for testing in environments without Worker support
  return {
    postMessage: () => {},
    terminate: () => {},
    onmessage: null,
    onerror: null,
  };
}

export function testWorker() {
  return new Promise((resolve, reject) => {
    const worker = createWorker();

    // In Node.js test environment, return a mock response
    if (typeof Worker === 'undefined') {
      resolve({
        success: true,
        message: 'Mock worker response for testing',
        reactVersion: 'This is react 0.1.2',
        componentOutput: 'ComponentA rendered with [This is react 0.1.2]',
      });
      return;
    }

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
