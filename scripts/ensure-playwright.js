#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const { execSync } = require('node:child_process');

const ensurePlaywright = () => {
  let chromium;
  try {
    const resolved = require.resolve('@playwright/test', {
      paths: [process.cwd()],
    });
    ({ chromium } = require(resolved));
  } catch (error) {
    console.error(
      '[ensure-playwright] @playwright/test is not available from the current working directory. Install dependencies first.',
    );
    throw error;
  }

  const executablePath = chromium.executablePath();
  if (fs.existsSync(executablePath)) {
    return;
  }

  const installArgs =
    process.platform === 'linux'
      ? 'playwright install --with-deps'
      : 'playwright install';

  console.log(
    `[ensure-playwright] Missing browser. Running "pnpm exec ${installArgs}"...`,
  );
  execSync(`pnpm exec ${installArgs}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });
};

ensurePlaywright();
