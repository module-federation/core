import { expect, it, rs } from '@rstest/core';
import { pluginModuleFederation, type ExposedAPIType } from './index';
import * as original from '@module-federation/enhanced/rspack' with {
  rstest: 'importActual',
};

const { isCurrent, merge } = rs.hoisted(() => ({
  isCurrent: rs.fn(),
  merge: rs.fn(),
}));
rs.mock('@module-federation/enhanced/rspack', () => ({
  ...original,
  createBuildVersionCoordinator: () => ({ apply: rs.fn(), isCurrent }),
}));
rs.mock('../utils/manifest', () => ({ updateStatsAndManifest: merge }));

it('merges only successful current development results and preserves build publication', () => {
  const config = { environments: { mf: {} } };
  const api = {
    context: { callerName: 'rslib' },
    getRsbuildConfig: () => config,
    modifyRsbuildConfig: rs.fn(),
    modifyEnvironmentConfig: rs.fn(),
    expose: rs.fn(),
    processAssets: rs.fn(),
    onBeforeCreateCompiler: rs.fn(),
    onDevCompileDone: rs.fn(),
    onAfterBuild: rs.fn(),
  };
  pluginModuleFederation({ name: 'library' }, { target: 'dual' }).setup(
    api as any,
  );
  const exposed = api.expose.mock.calls[0][1] as ExposedAPIType;
  Object.assign(exposed.options, {
    distOutputDir: '/output',
    browserEnvironmentName: 'mf',
    nodeEnvironmentName: 'ssr',
  });
  exposed.assetResources.mf = {};
  exposed.assetResources.ssr = {};
  const done = api.onDevCompileDone.mock.calls[0][0];
  const stats = { hasErrors: () => false };
  isCurrent.mockReturnValue(false);
  done({ stats });
  expect(merge).not.toHaveBeenCalled();
  isCurrent.mockReturnValue(true);
  done({ stats: { hasErrors: () => true } });
  expect(merge).not.toHaveBeenCalled();
  done({ stats });
  expect(isCurrent).toHaveBeenLastCalledWith(stats);
  expect(merge).toHaveBeenCalledTimes(1);
  isCurrent.mockReturnValue(false);
  done({ stats });
  expect(merge).toHaveBeenCalledTimes(1);
  api.onAfterBuild.mock.calls[0][0]();
  expect(merge).toHaveBeenCalledTimes(2);
});
