import React from 'react';
import { ProviderParams } from '../types';

export const RouterContext = React.createContext<ProviderParams | null>(null);
