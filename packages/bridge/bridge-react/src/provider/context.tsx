import React from 'react';
import { ProviderParams } from '../types';

export const RouterContext = React.createContext<ProviderParams | null>(null);

/** Router integration for application Roots. This context belongs to the provider. */
export function useBridgeRouter() {
  return React.useContext(RouterContext);
}
