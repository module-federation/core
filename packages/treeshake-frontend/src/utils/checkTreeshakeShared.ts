import { ENV_API_BASE } from '@/constant';
import { type RequestPayload, type TreeshakeResult } from './treeshakeShared';

export async function checkTreeshakeShared(
  requestPayload: RequestPayload,
): Promise<TreeshakeResult | false> {
  const url = ENV_API_BASE;
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  const { shared, target, plugins, sharedName, sharedVersion } = requestPayload;
  const raw = JSON.stringify({
    shared,
    target,
    plugins,
    libraryType: 'global',
    hostName: '@treeshake/shared-host',
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
  };

  const resp = await window.fetch(
    `${url}/build/check-tree-shaking`,
    requestOptions,
  );
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`);
  }
  const result = await resp.json();
  const { status, data } = result;
  if (status !== 'success') {
    throw new Error(data);
  }

  const targetShared = (data as TreeshakeResult[]).find(
    (item) => item.name === sharedName && item.version === sharedVersion,
  );
  if (!targetShared) {
    throw new Error(`未能正常获取到目标${sharedName}@${sharedVersion}信息`);
  }
  if (!targetShared.canTreeShaking) {
    return false;
  }

  return targetShared;
}
