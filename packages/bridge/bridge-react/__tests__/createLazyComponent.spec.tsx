import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import {
  createLazyComponent,
  collectSSRAssets,
} from '../src/lazy/createLazyComponent';
import * as runtime from '@module-federation/runtime';
import * as utils from '../src/lazy/utils';

// Mocking dependencies
jest.mock('@module-federation/runtime');
jest.mock('../src/lazy/utils');

const mockGetInstance = runtime.getInstance as jest.Mock;
const mockGetLoadedRemoteInfos = utils.getLoadedRemoteInfos as jest.Mock;
const mockGetDataFetchMapKey = utils.getDataFetchMapKey as jest.Mock;
const mockFetchData = utils.fetchData as jest.Mock;

const MockComponent = () => <div>Mock Component</div>;
const LoadingComponent = () => <div>Loading...</div>;
const ErrorComponent = () => <div>Error!</div>;

const renderAssetsToFragment = (assets: React.ReactNode[]) => {
  const template = document.createElement('template');
  template.innerHTML = renderToString(<>{assets}</>);
  return template.content;
};

const getStylesheetHrefs = (root: ParentNode) =>
  Array.from(
    root.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  ).map((link) => link.href);

const getScriptSrcs = (root: ParentNode) =>
  Array.from(root.querySelectorAll<HTMLScriptElement>('script[src]')).map(
    (script) => script.src,
  );

describe('createLazyComponent', () => {
  let mockInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockInstance = {
      name: 'host-app',
      options: { version: '1.0.0' },
      getModuleInfo: jest.fn(),
    };
    mockGetInstance.mockReturnValue(mockInstance);
    mockGetLoadedRemoteInfos.mockReturnValue({
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
    mockGetDataFetchMapKey.mockReturnValue('data-fetch-key');
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
    mockFetchData.mockRejectedValue(new Error('Data fetch failed'));
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
    mockFetchData.mockResolvedValue(mockData);

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

  it('should suppress automatic SSR stylesheets owned by document head', async () => {
    const previousFederationSSR = globalThis.FEDERATION_SSR;
    let unmount: (() => void) | undefined;
    globalThis.FEDERATION_SSR = true;
    document.head.innerHTML =
      '<link rel="stylesheet" href="http://localhost:3001/main.css">';
    mockFetchData.mockResolvedValue(undefined);
    mockGetLoadedRemoteInfos.mockReturnValue({
      name: 'remoteApp',
      alias: 'remote',
      expose: './Component',
      version: '1.0.0',
      snapshot: {
        modules: [
          {
            modulePath: './Component',
            assets: {
              css: { sync: ['main.css'], async: [] },
              js: { sync: [], async: [] },
            },
          },
        ],
        publicPath: 'http://localhost:3001/',
        remoteEntry: 'remoteEntry.js',
      },
      entryGlobalName: 'remoteApp',
    });

    const LazyComponent = createLazyComponent({
      loader: jest.fn().mockResolvedValue({
        default: MockComponent,
        [Symbol.for('mf_module_id')]: 'remoteApp/Component',
      }),
      instance: mockInstance,
      loading: <LoadingComponent />,
      fallback: <ErrorComponent />,
      injectLink: true,
    });

    try {
      const rendered = render(<LazyComponent />);
      const { container } = rendered;
      unmount = rendered.unmount;

      await waitFor(() => {
        expect(screen.getByText('Mock Component')).toBeInTheDocument();
        expect(getStylesheetHrefs(container)).toEqual([]);
      });
      expect(getStylesheetHrefs(document.head)).toEqual([
        'http://localhost:3001/main.css',
      ]);
    } finally {
      unmount?.();
      globalThis.FEDERATION_SSR = previousFederationSSR;
      document.head.innerHTML = '';
    }
  });
});

describe('collectSSRAssets', () => {
  let mockInstance: any;

  const mockRemoteAssets = ({
    css,
    js = { sync: [], async: [] },
  }: {
    css: { sync: string[]; async: string[] };
    js?: { sync: string[]; async: string[] };
  }) => {
    mockGetLoadedRemoteInfos.mockReturnValue({
      name: 'remoteApp',
      expose: './Component',
      snapshot: {
        publicPath: 'http://localhost:3001/',
        remoteEntry: 'remoteEntry.js',
        modules: [
          {
            modulePath: './Component',
            assets: { css, js },
          },
        ],
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    mockInstance = {
      name: 'host-app',
      options: { version: '1.0.0' },
    };
    mockGetInstance.mockReturnValue(mockInstance);
  });

  it('should return an empty array if instance is not available', () => {
    const assets = collectSSRAssets({
      id: 'test/expose',
      instance: undefined as any,
    });
    expect(assets).toEqual([]);
  });

  it('should return an empty array if module info is not found', () => {
    mockGetLoadedRemoteInfos.mockReturnValue(undefined);
    const assets = collectSSRAssets({
      id: 'test/expose',
      instance: mockInstance,
    });
    expect(assets).toEqual([]);
  });

  it('should collect CSS and JS assets for SSR', () => {
    mockRemoteAssets({
      css: {
        sync: ['main.css'],
        async: ['extra.css', 'main.css'],
      },
      js: { sync: ['main.js'], async: [] },
    });

    const assets = collectSSRAssets({
      id: 'remoteApp/Component',
      instance: mockInstance,
      injectScript: true,
      injectLink: true,
    });

    expect(assets).toHaveLength(4); // 2 links, 2 scripts

    const links = assets.filter(
      (asset): asset is React.ReactElement =>
        React.isValidElement(asset) && asset.type === 'link',
    );
    const scripts = assets.filter(
      (asset): asset is React.ReactElement =>
        React.isValidElement(asset) && asset.type === 'script',
    );

    expect(links).toHaveLength(2);
    expect(links.map((link) => link.props.href)).toEqual([
      'http://localhost:3001/extra.css',
      'http://localhost:3001/main.css',
    ]);
    expect(scripts).toHaveLength(2);
    expect(scripts.map((script) => script.props.src)).toEqual([
      'http://localhost:3001/remoteEntry.js',
      'http://localhost:3001/main.js',
    ]);

    const fragment = renderAssetsToFragment(assets);

    expect(getStylesheetHrefs(fragment)).toEqual([
      'http://localhost:3001/extra.css',
      'http://localhost:3001/main.css',
    ]);
    expect(getScriptSrcs(fragment)).toEqual([
      'http://localhost:3001/remoteEntry.js',
      'http://localhost:3001/main.js',
    ]);
  });

  it('should preserve stylesheet nodes when inserting an earlier asset', () => {
    mockRemoteAssets({
      css: { sync: ['main.css'], async: [] },
    });

    const options = {
      id: 'remoteApp/Component',
      instance: mockInstance,
      injectLink: true,
    };
    const { container, rerender } = render(<>{collectSSRAssets(options)}</>);
    const originalMainLink = container.querySelector(
      'link[href="http://localhost:3001/main.css"]',
    );

    mockRemoteAssets({
      css: { sync: ['main.css'], async: ['extra.css'] },
    });
    rerender(<>{collectSSRAssets(options)}</>);

    expect(getStylesheetHrefs(container)).toEqual([
      'http://localhost:3001/extra.css',
      'http://localhost:3001/main.css',
    ]);
    expect(
      container.querySelector('link[href="http://localhost:3001/main.css"]'),
    ).toBe(originalMainLink);
  });
});
