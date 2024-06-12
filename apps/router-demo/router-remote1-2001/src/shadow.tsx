import { useContext, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import React from 'react';

const ShadowContext = React.createContext<Element>(document.head);

function createShadowDomDiv(target: Element) {
  const shadowRoot = target.attachShadow({ mode: 'open' });
  const container = document.createElement('div');
  container.id = 'container';
  shadowRoot.appendChild(container);
  return {
    shadowRoot,
    container,
  };
}

export function ShadowRoot(info: { children: JSX.Element }) {
  const [root, setRoot] = useState(null);
  const domRef = useRef(null);
  const setVal = useRef(false);
  useLayoutEffect(() => {
    if (domRef.current && !setVal.current) {
      const root = (domRef.current as any).attachShadow({
        mode: 'closed',
      });
      setVal.current = true;
      setRoot(root);
    }
  }, [domRef]);
  return (
    <div ref={domRef}>
      {root && (
        <ShadowContext.Provider value={root}>
          <ShadowContent root={root}>{info.children}</ShadowContent>
        </ShadowContext.Provider>
      )}
    </div>
  );
}

export function useShadowRoot() {
  return useContext(ShadowContext);
}

function ShadowContent({ root, children }: any) {
  return createPortal(children, root);
}
