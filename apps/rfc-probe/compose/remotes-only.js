import { createFederation } from '/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/compose.js';
import { remotes } from '/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/adapters/remotes.js';
import { shareScope } from '/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/adapters/share-scope.js';
import { remote } from '/fast/worktrees/rfc-probe-main/packages/runtime-core/dist/remote/capability.js';
import { web } from '/fast/worktrees/rfc-probe-main/packages/runtime-core/dist/platform/web.js';
export default createFederation({
  capabilities: { remote: remote, platform: web },
  adapters: [remotes, shareScope],
});
