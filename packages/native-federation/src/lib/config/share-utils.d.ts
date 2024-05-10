import { SharedConfig } from './federation-config';
import { SkipList } from '../core/default-skip-list';
export declare const DEFAULT_SECONARIES_SKIP_LIST: string[];
type IncludeSecondariesOptions =
  | {
      skip: string | string[];
    }
  | boolean;
type CustomSharedConfig = SharedConfig & {
  includeSecondaries?: IncludeSecondariesOptions;
};
type ConfigObject = Record<string, CustomSharedConfig>;
type Config = (string | ConfigObject)[] | ConfigObject;
export declare function findRootTsConfigJson(): string;
export declare function shareAll(
  config?: CustomSharedConfig,
  skip?: SkipList,
  projectPath?: string,
): Config | null;
export declare function setInferVersion(infer: boolean): void;
export declare function share(
  shareObjects: Config,
  projectPath?: string,
): Config;
export {};
