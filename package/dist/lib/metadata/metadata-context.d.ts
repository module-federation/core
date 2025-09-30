import type { AppRenderContext } from '../../server/app-render/app-render';
import type { MetadataContext } from './types/resolvers';
import type { WorkStore } from '../../server/app-render/work-async-storage.external';
export declare function createMetadataContext(pathname: string, renderOpts: AppRenderContext['renderOpts']): MetadataContext;
export declare function createTrackedMetadataContext(pathname: string, renderOpts: AppRenderContext['renderOpts'], workStore: WorkStore | null): MetadataContext;
