import type { Metadata, ResolvedMetadata, ResolvedViewport, ResolvingMetadata, ResolvingViewport, Viewport } from './types/metadata-interface';
import type { GetDynamicParamFromSegment } from '../../server/app-render/app-render';
import type { MetadataContext } from './types/resolvers';
import type { LoaderTree } from '../../server/lib/app-dir-module';
import type { ParsedUrlQuery } from 'querystring';
import type { StaticMetadata } from './types/icons';
import type { WorkStore } from '../../server/app-render/work-async-storage.external';
import 'server-only';
type MetadataResolver = (parent: ResolvingMetadata) => Metadata | Promise<Metadata>;
type ViewportResolver = (parent: ResolvingViewport) => Viewport | Promise<Viewport>;
export type MetadataErrorType = 'not-found' | 'forbidden' | 'unauthorized';
export type MetadataItems = Array<[
    Metadata | MetadataResolver | null,
    StaticMetadata
]>;
export type ViewportItems = Array<Viewport | ViewportResolver | null>;
export declare function accumulateMetadata(metadataItems: MetadataItems, metadataContext: MetadataContext): Promise<ResolvedMetadata>;
export declare function accumulateViewport(viewportItems: ViewportItems): Promise<ResolvedViewport>;
export declare function resolveMetadata(tree: LoaderTree, searchParams: Promise<ParsedUrlQuery>, errorConvention: MetadataErrorType | undefined, getDynamicParamFromSegment: GetDynamicParamFromSegment, workStore: WorkStore, metadataContext: MetadataContext): Promise<ResolvedMetadata>;
export declare function resolveViewport(tree: LoaderTree, searchParams: Promise<ParsedUrlQuery>, errorConvention: MetadataErrorType | undefined, getDynamicParamFromSegment: GetDynamicParamFromSegment, workStore: WorkStore): Promise<ResolvedViewport>;
export {};
