/**
 * Federation exports for lynx-remote
 * This file makes components available globally after the bundle is loaded
 * Similar to how Re.Pack handles component registration
 */
import { SimpleMFDemo } from './components/SimpleMFDemo';

// Register components in global namespace for Module Federation access
declare const globalThis: any;

// Create a registry object
if (!globalThis.lynx_remote_registry) {
  globalThis.lynx_remote_registry = {};
}

// Register our components
globalThis.lynx_remote_registry.SimpleMFDemo = SimpleMFDemo;

// Also export for ES module access
export { SimpleMFDemo };
export default { SimpleMFDemo };
