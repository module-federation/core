import { flushChunks, getUsedChunks, loadHostStats, createShareMap, processChunk } from './flush-chunks';
import fetchMock from 'fetch-mock';
import { jest } from '@jest/globals';

// Mocks
const globalScope = global || window || self;
globalScope.__non_webpack_require__ = jest.fn();
globalScope.__webpack_share_scopes__ = globalScope.__webpack_share_scopes__ || {};
globalScope.__remote_scope__ = { _config: {} };

describe('Chunk Functions', () => {

  beforeEach(() => {
    fetchMock.reset();
    getUsedChunks().clear();
  });

  it('should load host stats', () => {
    const dummyData = { some: 'data' };
    globalScope.__non_webpack_require__.mockReturnValue(dummyData);
    const hostStats = loadHostStats();
    expect(hostStats).toEqual(dummyData);
  });

  it('should create a shareMap', () => {
    const mockData = { 
      react: { 
        "18.2.0": { 
          from: 'checkout', 
          eager: false, 
          loaded: 1,
          get: function() {} 
        } 
      } 
    };
    Object.assign(globalScope.__webpack_share_scopes__, mockData);
    const shareMap = createShareMap();
    expect(shareMap).toEqual({ react: ['checkout'] });
  });

  it('should process a single chunk', async () => {
    const mockChunk = 'remote1->request1';
    const mockShareMap = { module1: ['source1'] };
    const mockHostStats = { some: 'data' };

    globalScope.__remote_scope__._config = {
      remote1: 'http://example.com/remote1'
    };

    fetchMock.mock('http://example.com/chunks/federated-stats.json', {
      federatedModules: [{
        exposes: {
          request1: [
            { files: ['file1', 'file2'] }
          ]
        }
      }]
    });

    const processed = await processChunk(mockChunk, mockShareMap, mockHostStats);
    expect(processed).toEqual(expect.arrayContaining(['http://example.com/file1', 'http://example.com/file2']));
  });

  it('should flush chunks', async () => {
    getUsedChunks().add('remote1->request1');
    getUsedChunks().add('remote2->request2');

    const mockLoadHostStats = jest.fn().mockReturnValue({});
    const mockCreateShareMap = jest.fn().mockReturnValue({});
    const mockProcessChunk = jest.fn().mockReturnValue(Promise.resolve(['chunk1', 'chunk2']));

    jest.mock('./flush-chunks', () => ({
      loadHostStats: mockLoadHostStats,
      createShareMap: mockCreateShareMap,
      processChunk: mockProcessChunk,
      getUsedChunks,
      flushChunks: jest.requireActual('./flush-chunks').flushChunks
    }));

    const flushed = await flushChunks();
    expect(flushed).toEqual(['chunk1', 'chunk2']);
  });
});



