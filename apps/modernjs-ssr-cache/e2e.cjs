const { fork } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
let service;
(async () => {
  let url = process.env.WEATHER_TEST_URL;
  if (!url) {
    service = fork(path.join(__dirname, 'start.cjs'), ['--memory'], {
      env: { ...process.env, WEATHER_PORT: '0', WEATHER_ASSET_PORT: '0' },
      stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
    });
    url = await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(Error('Startup timed out')),
        180000,
      );
      service.on('message', (m) => {
        if (m.ready) {
          clearTimeout(timer);
          resolve(m.url);
        }
      });
      service.once('exit', () => {
        clearTimeout(timer);
        reject(Error('Startup failed'));
      });
    });
  }
  const project = await fs.mkdtemp(path.join(os.tmpdir(), 'weather-cypress-'));
  await fs.copyFile(
    path.join(__dirname, 'review.cy.cjs'),
    path.join(project, 'review.cy.cjs'),
  );
  await fs.writeFile(
    path.join(project, 'cypress.config.cjs'),
    'module.exports=' +
      JSON.stringify({
        video: false,
        chromeWebSecurity: false,
        viewportWidth: 1280,
        viewportHeight: 800,
        e2e: {
          baseUrl: url,
          supportFile: false,
          specPattern: '*.cy.cjs',
          defaultCommandTimeout: 20000,
        },
      }),
  );
  const result = await require(
    path.resolve(__dirname, '../../node_modules/cypress'),
  ).run({ project, browser: 'electron', headless: true });
  assert.equal(result.totalFailed, 0);
  assert.equal(result.totalPassed, 3);
  console.log('WEATHER_E2E_PASSED ' + project);
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => service?.kill());
