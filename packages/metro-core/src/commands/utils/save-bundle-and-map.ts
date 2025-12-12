import { promises as fs } from 'node:fs';
import util from 'node:util';
import type { MixedSourceMap } from 'metro-source-map';
import relativizeSourceMapInline from 'metro/src/lib/relativizeSourceMap';
import type { OutputOptions } from 'metro/src/shared/types';

function relativizeSerializedMap(
  map: string,
  sourceMapSourcesRoot: string,
): string {
  const sourceMap: MixedSourceMap = JSON.parse(map);
  relativizeSourceMapInline(sourceMap, sourceMapSourcesRoot);
  return JSON.stringify(sourceMap);
}

export async function saveBundleAndMap(
  bundle: { code: string; map: string },
  options: OutputOptions,
  log: (msg: string) => void,
) {
  const {
    bundleOutput,
    bundleEncoding: encoding,
    sourcemapOutput,
    sourcemapSourcesRoot,
  } = options;

  const writeFns = [];

  writeFns.push(async () => {
    log(`Writing bundle output to:\n${util.styleText('dim', bundleOutput)}`);
    await fs.writeFile(bundleOutput, bundle.code, encoding);
    log('Done writing bundle output');
  });

  if (sourcemapOutput) {
    let { map } = bundle;
    if (sourcemapSourcesRoot != null) {
      log('Start relativating source map');

      map = relativizeSerializedMap(map, sourcemapSourcesRoot);
      log('Finished relativating');
    }

    writeFns.push(async () => {
      log(
        `Writing sourcemap output to:\n${util.styleText('dim', sourcemapOutput)}`,
      );
      await fs.writeFile(sourcemapOutput, map);
      log('Done writing sourcemap output');
    });
  }

  // Wait until everything is written to disk.
  await Promise.all(writeFns.map((cb) => cb()));
}
