import { flushChunks, usedChunks } from '../utils/flush-chunks';

const remoteEntry =
  'https://cdn.example.com/_next/static/ssr/remoteEntry.js?token=test';

const setKnownRemote = (
  remoteInfo: Record<string, string> = {},
  configuredEntry = remoteEntry,
) => {
  (globalThis as any).__FEDERATION__ = {
    __INSTANCES__: [
      {
        moduleCache: new Map([
          [
            'shop',
            {
              remoteInfo: {
                name: 'shop',
                entry: remoteEntry,
                ...remoteInfo,
              },
            },
          ],
        ]),
        options: {
          remotes: [
            {
              name: 'shop',
              alias: remoteInfo.alias,
              entry: configuredEntry,
            },
          ],
        },
      },
    ],
  };
};

const jsonResponse = (body: unknown) => ({
  ok: true,
  status: 200,
  json: jest.fn().mockResolvedValue(body),
});

describe('flushChunks', () => {
  beforeEach(() => {
    usedChunks.clear();
    setKnownRemote();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads manifest assets once per remote', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        metaData: { publicPath: 'auto' },
        exposes: [
          {
            name: 'Button',
            path: './Button',
            assets: {
              js: {
                sync: ['static/chunks/shared.js', 'static/chunks/button.js'],
                async: ['static/chunks/lazy.js'],
              },
              css: {
                sync: ['static/css/button.css'],
                async: ['static/css/lazy.css'],
              },
            },
          },
          {
            name: 'Card',
            path: './Card',
            assets: {
              js: {
                sync: ['static/chunks/shared.js', 'static/chunks/card.js'],
                async: [],
              },
              css: { sync: [], async: [] },
            },
          },
        ],
      }),
    );
    usedChunks.add('shop/Button');
    usedChunks.add('shop/Card');

    await expect(flushChunks()).resolves.toEqual([
      'https://cdn.example.com/_next/static/chunks/shared.js',
      'https://cdn.example.com/_next/static/chunks/button.js',
      'https://cdn.example.com/_next/static/css/button.css',
      'https://cdn.example.com/_next/static/chunks/card.js',
    ]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://cdn.example.com/_next/static/chunks/mf-manifest.json?token=test',
    );
    expect(usedChunks.size).toBe(0);
  });

  it('honors an absolute manifest public path', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        metaData: { publicPath: 'https://assets.example.com/app/' },
        exposes: [
          {
            name: 'Button',
            path: './Button',
            assets: {
              js: { sync: ['button.js'], async: [] },
              css: { sync: [], async: [] },
            },
          },
        ],
      }),
    );
    usedChunks.add('shop->Button');

    await expect(flushChunks()).resolves.toEqual([
      'https://assets.example.com/app/button.js',
    ]);
  });

  it('uses the server public path during SSR', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        metaData: {
          publicPath: 'auto',
          ssrPublicPath: 'https://server.example.com',
        },
        exposes: [
          {
            name: 'Button',
            path: './Button',
            assets: {
              js: { sync: ['button.js'], async: [] },
              css: { sync: [], async: [] },
            },
          },
        ],
      }),
    );
    usedChunks.add('shop/Button');

    await expect(flushChunks()).resolves.toEqual([
      'https://server.example.com/button.js',
    ]);
  });

  it('uses the configured manifest URL retained by the runtime', async () => {
    const manifestUrl =
      'https://cdn.example.com/custom/remote-metadata.json?token=test';
    setKnownRemote({}, manifestUrl);
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        metaData: {
          getPublicPath: "function () { return 'https://assets.example.com'; }",
        },
        exposes: [
          {
            name: 'Button',
            path: './Button',
            assets: {
              js: { sync: ['button.js'], async: [] },
              css: { sync: [], async: [] },
            },
          },
        ],
      }),
    );
    usedChunks.add('shop/Button');

    await expect(flushChunks()).resolves.toEqual([
      'https://assets.example.com/button.js',
    ]);
    expect(global.fetch).toHaveBeenCalledWith(manifestUrl);
  });

  it('groups canonical and nested alias requests for the same remote', async () => {
    setKnownRemote({ alias: 'store/catalog' });
    (global.fetch as jest.Mock).mockResolvedValue(
      jsonResponse({
        metaData: { publicPath: 'auto' },
        exposes: [
          {
            name: 'Button',
            path: './Button',
            assets: {
              js: { sync: ['static/chunks/button.js'], async: [] },
              css: { sync: [], async: [] },
            },
          },
          {
            name: 'Card',
            path: './Card',
            assets: {
              js: { sync: ['static/chunks/card.js'], async: [] },
              css: { sync: [], async: [] },
            },
          },
        ],
      }),
    );
    usedChunks.add('store/catalog/Button');
    usedChunks.add('shop/Card');

    await expect(flushChunks()).resolves.toEqual([
      'https://cdn.example.com/_next/static/chunks/button.js',
      'https://cdn.example.com/_next/static/chunks/card.js',
    ]);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('uses legacy stats for requests missing from the manifest', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        jsonResponse({
          metaData: { publicPath: 'auto' },
          exposes: [
            {
              name: 'Button',
              path: './Button',
              assets: {
                js: { sync: ['static/chunks/button.js'], async: [] },
                css: { sync: [], async: [] },
              },
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          federatedModules: [
            {
              exposes: {
                './Card': ['static/chunks/card.js'],
              },
            },
          ],
        }),
      );
    usedChunks.add('shop/Button');
    usedChunks.add('shop/Card');

    await expect(flushChunks()).resolves.toEqual([
      'https://cdn.example.com/_next/static/chunks/button.js',
      'https://cdn.example.com/_next/static/chunks/card.js',
    ]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('uses legacy stats when a manifest expose has no analyzed assets', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(
        jsonResponse({
          metaData: { publicPath: 'auto' },
          exposes: [
            {
              name: 'Button',
              path: './Button',
              assets: {
                js: { sync: [], async: [] },
                css: { sync: [], async: [] },
              },
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          federatedModules: [
            {
              exposes: {
                './Button': ['static/chunks/button.js'],
              },
            },
          ],
        }),
      );
    usedChunks.add('shop/Button');

    await expect(flushChunks()).resolves.toEqual([
      'https://cdn.example.com/_next/static/chunks/button.js',
    ]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('falls back to federated stats for older remotes', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce(
        jsonResponse({
          federatedModules: [
            {
              exposes: {
                './Button': ['static/chunks/button.js'],
              },
            },
          ],
        }),
      );
    usedChunks.add('shop/Button');

    await expect(flushChunks()).resolves.toEqual([
      'https://cdn.example.com/_next/static/chunks/button.js',
    ]);
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://cdn.example.com/_next/static/chunks/federated-stats.json?token=test',
    );
  });

  it('reports unknown remotes without fetching metadata', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation();
    usedChunks.add('missing/Button');

    await expect(flushChunks()).resolves.toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      'flush chunks: Remote missing is not defined in the global config',
    );
  });
});
