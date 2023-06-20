import React from 'react';
import type { ComponentClass, ComponentType, PropsWithChildren } from 'react';
export interface FederationBoundaryProps {
    dynamicImporter: () => Promise<ComponentType<any>>;
    fallback?: () => Promise<ComponentType<any>>;
    customBoundary?: ComponentClass<PropsWithChildren<any>>;
    [props: string]: any;
}
/**
 * Wrapper around dynamic import.
 * Adds error boundaries and fallback options.
 */
declare const FederationBoundary: React.FC<FederationBoundaryProps>;
export default FederationBoundary;
