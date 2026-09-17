// Demo-only approximation of a future Modern integration; not a published API.
const {
  createSSRUpdateAdapter,
} = require('@module-federation/modern-js-v3/server');

function createFederationServer(options) {
  let adapter = createSSRUpdateAdapter(options);
  let application;
  let closed = false;
  function ready() {
    if (closed) throw Error('Federation server has been closed');
    if (!application) throw Error('Modern SSR application is not ready');
    return application;
  }
  return {
    // Functions close over this integration, not a process-wide default app.
    updateRemotes(remotes, input) {
      return adapter.updateRemotes(ready(), remotes, input);
    },
    get status() {
      return ready().status;
    },
    plan(name) {
      ready();
      return adapter.plan(name);
    },
    configureApplication(config) {
      for (const key of ['onReady', 'reloadEntry', 'dispose', 'validate']) {
        if (key in config)
          throw Error('Federation integration owns hook: ' + key);
      }
      return {
        ...config,
        onReady(value) {
          if (closed) throw Error('Federation server has been closed');
          if (application && application !== value)
            throw Error(
              'Create a separate federation server for each application',
            );
          application = value;
        },
        reloadEntry: (entry) => adapter.reload(entry),
        dispose: (_, entries) => adapter.dispose(entries),
        validate: (resources) => adapter.prepareResources(resources),
      };
    },
    // Demo reset runs inside Modern's update queue, while requests are drained.
    reset(resetState) {
      return ready().update(async () => {
        await adapter.dispose(undefined, { preserveRemotes: false });
        await resetState();
        adapter = createSSRUpdateAdapter(options);
      });
    },
    async close() {
      if (closed) return;
      closed = true;
      application = undefined;
      await adapter.dispose();
    },
  };
}
module.exports = { createFederationServer };
