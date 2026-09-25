import { generateLoadScript } from '../plugins/webpackChunkUtilities';

const runtimeTemplate = {
  basicFunction: (args: string, body: string[]) =>
    `function(${args}) {\n${body.join('\n')}\n}`,
};

const runEmittedLoader = (federation: Record<string, unknown>) => {
  const webpackRequire: any = { federation };
  new Function('__webpack_require__', generateLoadScript(runtimeTemplate))(
    webpackRequire,
  );
  return new Promise((resolve) =>
    webpackRequire.l(
      'http://localhost:3001/remoteEntry.js',
      resolve,
      '__webpack_require__.federation.instance.moduleCache.get("remote")',
    ),
  );
};

const initRawContainer = (_name: string, _url: string, res: unknown) => ({
  wrapped: res,
});

describe('generateLoadScript', () => {
  it('loads through the instance platform', async () => {
    const container = { get: jest.fn() };
    const calls: unknown[][] = [];

    const result = await runEmittedLoader({
      instance: {
        platform: {
          loadScriptNode: async (...args: unknown[]) => {
            calls.push(args);
            return container;
          },
        },
        initRawContainer,
      },
    });

    expect(calls).toEqual([
      ['http://localhost:3001/remoteEntry.js', { attrs: {} }],
    ]);
    expect(result).toEqual({ wrapped: container });
  });

  it('fails the load when the instance platform has no Node loader', async () => {
    const legacyLoader = jest.fn();

    const result = await runEmittedLoader({
      runtime: { loadScriptNode: legacyLoader },
      instance: { platform: { isBrowser: () => true }, initRawContainer },
    });

    expect(legacyLoader).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        message: expect.stringMatching(/needs a node or universal platform/),
      }),
    );
  });
});
