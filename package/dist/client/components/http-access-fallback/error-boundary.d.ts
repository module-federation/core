/**
 * HTTPAccessFallbackBoundary is a boundary that catches errors and renders a
 * fallback component for HTTP errors.
 *
 * It receives the status code, and determine if it should render fallbacks for few HTTP 4xx errors.
 *
 * e.g. 404
 * 404 represents not found, and the fallback component pair contains the component and its styles.
 *
 */
import React from 'react';
interface HTTPAccessFallbackBoundaryProps {
    notFound?: React.ReactNode;
    forbidden?: React.ReactNode;
    unauthorized?: React.ReactNode;
    children: React.ReactNode;
    missingSlots?: Set<string>;
}
export declare function HTTPAccessFallbackBoundary({ notFound, forbidden, unauthorized, children, }: HTTPAccessFallbackBoundaryProps): import("react/jsx-runtime").JSX.Element;
export {};
