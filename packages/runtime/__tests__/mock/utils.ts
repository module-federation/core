import { rs } from '@rstest/core';
import path from 'path';
import fs from 'fs';

function isAbsolute(url: string) {
  // Windows drive paths return false here; browser fixtures should use file URLs.
  if (!/^[a-zA-Z]:\\/.test(url)) {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)) {
      return true;
    }
  }
  return false;
}

const nativeFetch = globalThis.fetch?.bind(globalThis);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mockStaticServer({
  baseDir,
  filterKeywords,
  customerHeaders = {},
  basename = '',
  responseMatchs = {},
}: {
  baseDir: string;
  basename?: string;
  filterKeywords?: Array<string>;
  customerHeaders?: Record<string, Record<string, any>>;
  responseMatchs?: Record<string, string>;
}) {
  const match = (input: Request) =>
    Array.isArray(filterKeywords)
      ? !filterKeywords.some((words) => input.url.includes(words))
      : true;

  rs.stubGlobal(
    'fetch',
    rs.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const req = input instanceof Request ? input : new Request(input, init);
      if (!match(req)) {
        if (!nativeFetch) {
          throw new Error('No fetch implementation is available.');
        }
        return nativeFetch(req);
      }

      let pathname = req.url;
      if (isAbsolute(req.url)) {
        // eslint-disable-next-line prefer-destructuring
        pathname = new URL(req.url).pathname;
        if (basename) {
          pathname = pathname.replace(basename, './');
        }
      }
      const fullDir = path.resolve(baseDir, './' + pathname);
      const { ext } = path.parse(fullDir);
      // prettier-ignore
      const mimeType =
          // eslint-disable-next-line no-nested-ternary
          ext === '.html' ?
            'text/html' :
            // eslint-disable-next-line no-nested-ternary
            ext === '.js' ?
              'text/javascript' :
              ext === '.css' ?
                'text/css' :
                'text/plain';
      const { timeConsuming = 0, ...headers } = customerHeaders[pathname] || {
        timeConsuming: 0,
      };

      try {
        const body =
          responseMatchs[pathname] || fs.readFileSync(fullDir, 'utf-8');
        const response = new Response(body, {
          headers: {
            'Content-Type': mimeType,
            ...(headers || {}),
          },
        });

        if (timeConsuming) {
          await new Promise((resolve) => setTimeout(resolve, timeConsuming));
        }
        return response;
      } catch (err) {
        console.error(
          'mockStaticServer: request ' + pathname + ', fullDir: ' + fullDir,
        );
        throw err;
      }
    }),
  );
}

import { ModuleFederationRuntimePlugin } from '../../src/type';
import { ProviderModuleInfo } from '@module-federation/sdk';

export const mockRemoteSnapshot: (
  uniqueId: string,
  remoteSnapshots: {
    [name: string]: ProviderModuleInfo;
  },
) => ModuleFederationRuntimePlugin = function (uniqueId, remoteSnapshots) {
  return {
    name: `mock-snapshot-${uniqueId}`,
    loadSnapshot({ moduleInfo, ...info }) {
      const key = `${moduleInfo.name}:${(moduleInfo as any).version}`;
      const remoteSnapshot = remoteSnapshots[key];

      if (remoteSnapshot) {
        return {
          moduleInfo,
          ...info,
          remoteSnapshot: remoteSnapshot,
          globalSnapshot: remoteSnapshots,
        };
      }

      return { moduleInfo, ...info, globalSnapshot: remoteSnapshots };
    },
  };
};

export function removeScriptTags() {
  const scriptTags = document.querySelectorAll('script'); // 获取页面中所有的 script 标签
  for (let i = 0; i < scriptTags.length; i++) {
    // 循环所有 script 标签
    scriptTags[i].remove(); // 移除当前 script 标签
  }
}
