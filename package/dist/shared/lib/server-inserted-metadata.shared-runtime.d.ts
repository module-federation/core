import type React from 'react';
export type MetadataResolver = () => React.ReactNode;
type MetadataResolverSetter = (m: MetadataResolver) => void;
export declare const ServerInsertedMetadataContext: React.Context<MetadataResolverSetter | null>;
export {};
