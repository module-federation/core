import type { ComponentType } from 'react';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';


type BoundaryProps = {
  children: React.ReactNode; // 👈️ type children
};


class ErrorBoundary extends React.Component<any, any> {
  constructor(props: BoundaryProps) {
    super(props);
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  override render() {
    return this.props['children'];
  }
}

/**
 * Wrapper around dynamic import.
 * Adds error boundaries and fallback options
 */

export const FederationBoundary = ({
  dynamicImporter,
  fallback = () => null,
  customBoundary: CustomBoundary,
  ...rest
}: {
        dynamicImporter: () => Promise<any>;
        fallback: () => Promise<any> | null;
        customBoundary: ComponentType;
    }) => {
  return useMemo(() => {
    const ImportResult = dynamic(
      () =>
        dynamicImporter().catch((e: Error) => {
          console.error(e);
          return fallback();
        }),
      {
        ssr: false,
      }
    );
    const Boundary =
      CustomBoundary !== undefined ? CustomBoundary : ErrorBoundary;
    return (
      <Boundary>
        <ImportResult {...rest} />
      </Boundary>
    );
  }, [dynamicImporter, fallback]);
};

