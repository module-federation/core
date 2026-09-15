const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { fork } = require('node:child_process');
const { once } = require('node:events');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let processHandle;
async function waitFor(check, ms = 15000) {
  const until = Date.now() + ms;
  while (!(await check())) {
    if (Date.now() > until)
      throw Error('Timed out waiting for playground state');
    await sleep(25);
  }
}
(async () => {
  let url = process.env.LAB_TEST_URL;
  if (!url) {
    processHandle = fork(
      path.join(__dirname, '../playground/start.cjs'),
      ['--test'],
      {
        env: { ...process.env, SSR_CACHE_DEMO_PORT: '0' },
        stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
      },
    );
    url = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(Error('Startup timeout')), 180000);
      processHandle.once('message', (m) => {
        clearTimeout(timer);
        resolve(m.url);
      });
      processHandle.once('exit', (c) => {
        clearTimeout(timer);
        reject(Error('Playground exited ' + c));
      });
    });
  }
  const state = async () => await (await fetch(url + '/api/state')).json();
  async function action(name, kind = 'static', params = {}) {
    const res = await fetch(
      url +
        '/api/' +
        name +
        '?' +
        new URLSearchParams({ host: kind, ...params }),
      { method: 'POST' },
    );
    const text = await res.text();
    assert.equal(res.status, 200, text);
    return JSON.parse(text);
  }
  let current = await state();
  assert.notEqual(current.hosts.static.pid, current.hosts.dynamic.pid);
  assert.notEqual(current.hosts.static.pid, process.pid);
  assert.deepEqual(current.hosts.static.plan, {
    mode: 'entries',
    entries: ['index'],
    reasons: [],
  });
  assert.equal(current.hosts.dynamic.plan.mode, 'application');
  const project = await fs.mkdtemp(
    path.join(require('node:os').tmpdir(), 'ssr-lab-cypress-'),
  );
  await fs.copyFile(
    path.join(__dirname, 'playground.cy.cjs'),
    path.join(project, 'playground.cy.cjs'),
  );
  await fs.writeFile(
    path.join(project, 'cypress.config.cjs'),
    'module.exports=' +
      JSON.stringify({
        video: false,
        chromeWebSecurity: false,
        screenshotOnRunFailure: true,
        viewportWidth: 1440,
        viewportHeight: 1080,
        e2e: {
          supportFile: false,
          specPattern: '*.cy.cjs',
          baseUrl: url,
          defaultCommandTimeout: 15000,
        },
      }),
  );
  const cypress = require(
    path.resolve(__dirname, '../../../../node_modules/cypress'),
  );
  const result = await cypress.run({
    project,
    browser: 'electron',
    headless: true,
  });
  assert.equal(
    result.totalPassed,
    3,
    'See Cypress output for scenario failures',
  );
  assert.equal(result.totalFailed, 0);
  console.log('PLAYGROUND_SCREENSHOTS', project + '/cypress/screenshots');
  for (const kind of ['static', 'dynamic']) {
    await action('update', kind, { v: 'v1' });
    const before = await state();
    const pid = before.hosts[kind].pid;
    await action('experiment', kind, {
      preset: 'manual',
      count: '12',
      interval: '0',
      v: 'v2',
    });
    await waitFor(async () => {
      const s = await state();
      return (
        s.experiment.requests.length === 13 &&
        s.hosts[kind].status.pendingRequests > 0
      );
    });
    const blocked = await state();
    const pending = blocked.experiment.requests.filter(
      (r) => r.id !== 'held' && r.route === '/',
    );
    assert.ok(pending.every((r) => r.state === 'sent'));
    assert.ok(
      pending.every(
        (r) =>
          !blocked.hosts[kind].records.some(
            (e) => e.id === r.id && e.event === 'loader-enter',
          ),
      ),
    );
    if (kind === 'static') {
      await waitFor(async () =>
        (await state()).experiment.requests
          .filter((r) => r.route === '/b')
          .every((r) => r.state === 'complete'),
      );
    } else
      assert.ok(
        blocked.experiment.requests
          .filter((r) => r.route === '/b')
          .every((r) => r.state === 'sent'),
      );
    await action('release', kind);
    await waitFor(async () => !(await state()).experiment.running);
    const done = await state();
    assert.ok(
      done.experiment.requests.every((r) => r.status === 200),
      JSON.stringify(done.experiment),
    );
    assert.ok(
      done.experiment.requests
        .filter((r) => r.id !== 'held' && r.route === '/')
        .every((r) => r.release === 'v2'),
    );
    assert.equal(done.hosts[kind].pid, pid);
    assert.equal(
      done.hosts[kind].lastUpdate.mode,
      kind === 'static' ? 'entries' : 'application',
    );
  }
  // Overflow and queue timeout use real Modern admission, no synthetic 503.
  await action('experiment', 'dynamic', {
    preset: 'manual',
    count: '32',
    interval: '0',
    v: 'v1',
  });
  await waitFor(
    async () =>
      (await state()).experiment.requests.filter((r) => r.id !== 'held')
        .length === 32,
  );
  await waitFor(async () =>
    (await state()).experiment.requests.some((r) => r.status === 503),
  );
  await waitFor(
    async () =>
      (await state()).experiment.requests
        .filter((r) => r.id !== 'held')
        .every((r) => r.status === 503),
    7000,
  );
  await action('release', 'dynamic');
  await waitFor(async () => !(await state()).experiment.running);
  assert.equal((await state()).hosts.dynamic.status.phase, 'serving');
  // The default UI must demonstrate successful queue/release without user timing.
  for (const kind of ['static', 'dynamic']) {
    const before = await state();
    const target = before.hosts[kind].version === 'v1' ? 'v2' : 'v1';
    await action('experiment', kind, { v: target });
    await waitFor(async () => !(await state()).experiment.running);
    const after = await state(),
      exp = after.experiment;
    assert.equal(exp.exitCode, 0);
    assert.equal(exp.requests.length, 13);
    assert.ok(
      exp.requests.every((r) => r.status === 200),
      JSON.stringify(exp),
    );
    assert.ok(exp.events.some((e) => e.type === 'queue' && e.peak > 0));
    assert.ok(exp.events.some((e) => e.type === 'released'));
    assert.ok(
      exp.requests
        .filter((r) => r.route === '/')
        .every((r) => r.release === target && r.end - r.sent >= 1000),
    );
    assert.equal(after.hosts[kind].pid, before.hosts[kind].pid);
  }
  for (const preset of ['overflow', 'timeout']) {
    await action('experiment', 'dynamic', {
      preset,
      v: preset === 'overflow' ? 'v1' : 'v2',
    });
    await waitFor(async () => !(await state()).experiment.running);
    const exp = (await state()).experiment;
    assert.equal(exp.exitCode, 0);
    const rejected = exp.requests.filter((r) => r.status === 503);
    assert.equal(rejected.length, preset === 'overflow' ? 16 : 12);
    assert.ok(
      rejected.every((r) =>
        r.reason.includes(
          preset === 'overflow' ? 'queue is full' : 'wait timed out',
        ),
      ),
      JSON.stringify(exp),
    );
    assert.ok(
      exp.requests
        .filter((r) => r.status !== 503)
        .every((r) => r.status === 200),
    );
  }
  await action('experiment', 'dynamic', { mode: 'memory', count: '20' });
  await waitFor(async () => !(await state()).experiment.running, 60000);
  current = await state();
  assert.equal(current.experiment.exitCode, 0);
  const samples = current.samples.dynamic;
  assert.equal(samples.length, 4);
  assert.ok(
    samples.every(
      (s) =>
        s.gc &&
        s.pid === current.hosts.dynamic.pid &&
        s.status.activeRequests === 0 &&
        s.status.pendingRequests === 0,
    ),
  );
  console.log(
    'Playground E2E passed: SSR/hydration, dynamic loading, scoped/full real traffic, queue overflow/timeout, 20-update memory experiment.',
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (processHandle) {
      processHandle.kill('SIGTERM');
      await once(processHandle, 'exit');
    }
  });
