import React from 'react';
import { ProviderParams } from '@module-federation/bridge-shared';

export const RouterContext = React.createContext<ProviderParams | null>(null);
