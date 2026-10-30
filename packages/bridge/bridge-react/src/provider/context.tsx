import React from 'react';
import { ProviderParams } from '../types';

export const RouterContext = React.createContext<ProviderParams | null>(null);

/**
 * Router integration for application Roots, isolated per provider mount.
 * basename is the consumer mount, independent of the producer's export selector.
 * The framework integration connects its own Router through this context.
 */
export function useBridgeRouter() {
  return React.useContext(RouterContext);
}
