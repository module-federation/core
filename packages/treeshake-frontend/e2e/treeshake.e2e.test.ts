import { beforeAll, afterAll, describe, it } from '@rstest/core';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
import path from 'node:path';

const BASE_URL = 'http://127.0.0.1:4000';
const HEALTH_URL = `${BASE_URL}/tree-shaking-shared/healthz`;

const waitForHealth = async (timeoutMs = 120000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(HEALTH_URL);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('backend did not become healthy in time');
};

let serverProcess: ReturnType<typeof spawn> | null = null;

beforeAll(async () => {
  const cwd = path.resolve(__dirname, '..');
  serverProcess = spawn('node', ['scripts/e2e-server.js'], {
    cwd,
    env: {
      ...process.env,
      PORT: '4000',
      HOST: '127.0.0.1',
      TREESHAKE_FRONTEND_BASE_PATH: '/tree-shaking',
    },
    stdio: 'pipe',
  });
  await waitForHealth();
});

afterAll(async () => {
  if (!serverProcess) return;
  serverProcess.kill('SIGTERM');
  await new Promise((resolve) => {
    serverProcess?.once('exit', () => resolve(null));
    setTimeout(() => resolve(null), 5000);
  });
});

describe('treeshake frontend e2e', () => {
  it('renders and runs analyze flow', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.addInitScript(() => {
      window.localStorage.setItem(
        'treeshake_server_url',
        'http://127.0.0.1:4000/tree-shaking-shared',
      );
    });

    await page.goto(`${BASE_URL}/tree-shaking/`);
    await page.waitForLoadState('networkidle');

    const tryNowBtn = page.getByRole('button', { name: /try it now/i });
    await tryNowBtn.waitFor({ state: 'visible' });
    await tryNowBtn.click();
    await page.waitForURL(/tree-shaking\/#\/analyze/);

    const fillBtn = page.getByRole('button', {
      name: /fill demo data|填入演示数据/i,
    });
    await fillBtn.waitFor({ state: 'visible' });

    const checkRespPromise = page.waitForResponse(
      (resp) => {
        if (resp.request().method() !== 'POST') return false;
        try {
          return new URL(resp.url()).pathname.endsWith(
            '/tree-shaking-shared/build/check-tree-shaking',
          );
        } catch {
          return false;
        }
      },
      { timeout: 120000 },
    );

    await fillBtn.click();
    const checkResp = await checkRespPromise;
    assert.equal(checkResp.ok(), true);

    const analyzeBtn = page.getByRole('button', {
      name: /analyze treeshake savings|立即分析/i,
    });
    await analyzeBtn.waitFor({ state: 'visible' });
    await analyzeBtn.click();

    const buildResp = await page.waitForResponse(
      (resp) => {
        if (resp.request().method() !== 'POST') return false;
        try {
          return new URL(resp.url()).pathname.endsWith(
            '/tree-shaking-shared/build',
          );
        } catch {
          return false;
        }
      },
      { timeout: 180000 },
    );
    assert.equal(buildResp.ok(), true);

    await page
      .locator('#results')
      .waitFor({ state: 'visible', timeout: 600000 });

    await browser.close();
  });
});
