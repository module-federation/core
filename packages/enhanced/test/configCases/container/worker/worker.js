// Worker that uses Module Federation to import components
import React from 'react';
import ComponentA from 'containerA/ComponentA';

// Check if we're in a worker context
if (typeof self !== 'undefined' && typeof self.onmessage !== 'undefined') {
  self.onmessage = async function (e) {
    try {
      // Test that React and ComponentA are available in worker context
      const reactVersion = React();
      const componentOutput = ComponentA();

      self.postMessage({
        success: true,
        reactVersion: reactVersion,
        componentOutput: componentOutput,
        message: `Worker successfully loaded: React=${reactVersion}, Component=${componentOutput}`,
      });
    } catch (error) {
      self.postMessage({
        success: false,
        error: error.message,
        stack: error.stack,
      });
    }
  };
}

// Export for testing purposes when not in worker context
export function testWorkerFunctions() {
  const reactVersion = React();
  const componentOutput = ComponentA();
  return {
    reactVersion,
    componentOutput,
  };
}
