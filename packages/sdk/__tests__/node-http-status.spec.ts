import { createScriptNode } from '../src/node';

const createResponse = (
  body: string,
  init: { status: number; statusText?: string },
): Response =>
  ({
    ok: init.status >= 200 && init.status < 300,
    status: init.status,
    statusText: init.statusText ?? '',
    text: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

const loadNodeScript = (attrs: Record<string, unknown> = {}) =>
  new Promise((resolve, reject) => {
    createScriptNode(
      'http://example.com/remoteEntry.js',
      (error, scriptContext) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(scriptContext);
      },
      attrs,
    );
  });

describe('Node script HTTP status handling', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('rejects non-ok CommonJS responses before evaluating the body', async () => {
    const fetchMock = jest.fn().mockImplementation(() =>
      Promise.resolve(
        createResponse('Injected missing remoteEntry', {
          status: 404,
          statusText: 'Not Found',
        }),
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    let error: Error | undefined;
    try {
      await loadNodeScript();
    } catch (caughtError) {
      error = caughtError as Error;
    }

    expect(error).toBeInstanceOf(Error);
    expect(error?.name).toBe('ScriptNetworkError');
    expect(error?.message).toContain('HTTP 404');
    expect(error?.message).not.toContain('Unexpected identifier');
  });
});
