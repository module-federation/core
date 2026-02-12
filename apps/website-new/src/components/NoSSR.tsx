import type { ReactNode } from 'react';

export function NoSSR(props: { children?: ReactNode }) {
  if (typeof document === 'undefined') {
    return null;
  }

  return <>{props.children}</>;
}
