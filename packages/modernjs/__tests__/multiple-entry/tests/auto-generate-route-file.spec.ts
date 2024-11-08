import { it, expect, describe, beforeAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { modernBuild } from '../../utils';

const appDirectory = path.join(__dirname, '../');

function retrieveRouteInfo(text: string): {
  pathName: string;
  routeId: string;
} {
  const regex =
    /The layout pathname is: (\/[^\n]+)\n\/\/ The layout route id is: ([^\n]+)/;
  const match = text.match(regex);

  if (match) {
    const pathName = match[1];
    const routeId = match[2];
    return {
      pathName,
      routeId,
    };
  } else {
    throw new Error('Can not get the route info!');
  }
}

beforeAll(async () => {
  await modernBuild(appDirectory);
});

describe('validate auto generated route file info', async () => {
  it('generated layout file should have right route info', async () => {
    const generatedFilePath = path.join(
      appDirectory,
      'src/entry-one/routes/nested-routes/pathname/layout.tsx',
    );
    const generatedFilePathContent = fs.readFileSync(
      generatedFilePath,
      'utf-8',
    );

    const { pathName, routeId } = retrieveRouteInfo(generatedFilePathContent);
    expect(pathName).toEqual('/entry-one/nested-routes/pathname');
    expect(routeId).toEqual('entry-one_nested-routes/pathname/layout');
  });
});
