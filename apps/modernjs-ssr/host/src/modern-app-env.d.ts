/// <reference types='@modern-js/app-tools/types' />
/// <reference types='@modern-js/runtime/types' />
/// <reference types='@modern-js/runtime/types/router' />
/// <reference types='@module-federation/modern-js-v3/types' />

declare module 'remote/Image' {
  import type { ComponentType } from 'react';
  const RemoteImage: ComponentType<any>;
  export default RemoteImage;
}
