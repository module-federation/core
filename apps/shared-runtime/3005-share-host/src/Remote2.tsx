import React, { Suspense, lazy } from 'react';
import { loadRemote } from '@module-federation/runtime';

function DynamicRemoteButton() {
  // @ts-ignore ignore
  const Comp = React.lazy(async () => {
    //@ts-ignore
    const Button = await loadRemote('dynamic-remote/ButtonOldAnt');
    console.log(Button);
    return Button;
  });
  return (
    <React.Suspense fallback="Loading Button">
      <Comp />
    </React.Suspense>
  );
}

export default DynamicRemoteButton;
