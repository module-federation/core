import { describe, it, expect, beforeEach, vi } from 'vitest';
import { consumeTypes } from './consumeTypes';
import { getDTSManagerConstructor } from './utils';
import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';

// Mock the utils module
vi.mock('./utils');

describe('consumeTypes', () => {
  const mockConsumeTypes = vi.fn().mockResolvedValue(undefined);

  // Mock implementation of DTSManager
  class MockDTSManager {
    constructor(public options: DTSManagerOptions) {}
    async consumeTypes() {
      return mockConsumeTypes();
    }
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsumeTypes.mockClear();
    (getDTSManagerConstructor as any).mockReturnValue(MockDTSManager);
  });

  it('should create DTSManager with provided options', async () => {
    const options: DTSManagerOptions = {
      host: {
        implementation: 'test-implementation',
        moduleFederationConfig: {
          name: 'test-host',
          remotes: {},
        },
      },
    };

    await consumeTypes(options);

    expect(getDTSManagerConstructor).toHaveBeenCalledWith(
      'test-implementation',
    );
    expect(mockConsumeTypes).toHaveBeenCalled();
  });

  it('should work with minimal options', async () => {
    const options: DTSManagerOptions = {};

    await consumeTypes(options);

    expect(getDTSManagerConstructor).toHaveBeenCalledWith(undefined);
    expect(mockConsumeTypes).toHaveBeenCalled();
  });

  it('should propagate errors from consumeTypes', async () => {
    const error = new Error('Test error');
    const options: DTSManagerOptions = {};

    mockConsumeTypes.mockRejectedValueOnce(error);

    await expect(consumeTypes(options)).rejects.toThrow(error);
  });
});
