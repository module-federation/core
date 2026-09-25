import { createFederation } from '/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/compose.js';
import { container } from '/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/adapters/container.js';
import { shareScope } from '/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/adapters/share-scope.js';
export default createFederation({
  capabilities: {},
  adapters: [container, shareScope],
});
