import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

/**
 * Wrapper around dynamic import.
 * Adds error boundaries and fallback options
 * @param {{
 *  importer: function(string): Promise,
 *  fallback: function(string): Promise,
 *  customBoundary: ComponentType
 * }} props
 */
const FederationBoundary = ({
  importer,
  fallback = () => null,
  customBoundary: CustomBoundary,
  ...rest
}) => {
  return useMemo(() => {
    const ImportResult = dynamic(
      () =>
        importer().catch((e: Error) => {
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
  }, [importer, fallback]);
};

module.exports.federationBoundary = FederationBoundary;
