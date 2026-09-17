const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');
const fs = require('node:fs');

function fixture() {
  const adapters = [];
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('./index.cjs'), 'utf8'), {
    module,
    require() {
      return {
        createSSRUpdateAdapter() {
          const adapter = {
            calls: [],
            updateRemotes(app, remotes) {
              this.calls.push(app);
              return remotes;
            },
            reload() {
              return adapter;
            },
            dispose() {},
            prepareResources() {},
          };
          adapters.push(adapter);
          return adapter;
        },
      };
    },
  });
  return { ...module.exports, adapters };
}

test('bound updates reject before readiness and isolate independent applications', async () => {
  const { createFederationServer, adapters } = fixture();
  const first = createFederationServer({});
  const second = createFederationServer({});
  const { updateRemotes } = first;
  assert.throws(() => updateRemotes([]), /not ready/);
  const a = { status: { phase: 'serving' } };
  const b = { status: { phase: 'serving' } };
  first.configureApplication({}).onReady(a);
  second.configureApplication({}).onReady(b);
  updateRemotes([]);
  second.updateRemotes([]);
  assert.equal(adapters[0].calls[0], a);
  assert.equal(adapters[1].calls[0], b);
  assert.throws(() => first.configureApplication({}).onReady(b), /separate/);
  await first.close();
  assert.throws(() => updateRemotes([]), /closed/);
  second.updateRemotes([]);
  assert.equal(adapters[1].calls.length, 2);
});

test('reset replaces the adapter behind existing hooks and exported functions', async () => {
  const { createFederationServer, adapters } = fixture();
  const integration = createFederationServer({});
  const hooks = integration.configureApplication({});
  const { updateRemotes } = integration;
  let insideUpdate = false;
  const app = {
    async update(callback) {
      insideUpdate = true;
      await callback();
      insideUpdate = false;
    },
  };
  hooks.onReady(app);
  await integration.reset(() => assert.equal(insideUpdate, true));
  assert.equal(hooks.reloadEntry('tomorrow'), adapters[1]);
  updateRemotes([]);
  assert.equal(adapters[1].calls[0], app);
  assert.equal(adapters[0].calls.length, 0);
  assert.throws(
    () => integration.configureApplication({ onReady() {} }),
    /owns hook/,
  );
});
