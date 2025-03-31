import ReactDOM from 'react-dom';
import { CreateRootOptions, Root } from '../types';
import { ReactElement } from 'react';

// Check React version
const isReact18 = ReactDOM.version?.startsWith('18');
const isReact19 = ReactDOM.version?.startsWith('19');

/**
 * Creates a root for a container element compatible with React 16, 18, and 19
 */
export function createRoot(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  if (isReact19) {
    // For React 19, import createRoot from react-dom/client
    try {
      // Dynamic import to avoid issues in React 16/18 environments
      // @ts-ignore - We're handling the import dynamically
      const reactDomClient = require('react-dom/client');
      return reactDomClient.createRoot(container, options);
    } catch (e) {
      console.warn(
        'Failed to use React 19 createRoot, falling back to React 18 method',
        e,
      );
      // Fall through to React 18 method if import fails
    }
  }

  if (isReact18) {
    // For React 18, use the createRoot API from ReactDOM
    // @ts-ignore - Types will be available in React 18
    return (ReactDOM as any).createRoot(container, options);
  }

  // For React 16/17, simulate the new root API using render/unmountComponentAtNode
  return {
    render(children: React.ReactNode) {
      ReactDOM.render(children as ReactElement, container);
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
    // For React 19, import hydrateRoot from react-dom/client
    try {
      // Dynamic import to avoid issues in React 16/18 environments
      // @ts-ignore - We're handling the import dynamically
      const reactDomClient = require('react-dom/client');
      return reactDomClient.hydrateRoot(container, initialChildren, options);
    } catch (e) {
      console.warn(
        'Failed to use React 19 hydrateRoot, falling back to React 18 method',
        e,
      );
      // Fall through to React 18 method if import fails
    }
  }

  if (isReact18) {
    // For React 18, use the hydrateRoot API from ReactDOM
    // @ts-ignore - Types will be available in React 18
    return (ReactDOM as any).hydrateRoot(container, initialChildren, options);
  }

  // For React 16/17, simulate the new root API using hydrate/unmountComponentAtNode
  return {
    render(children: React.ReactNode) {
      // For the initial render, use hydrate
      if (children === initialChildren) {
        ReactDOM.hydrate(children as ReactElement, container);
      } else {
        // For subsequent renders, use regular render
        ReactDOM.render(children as ReactElement, container);
      }
    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container);
    },
  };
}
