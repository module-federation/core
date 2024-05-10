import { BuildResult } from '../core/build-adapter';
export declare function createBuildResultMap(
  buildResult: BuildResult[],
  isHashed: boolean,
): Record<string, string>;
export declare function lookupInResultMap(
  map: Record<string, string>,
  requestName: string,
): string;
