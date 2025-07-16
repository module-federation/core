// Polyfills for Node.js environment
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Additional polyfills for jsdom environment
Object.defineProperty(window, 'TextEncoder', {
  writable: true,
  value: TextEncoder,
});

Object.defineProperty(window, 'TextDecoder', {
  writable: true,
  value: TextDecoder,
});
