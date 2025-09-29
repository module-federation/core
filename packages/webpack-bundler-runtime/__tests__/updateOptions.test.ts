import {
  updateConsumeOptions,
  updateRemoteOptions,
} from '../src/updateOptions';
import { InstallInitialConsumesOptions, RemotesOptions } from '../src/types';

describe('updateOptions', () => {
  describe('updateConsumeOptions', () => {
    it('should update consume options with new data', () => {
      const mockWebpackRequire = {
        consumesLoadingData: {
          moduleIdToConsumeDataMapping: {
            module1: { shareScope: 'default', name: 'react' },
            module2: { shareScope: 'custom', name: 'lodash' },
          },
          initialConsumes: ['module1', 'module3'],
          chunkMapping: {
            chunk1: ['module1', 'module2'],
            chunk2: ['module3'],
          },
        },
      } as any;

      const options: InstallInitialConsumesOptions = {
        webpackRequire: mockWebpackRequire,
        moduleToHandlerMapping: {
          module3: { shareScope: 'existing', name: 'vue' } as any,
        },
        installedModules: {},
        initialConsumes: ['module4'],
      };

      updateConsumeOptions(options);

      expect(options.moduleToHandlerMapping).toEqual({
        module3: { shareScope: 'existing', name: 'vue' } as any,
        module1: { shareScope: 'default', name: 'react' } as any,
        module2: { shareScope: 'custom', name: 'lodash' } as any,
      });

      expect(options.initialConsumes).toEqual([
        'module4',
        'module1',
        'module3',
      ]);
    });

    it('should handle empty consumesLoadingData', () => {
      const mockWebpackRequire = {} as any;
      const options: InstallInitialConsumesOptions = {
        webpackRequire: mockWebpackRequire,
        moduleToHandlerMapping: {},
        installedModules: {},
        initialConsumes: [],
      };

      updateConsumeOptions(options);

      expect(options.moduleToHandlerMapping).toEqual({});
      expect(options.initialConsumes).toEqual([]);
    });

    it('should handle missing chunkMapping', () => {
      const mockWebpackRequire = {
        consumesLoadingData: {
          moduleIdToConsumeDataMapping: {
            module1: { shareScope: 'default', name: 'react' },
          },
        },
      } as any;

      const options: InstallInitialConsumesOptions = {
        webpackRequire: mockWebpackRequire,
        moduleToHandlerMapping: {},
        installedModules: {},
        initialConsumes: [],
      };

      updateConsumeOptions(options);

      expect(options.moduleToHandlerMapping).toEqual({
        module1: { shareScope: 'default', name: 'react' } as any,
      });
    });

    it('should skip when _updated flag is set', () => {
      const mockWebpackRequire = {
        consumesLoadingData: {
          _updated: 1,
          moduleIdToConsumeDataMapping: {
            module1: { shareScope: 'default', name: 'react' },
          },
          initialConsumes: ['module1'],
        },
      } as any;

      const options: InstallInitialConsumesOptions = {
        webpackRequire: mockWebpackRequire,
        moduleToHandlerMapping: {},
        installedModules: {},
        initialConsumes: [],
      };

      updateConsumeOptions(options);

      expect(options.moduleToHandlerMapping).toEqual({});
      expect(options.initialConsumes).toEqual([]);
    });

    // 新增测试：initializeSharingData 处理
    it('should handle initializeSharingData', () => {
      const mockRegisterShared = jest.fn();
      const mockWebpackRequire = {
        consumesLoadingData: {},
        initializeSharingData: {
          scopeToSharingDataMapping: {
            default: [
              {
                name: 'react',
                version: '18.0.0',
                factory: () => ({}),
                singleton: true,
                eager: false,
              },
            ],
          },
        },
        federation: {
          instance: {
            registerShared: mockRegisterShared,
          },
        },
      } as any;

      const options: InstallInitialConsumesOptions = {
        webpackRequire: mockWebpackRequire,
        moduleToHandlerMapping: {},
        installedModules: {},
        initialConsumes: [],
      };

      updateConsumeOptions(options);

      expect(mockRegisterShared).toHaveBeenCalledWith({
        react: [
          {
            version: '18.0.0',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.0.0',
              singleton: true,
              eager: false,
            },
            get: expect.any(Function),
          },
        ],
      });
    });

    // 新增测试：initializeSharingData 跳过已更新
    it('should skip initializeSharingData when _updated flag is set', () => {
      const mockRegisterShared = jest.fn();
      const mockWebpackRequire = {
        initializeSharingData: {
          _updated: 1,
          scopeToSharingDataMapping: {
            default: [{ name: 'react', version: '18.0.0' }],
          },
        },
        federation: {
          instance: {
            registerShared: mockRegisterShared,
          },
        },
      } as any;

      const options: InstallInitialConsumesOptions = {
        webpackRequire: mockWebpackRequire,
        moduleToHandlerMapping: {},
        installedModules: {},
        initialConsumes: [],
      };

      updateConsumeOptions(options);

      expect(mockRegisterShared).not.toHaveBeenCalled();
    });
  });

  describe('updateRemoteOptions', () => {
    it('should update remote options with new data', () => {
      const mockWebpackRequire = {
        remotesLoadingData: {
          chunkMapping: { remote1: ['chunk1'] },
          moduleIdToRemoteDataMapping: {
            remoteModule1: {
              shareScope: 'default',
              name: 'react',
              remoteName: 'reactRemote',
              externalModuleId: 'react-external',
            },
          },
        },
        federation: {
          bundlerRuntimeOptions: {
            remotes: {
              remoteInfos: {
                reactRemote: {
                  url: 'http://localhost:3001',
                  name: 'react',
                } as any,
              },
            },
          },
        },
      } as any;

      const options: RemotesOptions = {
        webpackRequire: mockWebpackRequire,
        chunkId: 'test-chunk',
        promises: [],
        idToExternalAndNameMapping: {},
        idToRemoteMap: {},
        chunkMapping: {},
      };

      updateRemoteOptions(options);

      expect(options.idToExternalAndNameMapping).toEqual({
        remoteModule1: ['default', 'react', 'react-external'],
      });

      expect(options.idToRemoteMap).toEqual({
        remoteModule1: [{ url: 'http://localhost:3001', name: 'react' }],
      });
    });

    it('should handle missing remotesLoadingData', () => {
      const mockWebpackRequire = {} as any;
      const options: RemotesOptions = {
        webpackRequire: mockWebpackRequire,
        chunkId: 'test-chunk',
        promises: [],
        idToExternalAndNameMapping: {},
        idToRemoteMap: {},
        chunkMapping: {},
      };

      updateRemoteOptions(options);

      expect(options.idToExternalAndNameMapping).toEqual({});
      expect(options.idToRemoteMap).toEqual({});
    });

    it('should handle existing mappings', () => {
      const mockWebpackRequire = {
        remotesLoadingData: {
          moduleIdToRemoteDataMapping: {
            existing: {
              shareScope: 'existing',
              name: 'existing-name',
              remoteName: 'existing-remote',
              externalModuleId: 'existing-external',
            },
          },
        },
      } as any;

      const options: RemotesOptions = {
        webpackRequire: mockWebpackRequire,
        chunkId: 'test-chunk',
        promises: [],
        idToExternalAndNameMapping: {
          existing: ['old', 'old-name', 'old-external'],
        },
        idToRemoteMap: {
          existing: [{ url: 'old-url', name: 'old' } as any],
        },
        chunkMapping: {},
      };

      updateRemoteOptions(options);

      // 应该保留现有映射，不覆盖
      expect(options.idToExternalAndNameMapping['existing']).toEqual([
        'old',
        'old-name',
        'old-external',
      ]);
      expect(options.idToRemoteMap['existing']).toEqual([
        { url: 'old-url', name: 'old' },
      ]);
    });

    it('should handle missing remoteInfos', () => {
      const mockWebpackRequire = {
        remotesLoadingData: {
          moduleIdToRemoteDataMapping: {
            remoteModule1: {
              shareScope: 'default',
              name: 'react',
              remoteName: 'missingRemote',
              externalModuleId: 'react-external',
            },
          },
        },
      } as any;

      const options: RemotesOptions = {
        webpackRequire: mockWebpackRequire,
        chunkId: 'test-chunk',
        promises: [],
        idToExternalAndNameMapping: {},
        idToRemoteMap: {},
        chunkMapping: {},
      };

      updateRemoteOptions(options);

      expect(options.idToExternalAndNameMapping).toEqual({
        remoteModule1: ['default', 'react', 'react-external'],
      });
      expect(options.idToRemoteMap).toEqual({});
    });

    // 新增测试：_updated 标志
    it('should skip when _updated flag is set', () => {
      const mockWebpackRequire = {
        remotesLoadingData: {
          _updated: 1,
          chunkMapping: { remote1: ['chunk1'] },
          moduleIdToRemoteDataMapping: {
            remoteModule1: {
              shareScope: 'default',
              name: 'react',
              remoteName: 'reactRemote',
              externalModuleId: 'react-external',
            },
          },
        },
      } as any;

      const options: RemotesOptions = {
        webpackRequire: mockWebpackRequire,
        chunkId: 'test-chunk',
        promises: [],
        idToExternalAndNameMapping: {},
        idToRemoteMap: {},
        chunkMapping: {},
      };

      updateRemoteOptions(options);

      expect(options.idToExternalAndNameMapping).toEqual({});
      expect(options.idToRemoteMap).toEqual({});
    });

    // 新增测试：chunkMapping 更新
    it('should update chunkMapping correctly', () => {
      const mockWebpackRequire = {
        remotesLoadingData: {
          chunkMapping: {
            chunk1: ['module1', 'module2'],
            chunk2: ['module3'],
          },
          moduleIdToRemoteDataMapping: {},
        },
      } as any;

      const options: RemotesOptions = {
        webpackRequire: mockWebpackRequire,
        chunkId: 'test-chunk',
        promises: [],
        idToExternalAndNameMapping: {},
        idToRemoteMap: {},
        chunkMapping: {
          chunk3: ['module4'],
        },
      };

      updateRemoteOptions(options);

      expect(options.chunkMapping).toEqual({
        chunk3: ['module4'],
        chunk1: ['module1', 'module2'],
        chunk2: ['module3'],
      });
    });

    // 新增测试：多个远程项
    it('should handle multiple remote items', () => {
      const mockWebpackRequire = {
        remotesLoadingData: {
          moduleIdToRemoteDataMapping: {
            module1: {
              shareScope: 'default',
              name: 'react',
              remoteName: 'reactRemote',
              externalModuleId: 'react-external',
            },
            module2: {
              shareScope: 'custom',
              name: 'lodash',
              remoteName: 'lodashRemote',
              externalModuleId: 'lodash-external',
            },
          },
        },
        federation: {
          bundlerRuntimeOptions: {
            remotes: {
              remoteInfos: {
                reactRemote: [
                  { url: 'http://react.com', name: 'react' },
                ] as any,
                lodashRemote: [
                  { url: 'http://lodash.com', name: 'lodash' },
                ] as any,
              },
            },
          },
        },
      } as any;

      const options: RemotesOptions = {
        webpackRequire: mockWebpackRequire,
        chunkId: 'test-chunk',
        promises: [],
        idToExternalAndNameMapping: {},
        idToRemoteMap: {},
        chunkMapping: {},
      };

      updateRemoteOptions(options);

      expect(options.idToExternalAndNameMapping).toEqual({
        module1: ['default', 'react', 'react-external'],
        module2: ['custom', 'lodash', 'lodash-external'],
      });
    });
  });
});
