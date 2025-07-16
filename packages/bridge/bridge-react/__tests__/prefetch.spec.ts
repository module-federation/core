import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock('../src/lazy/logger', () => ({
  default: {
    error: jest.fn(),
  },
}));
jest.mock('../src/lazy/utils', () => ({
  getDataFetchMap: jest.fn(),
  getDataFetchInfo: jest.fn(),
}));
jest.mock('@module-federation/runtime/helpers', () => ({
  default: {
    utils: {
      matchRemoteWithNameAndExpose: jest.fn(),
      getRemoteInfo: jest.fn(),
    },
  },
}));

import { prefetch } from '../src/lazy/data-fetch/prefetch';
import * as utils from '../src/lazy/utils';
import logger from '../src/lazy/logger';
import helpers from '@module-federation/runtime/helpers';

describe('prefetch', () => {
  let mockInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up logger mock
    (logger.error as jest.Mock) = jest.fn();

    // Set up helpers mock
    (helpers.utils.matchRemoteWithNameAndExpose as jest.Mock) = jest.fn();
    (helpers.utils.getRemoteInfo as jest.Mock) = jest.fn();

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
        loadRemoteSnapshotInfo: jest.fn(),
      },
      remoteHandler: {
        hooks: {
          lifecycle: {
            generatePreloadAssets: {
              emit: jest.fn(),
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
    (helpers.utils.matchRemoteWithNameAndExpose as jest.Mock).mockReturnValue(
      undefined,
    );
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
    helpers.utils.matchRemoteWithNameAndExpose.mockReturnValue(mockRemoteInfo);
    (
      mockInstance.snapshotHandler.loadRemoteSnapshotInfo as jest.Mock
    ).mockResolvedValue({
      remoteSnapshot: {},
      globalSnapshot: {},
    });
    helpers.utils.getRemoteInfo.mockReturnValue({});

    const mockDataFetchFn = jest
      .fn()
      .mockResolvedValue({ data: 'prefetched data' });
    const mockGetDataFetchGetter = jest.fn().mockResolvedValue(mockDataFetchFn);
    const mockDataFetchMap = {
      'remote1_alias@remote1/component1': [
        [mockGetDataFetchGetter, 'GET', undefined],
      ],
    };
    (utils.getDataFetchMap as any).mockReturnValue(mockDataFetchMap);
    (utils.getDataFetchInfo as any).mockReturnValue({
      name: 'remote1',
      alias: 'remote1_alias',
      id: 'remote1/component1',
    });
    (utils.getDataFetchMapKey as jest.Mock).mockReturnValue(
      'remote1_alias@remote1/component1',
    );

    await prefetch({
      id: 'remote1/component1',
      instance: mockInstance,
      dataFetchParams: { some: 'param' },
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
    helpers.utils.matchRemoteWithNameAndExpose.mockReturnValue(mockRemoteInfo);
    (
      mockInstance.snapshotHandler.loadRemoteSnapshotInfo as jest.Mock
    ).mockResolvedValue({
      remoteSnapshot: {},
      globalSnapshot: {},
    });
    (utils.getDataFetchMap as any).mockReturnValue(undefined);

    await prefetch({
      id: 'remote1/component1',
      instance: mockInstance,
    });

    expect(utils.getDataFetchInfo).not.toHaveBeenCalled();
  });
});
