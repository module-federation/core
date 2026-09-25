import { createFederation } from '/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/compose.js';
import { remotes } from '/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/adapters/remotes.js';
import { consumes } from '/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/adapters/consumes.js';
import { shareScope } from '/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/adapters/share-scope.js';
import { container } from '/fast/worktrees/rfc-probe-main/packages/webpack-bundler-runtime/dist/adapters/container.js';
import { shared } from '/fast/worktrees/rfc-probe-main/packages/runtime-core/dist/shared/capability.js';
import { remote } from '/fast/worktrees/rfc-probe-main/packages/runtime-core/dist/remote/capability.js';
import { snapshot } from '/fast/worktrees/rfc-probe-main/packages/runtime-core/dist/plugins/snapshot/capability.js';
import { web } from '/fast/worktrees/rfc-probe-main/packages/runtime-core/dist/platform/web.js';
export default createFederation({
  capabilities: {
    shared: shared,
    remote: remote,
    snapshot: snapshot,
    platform: web,
  },
  adapters: [remotes, consumes, shareScope, container],
});
