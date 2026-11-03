import { describe, it, expect, beforeEach, rs } from '@rstest/core';
import { prefetch } from '../src/prefetch';
import * as utils from '../src/utils';
import logger from '../src/logger';
import helpers from '@module-federation/runtime/helpers';

rs.mock('../src/logger', () => ({
  default: {
    debug: rs.fn(),
    log: rs.fn(),
    warn: rs.fn(),
    error: rs.fn(),
  },
}));

rs.mock('../src/utils', () => ({
  getDataFetchInfo: rs.fn(),
  getDataFetchMap: rs.fn(),
  getDataFetchMapKey: rs.fn(),
}));

rs.mock('@module-federation/runtime/helpers', () => ({
  default: {
    utils: {
      matchRemoteWithNameAndExpose: rs.fn(),
      getRemoteInfo: rs.fn(),
    },
  },
  utils: {
    matchRemoteWithNameAndExpose: rs.fn(),
    getRemoteInfo: rs.fn(),
  },
}));

describe('prefetch', () => {
  let mockInstance: any;

  beforeEach(() => {
    rs.clearAllMocks();
    mockInstance = {
      name: 'host',
      options: {
        version: '1.0.0',
        remotes: [
          {
            name: 'remote1',
            alias: 'remote1_alias',
            entry: 'http://localhost:3001/remoteEntry.js',
          },
        ],
      },
      snapshotHandler: {
        loadRemoteSnapshotInfo: rs.fn(),
      },
      remoteHandler: {
        hooks: {
          lifecycle: {
            generatePreloadAssets: {
              emit: rs.fn(),
            },
          },
        },
      },
    };
  });

  it('should log an error if id is not provided', async () => {
    // @ts-ignore
    await prefetch({ instance: mockInstance });
    expect(logger.error).toHaveBeenCalledWith('id is required for prefetch!');
  });

  it('should log an error if instance is not provided', async () => {
    // @ts-ignore
    await prefetch({ id: 'remote1/component1' });
    expect(logger.error).toHaveBeenCalledWith(
      'instance is required for prefetch!',
    );
  });

  it('should log an error if remote is not found', async () => {
    (
      helpers.utils.matchRemoteWithNameAndExpose as ReturnType<typeof rs.fn>
    ).mockReturnValue(undefined);
    await prefetch({ id: 'nonexistent/component', instance: mockInstance });
    expect(logger.error).toHaveBeenCalledWith(
      `Can not found 'nonexistent/component' in instance.options.remotes!`,
    );
  });

  it('should successfully prefetch data and component resources', async () => {
    const mockRemoteInfo = {
      remote: { name: 'remote1', alias: 'remote1_alias' },
      expose: './component1',
    };
    (
      helpers.utils.matchRemoteWithNameAndExpose as ReturnType<typeof rs.fn>
    ).mockReturnValue(mockRemoteInfo);
    (
      mockInstance.snapshotHandler.loadRemoteSnapshotInfo as ReturnType<
        typeof rs.fn
      >
    ).mockResolvedValue({
      remoteSnapshot: {},
      globalSnapshot: {},
    });
    (helpers.utils.getRemoteInfo as ReturnType<typeof rs.fn>).mockReturnValue(
      {},
    );

    const mockDataFetchFn = rs
      .fn()
      .mockResolvedValue({ data: 'prefetched data' });
    const mockGetDataFetchGetter = rs.fn().mockResolvedValue(mockDataFetchFn);
    const mockDataFetchMap = {
      'remote1_alias@remote1/component1': [
        [mockGetDataFetchGetter, 'GET', undefined],
      ],
    };
    (utils.getDataFetchMap as ReturnType<typeof rs.fn>).mockReturnValue(
      mockDataFetchMap,
    );
    (utils.getDataFetchInfo as ReturnType<typeof rs.fn>).mockReturnValue({
      name: 'remote1',
      alias: 'remote1_alias',
      id: 'remote1/component1',
    });
    (utils.getDataFetchMapKey as ReturnType<typeof rs.fn>).mockReturnValue(
      'remote1_alias@remote1/component1',
    );

    await prefetch({
      id: 'remote1/component1',
      instance: mockInstance,
      dataFetchParams: { some: 'param', isDowngrade: false } as any,
      preloadComponentResource: true,
    });

    expect(
      mockInstance.remoteHandler.hooks.lifecycle.generatePreloadAssets.emit,
    ).toHaveBeenCalled();

    expect(mockGetDataFetchGetter).toHaveBeenCalled();
    await new Promise(process.nextTick);
    expect(mockDataFetchFn).toHaveBeenCalledWith({
      some: 'param',
      _id: 'remote1_alias@remote1/component1',
      isDowngrade: false,
    });
  });

  it('should handle cases where data fetch info is not available', async () => {
    const mockRemoteInfo = {
      remote: { name: 'remote1', alias: 'remote1_alias' },
      expose: './component1',
    };
    (
      helpers.utils.matchRemoteWithNameAndExpose as ReturnType<typeof rs.fn>
    ).mockReturnValue(mockRemoteInfo);
    (
      mockInstance.snapshotHandler.loadRemoteSnapshotInfo as ReturnType<
        typeof rs.fn
      >
    ).mockResolvedValue({
      remoteSnapshot: {},
      globalSnapshot: {},
    });
    (utils.getDataFetchMap as ReturnType<typeof rs.fn>).mockReturnValue(
      undefined,
    );

    await prefetch({
      id: 'remote1/component1',
      instance: mockInstance,
    });

    expect(utils.getDataFetchInfo).not.toHaveBeenCalled();
  });
});
