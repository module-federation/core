import { beforeAll, afterAll, describe, it } from '@rstest/core';
import assert from 'node:assert/strict';
import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { chromium } from '@playwright/test';

const serverRoot = path.resolve(__dirname, '../..');
const repoRoot = path.resolve(serverRoot, '../..');
const distEntry = path.join(serverRoot, 'dist', 'server.js');
const embeddedIndex = path.join(serverRoot, 'dist', 'frontend', 'index.html');

const getAvailablePort = () =>
  new Promise<number>((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port =
        typeof address === 'string'
          ? Number(address.split(':').pop())
          : address?.port;
      if (!port) {
        server.close(() => reject(new Error('failed to allocate port')));
        return;
      }
      server.close(() => resolve(port));
    });
  });

const waitForHealth = async (baseUrl: string, timeoutMs = 120000) => {
  const healthUrl = `${baseUrl}/tree-shaking-shared/healthz`;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(healthUrl);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('backend did not become healthy in time');
};

let serverProcess: ReturnType<typeof spawn> | null = null;
let baseUrl = '';

beforeAll(async () => {
  if (!fs.existsSync(distEntry) || !fs.existsSync(embeddedIndex)) {
    execSync('pnpm -C packages/treeshake-server build', {
      cwd: repoRoot,
      stdio: 'inherit',
    });
  }

  const port = await getAvailablePort();
  baseUrl = `http://127.0.0.1:${port}`;

  serverProcess = spawn('node', ['dist/server.js'], {
    cwd: serverRoot,
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      TREESHAKE_FRONTEND_DIST: '',
      TREESHAKE_FRONTEND_BASE_PATH: '/tree-shaking',
    },
    stdio: 'pipe',
  });

  await waitForHealth(baseUrl);
});

afterAll(async () => {
  if (!serverProcess) return;
  serverProcess.kill('SIGTERM');
  await new Promise((resolve) => {
    serverProcess?.once('exit', () => resolve(null));
    setTimeout(() => resolve(null), 5000);
  });
});

describe('cli embedded ui (e2e)', () => {
  it('serves the UI and drives the backend flow', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.addInitScript((serverUrl: string) => {
      window.localStorage.setItem('treeshake_server_url', serverUrl);
    }, `${baseUrl}/tree-shaking-shared`);

    await page.goto(`${baseUrl}/tree-shaking/`);
    await page.waitForLoadState('networkidle');

    const tryNowBtn = page.getByRole('button', { name: /try it now/i });
    await tryNowBtn.waitFor({ state: 'visible' });
    await tryNowBtn.click();
    await page.waitForURL(/tree-shaking\/#\/analyze/);

    const fillBtn = page.getByRole('button', { name: /fill demo data/i });
    await fillBtn.waitFor({ state: 'visible' });

    const checkRespPromise = page.waitForResponse((resp) => {
      if (resp.request().method() !== 'POST') return false;
      try {
        return new URL(resp.url()).pathname.endsWith(
          '/tree-shaking-shared/build/check-tree-shaking',
        );
      } catch {
        return false;
      }
    });

    await fillBtn.click();
    const checkResp = await checkRespPromise;
    assert.equal(checkResp.ok(), true);

    const analyzeBtn = page.getByRole('button', {
      name: /analyze treeshake savings|立即分析/i,
    });
    await analyzeBtn.waitFor({ state: 'visible' });
    await analyzeBtn.click();

    const buildResp = await page.waitForResponse((resp) => {
      if (resp.request().method() !== 'POST') return false;
      try {
        return new URL(resp.url()).pathname.endsWith(
          '/tree-shaking-shared/build',
        );
      } catch {
        return false;
      }
    });
    assert.equal(buildResp.ok(), true);

    await page
      .locator('#results')
      .waitFor({ state: 'visible', timeout: 300000 });

    await browser.close();
  });
});
