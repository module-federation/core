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
  it('loads through the instance platform when it has loadScriptNode', async () => {
    const container = { get: jest.fn() };
    const calls: unknown[][] = [];
    const legacyLoader = jest.fn();

    const result = await runEmittedLoader({
      runtime: { loadScriptNode: legacyLoader },
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
    expect(legacyLoader).not.toHaveBeenCalled();
    expect(result).toEqual({ wrapped: container });
  });

  it('falls back to federation.runtime.loadScriptNode without a platform loader', async () => {
    const container = { get: jest.fn() };
    const legacyLoader = jest.fn().mockResolvedValue(container);

    const result = await runEmittedLoader({
      runtime: { loadScriptNode: legacyLoader },
      instance: { initRawContainer },
    });

    expect(legacyLoader).toHaveBeenCalledWith(
      'http://localhost:3001/remoteEntry.js',
      { attrs: {} },
    );
    expect(result).toEqual({ wrapped: container });
  });
  it('reports a named error when nothing can load a Node script', async () => {
    const result = (await runEmittedLoader({
      runtime: {},
      instance: { platform: { isBrowser: () => false }, initRawContainer },
    })) as Error;

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toMatch(/Node script loader/);
  });
});
