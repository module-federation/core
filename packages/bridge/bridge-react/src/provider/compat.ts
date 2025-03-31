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

// Check React version
const isReact18 = ReactDOM.version?.startsWith('18');
const isReact19 = ReactDOM.version?.startsWith('19');

// Store the promise for async loaded ReactDOMClient
let reactDOMClientPromise: Promise<any> | null = null;

/**
 * Asynchronously load the react-dom/client module
 * Only attempts to load in React 19 environment
 */
async function loadReactDOMClient() {
  if (!isReact19) return null;

  if (!reactDOMClientPromise) {
    console.log('Loading react-dom/client...');
    reactDOMClientPromise = import('react-dom/client');
  }

  return reactDOMClientPromise;
}

/**
 * Creates a root for React 19 using dynamic import of react-dom/client
 */
function createReact19Root(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  // Preload react-dom/client module
  loadReactDOMClient();

  // Return a simple Root object
  return {
    render(children: React.ReactNode) {
      // Try to load client again when render is called
      loadReactDOMClient().then((client) => {
        if (client && client.createRoot) {
          const root = client.createRoot(container, options);
          root.render(children);
        }
      });
    },
    unmount() {
      // Try to load client again when unmount is called
      loadReactDOMClient().then((client) => {
        if (client && client.createRoot) {
          const root = client.createRoot(container, options);
          root.unmount();
        }
      });
    },
  };
}

/**
 * Creates a root for React 18 using ReactDOM.createRoot
 */
function createReact18Root(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  // @ts-ignore - Types will be available in React 18
  return (ReactDOM as any).createRoot(container, options);
}

/**
 * Creates a root for React 16/17 using legacy APIs
 */
function createReact16Or17Root(container: Element | DocumentFragment): Root {
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
 * Creates a root for a container element compatible with React 16, 18, and 19
 */
export function createRoot(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  if (isReact19) {
    return createReact19Root(container, options);
  }

  if (isReact18) {
    return createReact18Root(container, options);
  }

  // For React 16/17
  return createReact16Or17Root(container);
}

/**
 * Creates a hydration root for React 19 using dynamic import of react-dom/client
 */
function hydrateReact19Root(
  container: Element | DocumentFragment,
  initialChildren: React.ReactNode,
  options?: CreateRootOptions,
): Root {
  // Preload react-dom/client module
  loadReactDOMClient();

  // Return a simple Root object
  return {
    render(children: React.ReactNode) {
      // Try to load client again when render is called
      loadReactDOMClient().then((client) => {
        if (client && client.hydrateRoot) {
          const root = client.hydrateRoot(container, initialChildren, options);
          root.render(children);
        }
      });
    },
    unmount() {
      // Try to load client again when unmount is called
      loadReactDOMClient().then((client) => {
        if (client && client.hydrateRoot) {
          const root = client.hydrateRoot(container, initialChildren, options);
          root.unmount();
        }
      });
    },
  };
}

/**
 * Creates a hydration root for React 18 using ReactDOM.hydrateRoot
 */
function hydrateReact18Root(
  container: Element | DocumentFragment,
  initialChildren: React.ReactNode,
  options?: CreateRootOptions,
): Root {
  // @ts-ignore - Types will be available in React 18
  return (ReactDOM as any).hydrateRoot(container, initialChildren, options);
}

/**
 * Creates a hydration root for React 16/17 using legacy APIs
 */
function hydrateReact16Or17Root(container: Element | DocumentFragment): Root {
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

/**
 * Hydrates a container compatible with React 16, 18, and 19
 */
export function hydrateRoot(
  container: Element | DocumentFragment,
  initialChildren: React.ReactNode,
  options?: CreateRootOptions,
): Root {
  if (isReact19) {
    return hydrateReact19Root(container, initialChildren, options);
  }

  if (isReact18) {
    return hydrateReact18Root(container, initialChildren, options);
  }

  // For React 16/17
  return hydrateReact16Or17Root(container);
}
