import React, { useMemo } from 'react';
import type { ComponentClass, ComponentType, PropsWithChildren } from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from './ErrorBoundary';

/**
 * A fallback component that renders nothing.
 */
const FallbackComponent: React.FC = () => {
  return null;
};

export interface FederationBoundaryProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dynamicImporter: () => Promise<ComponentType<any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fallback?: () => Promise<ComponentType<any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customBoundary?: ComponentClass<PropsWithChildren<any>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [props: string]: any;
}

/**
 * Wrapper around dynamic import.
 * Adds error boundaries and fallback options.
 */
const FederationBoundary: React.FC<FederationBoundaryProps> = ({
  dynamicImporter,
  fallback = () => Promise.resolve(FallbackComponent),
  customBoundary: CustomBoundary = ErrorBoundary,
  ...rest
}) => {
  const ImportResult = useMemo(() => {
    return dynamic(
      () =>
        dynamicImporter().catch((e: Error) => {
          console.error(e);
          return fallback();
        }),
      {
        ssr: false,
      }
    );
  }, [dynamicImporter, fallback]);

  return (
    <CustomBoundary>
      <ImportResult {...rest} />
    </CustomBoundary>
  );
};

export default FederationBoundary;
