// Import the necessary modules and functions
import { MFDataPrefetch } from '../src/prefetch';
import {
  loadScript,
  MFPrefetchCommon,
  encodeName,
} from '@module-federation/sdk';

// Mock loadScript function from SDK
jest.mock('@module-federation/sdk', () => {
  const originalModule = jest.requireActual('@module-federation/sdk');
  return {
    ...originalModule,
    loadScript: jest.fn(() => Promise.resolve()),
  };
});

describe('MF Data Prefetch', () => {
  let prefetch: MFDataPrefetch;

  const options = {
    name: '@mf/test',
    remoteSnapshot: {
      buildVersion: '1.0.0',
      globalName: 'TestGlobalName',
    },
  };
  const exposeId = `${options.name}/button/${MFPrefetchCommon.identifier}`;

  beforeEach(() => {
    globalThis.__FEDERATION__.__PREFETCH__ = {
      entryLoading: {},
      instance: new Map(),
      __PREFETCH_EXPORTS__: {},
    };
    // @ts-ignore
    prefetch = new MFDataPrefetch(options);
  });
  afterAll(() => {
    // @ts-ignore
    delete globalThis.__FEDERATION__;
  });

  // Instance gets added to global memory on creation
  it('adds itself to global instances on creation', () => {
    expect(prefetch.global.instance.get(options.name)).toBe(prefetch);
  });

  // Loads entry script using loadScript from sdk
  it('loads entry script using loadScript from sdk', async () => {
    const url = 'testUrl'; // Url of the script to be loaded

    await prefetch.loadEntry(url); // Call `loadEntry` function

    // Expect that the loadScript function is called with the correct url
    expect(loadScript).toHaveBeenCalledWith(url, expect.any(Object));
  });

  // Retrieves project exports
  it('gets project exports', async () => {
    const exposeExport = {
      nyPrefetch: () => {},
    };
    const projectExport = {
      [encodeName(exposeId)]: exposeExport,
    };
    globalThis.__FEDERATION__.__PREFETCH__.__PREFETCH_EXPORTS__[options.name] =
      () => Promise.resolve(projectExport);

    await prefetch.getProjectExports();
    expect(prefetch.getExposeExports(`${options.name}/button`)).toEqual(
      exposeExport,
    );
  });

  // Prefetching with memory and executing prefetch function
  it('executes prefetch using prefetch function with and without memory', async () => {
    const id = options.name;
    const functionId = 'nyPrefetch';
    const refetchParams = 'testParams';
    const prefetchOptions = { id: `${id}/button`, functionId, refetchParams };

    // Creating a mock prefetch function
    const executePrefetch = jest.fn(() => 'Expected Result');
    const prefetchExports = { [functionId]: executePrefetch };

    // Mock Project Exports
    globalThis.__FEDERATION__.__PREFETCH__.__PREFETCH_EXPORTS__[id] = () =>
      Promise.resolve({
        [encodeName(exposeId)]: prefetchExports,
      });

    await prefetch.getProjectExports();
    // Call the prefetch function first time
    let result = await prefetch.prefetch(prefetchOptions);

    // Verify that executePrefetch function is correctly executed
    expect(executePrefetch).toHaveBeenCalled();

    // Clear mock function calls data
    executePrefetch.mockClear();

    // Call the prefetch function again
    result = await prefetch.prefetch(prefetchOptions);

    // Verify that executePrefetch function is NOT called this time (since the result should come from memory)
    expect(executePrefetch).not.toHaveBeenCalled();

    // Clear mock function calls data
    executePrefetch.mockClear();

    prefetch.markOutdate(prefetchOptions, true);

    // Call the prefetch function first time
    result = await prefetch.prefetch(prefetchOptions);

    // Verify that executePrefetch function is correctly executed
    expect(executePrefetch).toHaveBeenCalled();
  });

  // Checking outdate marking
  it('checks outdate marking', () => {
    const markOptions = { id: 'testId', functionId: 'testFunction' };

    // Mark the function as outdated
    prefetch.markOutdate(markOptions, true);

    // Verify that the function is marked as outdated
    let isOutdated = prefetch.checkOutdate(markOptions);
    expect(isOutdated).toBe(true);

    // Mark the function as up-to-date
    prefetch.markOutdate(markOptions, false);

    // Verify that the function is marked as up-to-date
    isOutdated = prefetch.checkOutdate(markOptions);
    expect(isOutdated).toBe(false);
  });
});
