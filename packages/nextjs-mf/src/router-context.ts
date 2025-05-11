/**
 * @module-federation/nextjs-mf/router-context
 *
 * A shared router context module for Next.js applications using Module Federation.
 * This creates a consistent shared module that can be consumed across all federated applications.
 */

import {
  RouterContext,
  // Import other exports as needed
} from 'next/dist/shared/lib/router-context.shared-runtime';

// Re-export the RouterContext
export {
  RouterContext,
  // Re-export other items as needed
};

// Default export for easier consumption
export default RouterContext;
