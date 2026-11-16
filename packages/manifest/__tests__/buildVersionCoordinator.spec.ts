/** @jest-environment node */
import { createBuildVersionCoordinator } from '../src/buildVersionCoordinator';
import {
  getCompilationBuildVersion,
  setCompilationBuildVersion,
} from '../src/buildVersion';

function hook() {
  const handlers: { stage: number; callback: (...args: any[]) => void }[] = [];
  return {
    tap(options: { stage?: number }, callback: (...args: any[]) => void) {
      handlers.push({ stage: options.stage ?? 0, callback });
    },
    call(...args: any[]) {
      for (const handler of [...handlers].sort((a, b) => a.stage - b.stage))
        handler.callback(...args);
    },
  };
}

function compiler(mode = 'development') {
  const hooks = { thisCompilation: hook(), invalid: hook() };
  return {
    options: { mode },
    hooks,
    watching: { invalidate: jest.fn(() => hooks.invalid.call()) },
    build() {
      const compilation = {} as Parameters<
        typeof getCompilationBuildVersion
      >[0];
      hooks.thisCompilation.call(compilation);
      return { compilation };
    },
  };
}
const version = (stats: ReturnType<ReturnType<typeof compiler>['build']>) =>
  getCompilationBuildVersion(stats.compilation);

it('assigns one version before federation reads it and invalidates the peer once', () => {
  const browser = compiler();
  const node = compiler();
  const onInvalidate = jest.fn();
  const builds = createBuildVersionCoordinator({ onInvalidate });
  builds.apply(browser);
  builds.apply(node);
  browser.hooks.thisCompilation.tap({ stage: 0 }, (compilation) =>
    getCompilationBuildVersion(compilation),
  );
  const first = { stats: [browser.build(), node.build()] };
  expect(version(first.stats[0])).toBe(version(first.stats[1]));
  expect(builds.isCurrent(first)).toBe(true);
  node.watching.invalidate();
  expect(browser.watching.invalidate).toHaveBeenCalledTimes(1);
  expect(onInvalidate).toHaveBeenCalledTimes(1);
  expect(builds.isCurrent(first)).toBe(false);
  const nodeStats = node.build();
  expect(builds.isCurrent({ stats: [first.stats[0], nodeStats] })).toBe(false);
  const second = { stats: [browser.build(), nodeStats] };
  expect(version(second.stats[0])).toBe(version(nodeStats));
  expect(Number(version(nodeStats))).toBeGreaterThan(
    Number(version(first.stats[0])),
  );
  expect(builds.isCurrent(second)).toBe(true);
  expect(builds.isCurrent({ stats: [nodeStats, nodeStats] })).toBe(false);
});

it('coalesces invalidations before compilation and supersedes edits during compilation', () => {
  const browser = compiler();
  const node = compiler();
  const builds = createBuildVersionCoordinator();
  builds.apply(browser);
  builds.apply(node);
  browser.build();
  node.build();
  browser.watching.invalidate();
  node.watching.invalidate();
  const browserStats = browser.build();
  const sameRound = node.build();
  expect(version(browserStats)).toBe(version(sameRound));
  browser.watching.invalidate();
  const superseded = browser.build();
  node.watching.invalidate();
  const latestNode = node.build();
  expect(builds.isCurrent({ stats: [superseded, latestNode] })).toBe(false);
  expect(builds.isCurrent({ stats: [browserStats, sameRound] })).toBe(false);
  const latest = { stats: [browser.build(), latestNode] };
  expect(builds.isCurrent(latest)).toBe(true);
  expect(version(latest.stats[0])).toBe(version(latestNode));
});

it('keeps applications isolated, supports one target and rejects late results', async () => {
  const a = compiler();
  const b = compiler();
  const first = createBuildVersionCoordinator();
  const second = createBuildVersionCoordinator();
  expect(first.isCurrent({ stats: [] })).toBe(false);
  first.apply(a);
  second.apply(b);
  first.apply(a);
  const aStats = a.build();
  const bStats = b.build();
  expect(first.isCurrent(aStats)).toBe(true);
  expect(second.isCurrent(bStats)).toBe(true);
  expect(first.isCurrent(bStats)).toBe(false);
  const late = Promise.resolve().then(() => first.isCurrent(aStats));
  a.watching.invalidate();
  expect(await late).toBe(false);
  expect(second.isCurrent(bStats)).toBe(true);
  expect(b.watching.invalidate).not.toHaveBeenCalled();
  expect(first.isCurrent(a.build())).toBe(true);
  expect(first.isCurrent({})).toBe(false);
});

it('preserves production identity assignment', () => {
  const source = compiler('production');
  const builds = createBuildVersionCoordinator();
  builds.apply(source);
  const stats = source.build();
  setCompilationBuildVersion(stats.compilation, 'release-42');
  expect(version(stats)).toBe('release-42');
  expect(builds.isCurrent(stats)).toBe(false);
});
