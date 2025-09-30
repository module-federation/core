import type { GetStaticPaths } from '../../types';
import type { StaticPathsResult } from './types';
export declare function buildPagesStaticPaths({ page, getStaticPaths, configFileName, locales, defaultLocale, }: {
    page: string;
    getStaticPaths: GetStaticPaths;
    configFileName: string;
    locales?: readonly string[];
    defaultLocale?: string;
}): Promise<StaticPathsResult>;
