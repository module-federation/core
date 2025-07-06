// Suppress React 19 unmounting warnings during tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    args[0]?.includes?.(
      'Attempted to synchronously unmount a root while React was already rendering',
    ) ||
    args[0]?.includes?.('race condition')
  ) {
    return;
  }
  originalConsoleError(...args);
};
