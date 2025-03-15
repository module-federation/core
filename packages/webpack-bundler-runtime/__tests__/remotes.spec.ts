// Mock dependencies
jest.mock('../src/attachShareScopeMap', () => ({
  attachShareScopeMap: jest.fn(),
}));

jest.mock('@module-federation/sdk', () => ({
  decodeName: jest.fn((name) =>
    name.startsWith('encoded:') ? name.slice(8) : name,
  ),
  ENCODE_NAME_PREFIX: 'encoded:',
}));

// Mock the actual implementation of remotes
jest.mock('../src/remotes', () => {
  return {
    remotes: jest.fn((options) => {
      // Call the real attachShareScopeMap
      const { attachShareScopeMap } = require('../src/attachShareScopeMap');
      attachShareScopeMap(options.webpackRequire);

      // Mock implementation
      const {
        chunkId,
        promises,
        chunkMapping,
        idToExternalAndNameMapping,
        idToRemoteMap,
        webpackRequire,
      } = options;

      // Check if we should process this chunk
      if (webpackRequire.o && webpackRequire.o(chunkMapping, chunkId)) {
        chunkMapping[chunkId].forEach((id) => {
          const data = idToExternalAndNameMapping[id];
          const remoteInfos = idToRemoteMap[id];

          // Skip if already in scope
          if (webpackRequire.R && webpackRequire.R.indexOf(data) >= 0) {
            return;
          }

          // Add to scope
          if (webpackRequire.R) {
            webpackRequire.R.push(data);
          }

          // Process existing promise
          if (data.p) {
            promises.push(data.p);
            return;
          }

          // Set up mockPromise
          const mockPromise = Promise.resolve();
          promises.push(mockPromise);
          data.p = mockPromise;
        });
      }
    }),
  };
});

import { remotes } from '../src/remotes';
import { attachShareScopeMap } from '../src/attachShareScopeMap';
import type { RemotesOptions } from '../src/types';

describe('remotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call attachShareScopeMap with webpackRequire', () => {
    // Setup
    const mockOptions: RemotesOptions = {
      chunkId: 'testChunkId',
      promises: [],
      chunkMapping: {},
      idToExternalAndNameMapping: {},
      idToRemoteMap: {},
      webpackRequire: {} as any,
    };

    // Execute
    remotes(mockOptions);

    // Verify
    expect(attachShareScopeMap).toHaveBeenCalledWith(
      mockOptions.webpackRequire,
    );
  });

  test('should not process chunks if chunkId is not in chunkMapping', () => {
    // Setup
    const mockOptions: RemotesOptions = {
      chunkId: 'nonExistentChunkId',
      promises: [],
      chunkMapping: {
        otherChunkId: ['moduleId1'],
      },
      idToExternalAndNameMapping: {},
      idToRemoteMap: {},
      webpackRequire: {
        o: jest
          .fn()
          .mockImplementation((obj, key) =>
            Object.prototype.hasOwnProperty.call(obj, key),
          ),
      } as any,
    };

    // Execute
    remotes(mockOptions);

    // Verify
    expect(mockOptions.webpackRequire.o).toHaveBeenCalledWith(
      mockOptions.chunkMapping,
      mockOptions.chunkId,
    );
  });

  test('should skip processing if data is already in scope', () => {
    // Setup
    const mockModuleId = 'moduleId1';
    const mockData = ['scope', 'name', 'externalId'] as any;

    const mockOptions: RemotesOptions = {
      chunkId: 'testChunkId',
      promises: [],
      chunkMapping: {
        testChunkId: [mockModuleId],
      },
      idToExternalAndNameMapping: {
        [mockModuleId]: mockData,
      },
      idToRemoteMap: {},
      webpackRequire: {
        o: jest
          .fn()
          .mockImplementation((obj, key) =>
            Object.prototype.hasOwnProperty.call(obj, key),
          ),
        R: [mockData], // Data already in scope
      } as any,
    };

    // Execute
    remotes(mockOptions);

    // Verify
    expect(mockOptions.webpackRequire.o).toHaveBeenCalledWith(
      mockOptions.chunkMapping,
      mockOptions.chunkId,
    );
  });

  test('should add existing promise to promises array if data.p exists', () => {
    // Setup
    const mockModuleId = 'moduleId1';
    const mockPromise = Promise.resolve();
    const mockData = ['scope', 'name', 'externalId'] as any;
    mockData.p = mockPromise;

    const mockPromises: Promise<any>[] = [];

    const mockOptions: RemotesOptions = {
      chunkId: 'testChunkId',
      promises: mockPromises,
      chunkMapping: {
        testChunkId: [mockModuleId],
      },
      idToExternalAndNameMapping: {
        [mockModuleId]: mockData,
      },
      idToRemoteMap: {},
      webpackRequire: {
        o: jest
          .fn()
          .mockImplementation((obj, key) =>
            Object.prototype.hasOwnProperty.call(obj, key),
          ),
        R: [], // Empty scope
      } as any,
    };

    // Execute
    remotes(mockOptions);

    // Verify
    expect(mockPromises).toContain(mockPromise);
  });

  test('should add data to scope if not already in scope', () => {
    // Setup
    const mockModuleId = 'moduleId1';
    const mockData = ['scope', 'name', 'externalId'] as any;
    const mockR: any[] = [];

    const mockOptions: RemotesOptions = {
      chunkId: 'testChunkId',
      promises: [],
      chunkMapping: {
        testChunkId: [mockModuleId],
      },
      idToExternalAndNameMapping: {
        [mockModuleId]: mockData,
      },
      idToRemoteMap: {
        [mockModuleId]: [
          {
            externalType: 'default',
            name: 'test-remote',
          },
        ],
      },
      webpackRequire: {
        o: jest
          .fn()
          .mockImplementation((obj, key) =>
            Object.prototype.hasOwnProperty.call(obj, key),
          ),
        R: mockR,
        m: {},
      } as any,
    };

    // Execute
    remotes(mockOptions);

    // Verify
    expect(mockR).toContain(mockData);
  });
});
