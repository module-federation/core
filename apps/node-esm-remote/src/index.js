// Standalone entry so the remote can also be executed directly for smoke
// testing: `node dist/main.mjs` (after a build).
import { greeting } from './greeting.js';

const message = await greeting('standalone');
console.log(message);
