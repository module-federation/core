import { FederationHost, init } from '@module-federation/runtime';
import { renderHook, act } from '@testing-library/react-hooks';
import * as ModuleFederationSDK from '@module-federation/sdk';
import { usePrefetch } from '../src/react';
import { MFDataPrefetch } from '../src/prefetch';

const mockLoadScript = jest.spyOn(ModuleFederationSDK, 'loadScript');
mockLoadScript.mockImplementation(() => Promise.resolve());

describe('usePrefetch', () => {
  // Mock prefetch function
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      redirected: false,
      type: 'basic',
      url: '',
      clone: jest.fn(),
      headers: new Headers(),
      body: null,
      bodyUsed: false,
      text: () => Promise.resolve(JSON.stringify({ data: 'testData' })),
      json: () => Promise.resolve({ data: 'testData' }),
      formData: () => Promise.resolve(new FormData()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
    }),
  );

  let prefetch: MFDataPrefetch;

  const options = {
    // Options that will be passed to the `MFDataPrefetch` constructor
    name: '@mf/test',
    remoteSnapshot: {
      buildVersion: '1.0.0',
      globalName: 'TestGlobalName',
    },
  };
  const testData = 'testData';
  const newTestData = 'newTestData';
  const functionId = 'testPrefetch';
  const executePrefetch = jest.fn((params: string) =>
    Promise.resolve(params ? params : testData),
  );

  new FederationHost({
    name: options.name,
    remotes: [],
  });
  init({
    name: options.name,
    remotes: [],
  });
  beforeEach(() => {
    globalThis.__FEDERATION__.__PREFETCH__ = {
      entryLoading: {},
      instance: new Map(),
      __PREFETCH_EXPORTS__: {},
    };
    // @ts-ignore
    prefetch = new MFDataPrefetch(options); // Create a new instance of `MFDataPrefetch` class before each test

    const exposeExport = {
      [functionId]: executePrefetch,
    };
    const exposeId = `${options.name}/button/${ModuleFederationSDK.MFPrefetchCommon.identifier}`;
    const projectExport = {
      [ModuleFederationSDK.encodeName(exposeId)]: exposeExport,
    };
    globalThis.__FEDERATION__.__PREFETCH__.__PREFETCH_EXPORTS__[options.name] =
      () => Promise.resolve(projectExport);
  });

  afterEach(() => {
    executePrefetch.mockClear();
    mockLoadScript.mockRestore();
  });

  afterAll(() => {
    // @ts-ignore
    delete globalThis.__FEDERATION__;
  });

  it('should prefetch data on first mount', async () => {
    const { result } = renderHook(() =>
      usePrefetch({ id: `${options.name}/button`, functionId }),
    );
    await result.current[0];
    expect(executePrefetch).toHaveBeenCalled();
    // Verify the prefechState
    expect(result.current[0]).resolves.toEqual(testData);
  });

  it('should refetch data when refreshExecutor is called', async () => {
    const { result } = renderHook(() =>
      usePrefetch({ id: `${options.name}/button`, functionId }),
    );

    await result.current[0];
    expect(executePrefetch).toHaveBeenCalled();
    executePrefetch.mockClear();
    const { result: newCallResult } = renderHook(() =>
      usePrefetch({ id: `${options.name}/button`, functionId }),
    );
    await newCallResult.current[0];
    expect(executePrefetch).not.toHaveBeenCalled();
    // Call refreshExecutor
    act(() => {
      result.current[1](newTestData);
    });

    expect(executePrefetch).toHaveBeenCalled();
    // // Verify the prefetchState after refetch
    expect(result.current[0]).resolves.toEqual(newTestData);
  });
});
