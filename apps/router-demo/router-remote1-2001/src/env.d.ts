/// <reference types="@rsbuild/core/types" />

import type * as React from 'react';

declare module 'react-router-dom' {
  export const BrowserRouter: React.ComponentType<any>;
  export const Link: React.ComponentType<any>;
  export const Route: React.ComponentType<any>;
  export const Switch: React.ComponentType<any>;
}
