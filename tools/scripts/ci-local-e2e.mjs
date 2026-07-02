import { serializeAppNames } from './ci-e2e-suites.mjs';

export function createLocalE2EHelpers({
  formatExit,
  runCommand,
  runPackagesBuild,
  step,
}) {
  function installDependenciesStep() {
    return step('Install dependencies', (ctx) =>
      runCommand('pnpm', ['install', '--frozen-lockfile'], ctx),
    );
  }

  function checkAffectedStep(appNames) {
    return step('Check CI conditions', async (ctx) => {
      const resolvedAppNames =
        typeof appNames === 'function' ? appNames(ctx) : appNames;
      ctx.state.shouldRun = await ciIsAffected(resolvedAppNames, ctx);
      ctx.state.skipReason = ctx.state.shouldRun
        ? null
        : 'Not affected by current changes.';
    });
  }

  function setupAffectedE2E({ cypress = true } = {}) {
    return step('Setup E2E dependencies and package build', async (ctx) => {
      if (!ctx.state.shouldRun) {
        logStepSkip(ctx, currentSkipReason(ctx));
        return;
      }
      if (cypress) {
        await runCommand('npx', ['cypress', 'install'], ctx);
      }
      await runPackagesBuild(ctx);
    });
  }

  function e2eSetupSteps(appNames, options) {
    return [
      installDependenciesStep(),
      checkAffectedStep(appNames),
      setupAffectedE2E(options),
    ];
  }

  async function runWhenAffected(ctx, run) {
    if (!ctx.state.shouldRun) {
      logStepSkip(ctx, currentSkipReason(ctx));
      return;
    }
    await run();
  }

  async function ciIsAffected(appNames, ctx) {
    const result = await runCommand(
      'node',
      [
        'tools/scripts/ci-is-affected.mjs',
        `--appName=${serializeAppNames(appNames)}`,
      ],
      { ...ctx, allowFailure: true },
    );
    if (result.code === 0) {
      return true;
    }
    if (result.code === 1) {
      return false;
    }
    throw new Error(
      `ci-is-affected failed with unexpected ${formatExit(result)}`,
    );
  }

  function currentSkipReason(ctx) {
    return ctx.state.skipReason ?? 'Not affected by current changes.';
  }

  return {
    checkAffectedStep,
    e2eSetupSteps,
    installDependenciesStep,
    logStepSkip,
    runWhenAffected,
    setupAffectedE2E,
  };
}

function logStepSkip(ctx, reason) {
  console.log(`[ci:local] ${ctx.jobName} -> Skipped: ${reason}`);
}
