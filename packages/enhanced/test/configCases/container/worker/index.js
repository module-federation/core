// Test that verifies webpack correctly handles worker syntax with Module Federation
//
// This test verifies:
// 1. Webpack can compile new Worker(new URL()) syntax
// 2. Module Federation works in worker file context
// 3. Remote modules are accessible from worker code
//
// Note: Actual Worker execution is not tested due to test environment limitations

// Reset React version to initial state before tests
// This prevents contamination from other tests that may have run before
beforeEach(() => {
  return import('react').then((React) => {
    React.setVersion('0.1.2');
  });
});

it('should compile worker with module federation support', () => {
  // Verify the worker file exists and can be imported
  return import('./worker.js').then((workerModule) => {
    // The worker module should exist even if we can't run it as a worker
    expect(workerModule).toBeDefined();
    expect(typeof workerModule.testWorkerFunctions).toBe('function');

    // Test that the worker can access federated modules
    const result = workerModule.testWorkerFunctions();
    expect(result.reactVersion).toBe('This is react 0.1.2');
    expect(result.componentOutput).toBe(
      'ComponentA rendered with [This is react 0.1.2]',
    );
  });
});

it('should load the component from container in main thread', () => {
  return import('./App').then(({ default: App }) => {
    const rendered = App();
    expect(rendered).toBe(
      'App rendered with [This is react 0.1.2] and [ComponentA rendered with [This is react 0.1.2]]',
    );
  });
});

it('should handle react upgrade in main thread', () => {
  return import('./upgrade-react').then(({ default: upgrade }) => {
    upgrade();
    return import('./App').then(({ default: App }) => {
      const rendered = App();
      expect(rendered).toBe(
        'App rendered with [This is react 1.2.3] and [ComponentA rendered with [This is react 1.2.3]]',
      );
    });
  });
});

// Test that worker app module compiles correctly
it('should compile WorkerApp module with Worker creation code', () => {
  return import('./WorkerApp').then(({ createWorker, testWorker }) => {
    // Verify the exports exist
    expect(typeof createWorker).toBe('function');
    expect(typeof testWorker).toBe('function');

    // We can't actually run these in Node.js environment
    // but their existence proves the module compiled correctly
  });
});
