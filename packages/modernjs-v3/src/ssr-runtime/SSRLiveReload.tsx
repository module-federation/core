import React from 'react';

export function SSRLiveReload() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  // Modern.js hydrates only at renderLevel SERVER_RENDER (2); a script React
  // creates on the client never runs.
  if (typeof window !== 'undefined' && window._SSR_DATA?.renderLevel !== 2) {
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
