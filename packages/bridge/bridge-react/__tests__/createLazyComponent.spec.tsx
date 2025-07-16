// Mocking dependencies
jest.mock('@module-federation/runtime', () => ({
  getInstance: jest.fn(),
}));
jest.mock('../src/lazy/utils', () => ({
  getLoadedRemoteInfos: jest.fn(),
  getDataFetchMapKey: jest.fn(),
  fetchData: jest.fn(),
}));

import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  createLazyComponent,
  collectSSRAssets,
} from '../src/lazy/createLazyComponent';
import * as runtime from '@module-federation/runtime';
import * as utils from '../src/lazy/utils';

const MockComponent = () => <div>Mock Component</div>;
const LoadingComponent = () => <div>Loading...</div>;
const ErrorComponent = () => <div>Error!</div>;

describe('createLazyComponent', () => {
  let mockInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInstance = {
      name: 'host-app',
      options: { version: '1.0.0' },
      getModuleInfo: jest.fn(),
    };
    (runtime.getInstance as any).mockReturnValue(mockInstance);
    (utils.getLoadedRemoteInfos as any).mockReturnValue({
      name: 'remoteApp',
      alias: 'remote',
      expose: './Component',
      version: '1.0.0',
      snapshot: {
        modules: [
          {
            modulePath: './Component',
            assets: {
              css: { sync: [], async: [] },
              js: { sync: [], async: [] },
            },
          },
        ],
        publicPath: 'http://localhost:3001/',
        remoteEntry: 'remoteEntry.js',
      },
      entryGlobalName: 'remoteApp',
    });
    (utils.getDataFetchMapKey as any).mockReturnValue('data-fetch-key');
  });

  it('should render loading component then the actual component', async () => {
    const loader = jest.fn().mockResolvedValue({
      default: MockComponent,
      [Symbol.for('mf_module_id')]: 'remoteApp/Component',
    });

    const LazyComponent = createLazyComponent({
      loader,
      instance: mockInstance,
      loading: <LoadingComponent />,
      fallback: <ErrorComponent />,
    });

    render(
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent />
      </Suspense>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Mock Component')).toBeInTheDocument();
    });
  });

  it('should render fallback component on data fetch error', async () => {
    (utils.fetchData as any).mockRejectedValue(new Error('Data fetch failed'));
    const LazyComponentWithDataFetch = createLazyComponent({
      loader: jest.fn().mockResolvedValue({
        default: MockComponent,
        [Symbol.for('mf_module_id')]: 'remoteApp/Component',
      }),
      instance: mockInstance,
      loading: <LoadingComponent />,
      fallback: <ErrorComponent />,
    });

    render(<LazyComponentWithDataFetch />);

    await waitFor(() => {
      expect(screen.getByText('Error!')).toBeInTheDocument();
    });
  });

  it('should fetch data and pass it to the component', async () => {
    const loader = jest.fn().mockResolvedValue({
      default: (props: { mfData: any }) => (
        <div>Data: {JSON.stringify(props.mfData)}</div>
      ),
      [Symbol.for('mf_module_id')]: 'remoteApp/Component',
    });
    const mockData = { message: 'Hello' };
    (utils.fetchData as any).mockResolvedValue(mockData);

    const LazyComponent = createLazyComponent({
      loader,
      instance: mockInstance,
      loading: <LoadingComponent />,
      fallback: <ErrorComponent />,
    });

    render(<LazyComponent />);

    await waitFor(() => {
      expect(
        screen.getByText(`Data: ${JSON.stringify(mockData)}`),
      ).toBeInTheDocument();
    });
  });
});

describe('collectSSRAssets', () => {
  let mockInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInstance = {
      name: 'host-app',
      options: { version: '1.0.0' },
    };
    (runtime.getInstance as any).mockReturnValue(mockInstance);
  });

  it('should return an empty array if instance is not available', () => {
    const assets = collectSSRAssets({
      id: 'test/expose',
      instance: undefined as any,
    });
    expect(assets).toEqual([]);
  });

  it('should return an empty array if module info is not found', () => {
    (utils.getLoadedRemoteInfos as any).mockReturnValue(undefined);
    const assets = collectSSRAssets({
      id: 'test/expose',
      instance: mockInstance,
    });
    expect(assets).toEqual([]);
  });

  it('should collect CSS and JS assets for SSR', () => {
    (utils.getLoadedRemoteInfos as any).mockReturnValue({
      name: 'remoteApp',
      expose: './Component',
      snapshot: {
        publicPath: 'http://localhost:3001/',
        remoteEntry: 'remoteEntry.js',
        modules: [
          {
            modulePath: './Component',
            assets: {
              css: { sync: ['main.css'], async: ['extra.css'] },
              js: { sync: ['main.js'], async: [] },
            },
          },
        ],
      },
    });

    const assets = collectSSRAssets({
      id: 'remoteApp/Component',
      instance: mockInstance,
      injectScript: true,
      injectLink: true,
    });

    expect(assets).toHaveLength(4); // 2 links, 2 scripts

    const links = assets.filter(
      (asset) => (asset as React.ReactElement).type === 'link',
    );
    const scripts = assets.filter(
      (asset) => (asset as React.ReactElement).type === 'script',
    );

    expect(links).toHaveLength(2);
    expect((links[0] as React.ReactElement).props.href).toBe(
      'http://localhost:3001/extra.css',
    );
    expect((links[1] as React.ReactElement).props.href).toBe(
      'http://localhost:3001/main.css',
    );

    expect(scripts).toHaveLength(2);
    expect((scripts[0] as React.ReactElement).props.src).toBe(
      'http://localhost:3001/remoteEntry.js',
    );
    expect((scripts[1] as React.ReactElement).props.src).toBe(
      'http://localhost:3001/main.js',
    );
  });
});
