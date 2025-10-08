import type { JSX } from 'react';

export function SSRLiveReload(): JSX.Element | null {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: String.raw`
      if(${globalThis.shouldUpdate}){
        location.reload();
      }
   `,
      }}
    ></script>
  );
}
