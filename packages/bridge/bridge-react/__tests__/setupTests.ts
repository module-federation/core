// In vitest, you can use the setupFiles option in your configuration file to import any necessary setup files for your tests.
// For example, if you want to use testing-library's custom matchers, you can import them in a setup file like this:
import '@testing-library/jest-dom';

// Fix TextEncoder/TextDecoder not defined in Node.js
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
(global as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;
