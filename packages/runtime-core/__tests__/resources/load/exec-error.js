// Simulates an IIFE that throws during execution.
// In a real browser, such a throw fires window.onerror and then script.onload still fires.
// Here we dispatch the ErrorEvent manually (same mechanism our dom.ts listener uses).
window.dispatchEvent(
  new ErrorEvent('error', {
    message: 'TypeError: exec failed',
    filename: 'http://localhost:1111/resources/load/exec-error.js',
    lineno: 1,
    colno: 1,
    bubbles: true,
  }),
);
