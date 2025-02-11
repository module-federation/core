import ReactDOM from 'react-dom';

interface CreateRootOptions {
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown) => void;
  transitionCallbacks?: unknown;
}

interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

const isReact18 = ReactDOM.version.startsWith('18');

/**
 * Creates a root for a container element compatible with both React 16 and 18
 */
export function createRoot(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  if (isReact18) {
    // For React 18, use the new createRoot API
    // @ts-ignore - Types will be available in React 18
    return (ReactDOM as any).createRoot(container, options);
  }

  // For React 16/17, simulate the new root API using render/unmountComponentAtNode
  return {
    render(children: React.ReactNode) {
      // @ts-ignore - React 17's render method is deprecated but still functional
      ReactDOM.render(children, container);
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container);
    },
  };
}

/**
 * Hydrates a container compatible with both React 16 and 18
 */
export function hydrateRoot(
  container: Element | DocumentFragment,
  initialChildren: React.ReactNode,
  options?: CreateRootOptions,
): Root {
  if (isReact18) {
    // For React 18, use the new hydrateRoot API
    // @ts-ignore - Types will be available in React 18
    return (ReactDOM as any).hydrateRoot(container, initialChildren, options);
  }

  // For React 16/17, simulate the new root API using hydrate
  return {
    render(children: React.ReactNode) {
      // @ts-ignore - React 17's hydrate method is deprecated but still functional
      ReactDOM.hydrate(children, container);
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container);
    },
  };
}
