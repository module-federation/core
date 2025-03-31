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

// 用于存储异步加载的 ReactDOMClient
let reactDOMClientPromise: Promise<any> | null = null;

/**
 * 异步加载 react-dom/client 模块
 * 只在 React 19 环境下尝试加载
 */
async function loadReactDOMClient() {
  if (!isReact19) return null;

  if (!reactDOMClientPromise) {
    reactDOMClientPromise = (async () => {
      try {
        // 使用动态导入加载 react-dom/client
        return await import('react-dom/client');
      } catch (e) {
        console.warn('Error dynamically importing react-dom/client', e);
        return null;
      }
    })();
  }

  return reactDOMClientPromise;
}

/**
 * Creates a root for a container element compatible with React 16, 18, and 19
 */
export function createRoot(
  container: Element | DocumentFragment,
  options?: CreateRootOptions,
): Root {
  // For React 19, try to use the createRoot from react-dom/client
  if (isReact19) {
    // 先尝试使用 ReactDOM 上可能已存在的 createRoot 方法
    if ((ReactDOM as any).createRoot) {
      try {
        console.log('Using React 19 createRoot from ReactDOM');
        return (ReactDOM as any).createRoot(container, options);
      } catch (e) {
        console.warn('Error using React 19 createRoot from ReactDOM', e);
      }
    }

    // 如果上面的方法失败，创建一个异步加载的根
    // 这会返回一个模拟的 Root 对象，它的 render 方法会等待真正的 createRoot 加载完成
    const pendingOperations: Array<(root: Root) => void> = [];
    let actualRoot: Root | null = null;

    // 立即开始加载 react-dom/client
    loadReactDOMClient().then(async (client) => {
      if (client && client.createRoot) {
        try {
          actualRoot = client.createRoot(container, options);
          // 执行所有挂起的操作
          pendingOperations.forEach((op) => op(actualRoot!));
        } catch (e) {
          console.warn('Error creating React 19 root after dynamic import', e);
          // 创建失败时降级到 React 18 方法
          if (isReact18) {
            actualRoot = (ReactDOM as any).createRoot(container, options);
            pendingOperations.forEach((op) => op(actualRoot!));
          } else {
            // 降级到 React 16/17 方法
            actualRoot = {
              render(children: React.ReactNode) {
                ReactDOM.render(children, container);
              },
              unmount() {
                ReactDOM.unmountComponentAtNode(container);
              },
            };
            pendingOperations.forEach((op) => op(actualRoot!));
          }
        }
      } else {
        // 降级到 React 18 或 16/17 方法
        if (isReact18) {
          actualRoot = (ReactDOM as any).createRoot(container, options);
        } else {
          actualRoot = {
            render(children: React.ReactNode) {
              ReactDOM.render(children, container);
            },
            unmount() {
              ReactDOM.unmountComponentAtNode(container);
            },
          };
        }
        pendingOperations.forEach((op) => op(actualRoot!));
      }
    });

    // 返回一个代理 Root 对象，它会延迟操作直到真正的 Root 可用
    return {
      render(children: React.ReactNode) {
        if (actualRoot) {
          actualRoot.render(children);
        } else {
          pendingOperations.push((root) => root.render(children));
        }
      },
      unmount() {
        if (actualRoot) {
          actualRoot.unmount();
        } else {
          pendingOperations.push((root) => root.unmount());
        }
      },
    };
  }

  // For React 18, use the createRoot API
  if (isReact18) {
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
 * Hydrates a container compatible with React 16, 18, and 19
 */
export function hydrateRoot(
  container: Element | DocumentFragment,
  initialChildren: React.ReactNode,
  options?: CreateRootOptions,
): Root {
  // For React 19, try to use the hydrateRoot from react-dom/client
  if (isReact19) {
    // 先尝试使用 ReactDOM 上可能已存在的 hydrateRoot 方法
    if ((ReactDOM as any).hydrateRoot) {
      try {
        console.log('Using React 19 hydrateRoot from ReactDOM');
        return (ReactDOM as any).hydrateRoot(
          container,
          initialChildren,
          options,
        );
      } catch (e) {
        console.warn('Error using React 19 hydrateRoot from ReactDOM', e);
      }
    }

    // 如果上面的方法失败，创建一个异步加载的根
    const pendingOperations: Array<(root: Root) => void> = [];
    let actualRoot: Root | null = null;

    // 立即开始加载 react-dom/client
    loadReactDOMClient().then(async (client) => {
      if (client && client.hydrateRoot) {
        try {
          actualRoot = client.hydrateRoot(container, initialChildren, options);
          // 执行所有挂起的操作
          pendingOperations.forEach((op) => op(actualRoot!));
        } catch (e) {
          console.warn(
            'Error creating React 19 hydrate root after dynamic import',
            e,
          );
          // 创建失败时降级到 React 18 方法
          if (isReact18) {
            actualRoot = (ReactDOM as any).hydrateRoot(
              container,
              initialChildren,
              options,
            );
            pendingOperations.forEach((op) => op(actualRoot!));
          } else {
            // 降级到 React 16/17 方法
            actualRoot = {
              render(children: React.ReactNode) {
                ReactDOM.hydrate(children, container);
              },
              unmount() {
                ReactDOM.unmountComponentAtNode(container);
              },
            };
            pendingOperations.forEach((op) => op(actualRoot!));
          }
        }
      } else {
        // 降级到 React 18 或 16/17 方法
        if (isReact18) {
          actualRoot = (ReactDOM as any).hydrateRoot(
            container,
            initialChildren,
            options,
          );
        } else {
          actualRoot = {
            render(children: React.ReactNode) {
              ReactDOM.hydrate(children, container);
            },
            unmount() {
              ReactDOM.unmountComponentAtNode(container);
            },
          };
        }
        pendingOperations.forEach((op) => op(actualRoot!));
      }
    });

    // 返回一个代理 Root 对象，它会延迟操作直到真正的 Root 可用
    return {
      render(children: React.ReactNode) {
        if (actualRoot) {
          actualRoot.render(children);
        } else {
          pendingOperations.push((root) => root.render(children));
        }
      },
      unmount() {
        if (actualRoot) {
          actualRoot.unmount();
        } else {
          pendingOperations.push((root) => root.unmount());
        }
      },
    };
  }

  // For React 18, use the hydrateRoot API
  if (isReact18) {
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
