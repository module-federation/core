# Module Federation Testing Strategy

This document owns test strategy and validation patterns for Module Federation packages, framework integrations, runtime plugins, examples, and e2e fixtures. Use [testing-debugging-guide.md](./testing-debugging-guide.md) as the index for the full testing and debugging doc set.

## Validation Scope

The repository validates architecture through package-level scripts, Turbo fanout, local CI parity jobs, and example applications:

Use `architecture-overview.md` for the canonical repo-wide package taxonomy. This section only maps validation surfaces to the command families that prove them.

| Surface | What it proves | Default command family |
| --- | --- | --- |
| Package builds/tests/lints | Runtime, SDK, enhanced/rspack, manifest, DTS, managers, adapters, bridge, devtools, and utility package correctness. | `pnpm run build:packages`, `pnpm run test:packages`, `pnpm run lint:packages`, or targeted `pnpm exec turbo run <task> --filter=<package>`. |
| Runtime examples | `@module-federation/runtime` APIs and remote loading behavior. | `pnpm run ci:local --only=e2e-runtime`. |
| Manifest examples | Webpack/Rspack manifest generation and consumption. | `pnpm run ci:local --only=e2e-manifest`. |
| Metro examples | Metro resolver/serializer/manifest/React Native adapter behavior. | Metro package Turbo filters or the Metro local CI job. |
| Next.js examples | `nextjs-mf` pages/app-router development and production paths. | `pnpm run ci:local --only=e2e-next-dev` and `--only=e2e-next-prod`. |
| Modern/Rsbuild examples | Modern.js, Rsbuild, SSR, data-fetch, and router fixtures. | `e2e-modern`, `e2e-modern-ssr`, `e2e-router`, or matching app scripts. |
| Shared tree shaking | Federated tree-shaking server/frontend behavior and runtime inference/server calculation modes. | `pnpm run ci:local --only=e2e-shared-tree-shaking` and `--only=e2e-treeshake`. |
| Devtools and observability | Browser extension/devtools UI, runtime graph and safe post-message behavior. | `pnpm run ci:local --only=devtools` plus package tests. |
| Docs/playground | `website-new`, `rspress-plugin`, and `@module-federation/playground` integration. | `pnpm run build:website` or targeted package/app scripts. |

For docs-only architecture edits, no runtime checks are required by default. Formatting is still useful when markdown tables or Mermaid blocks are changed.

## Module Federation Testing Strategies

### Unit Testing Patterns for Federated Modules

#### 1. Testing Exposed Modules in Isolation

```javascript
// remote-module.test.js
import { render, screen } from '@testing-library/react';
import RemoteComponent from '../src/components/RemoteComponent';

describe('RemoteComponent', () => {
  it('should render correctly', () => {
    render(<RemoteComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle props properly', () => {
    const mockCallback = jest.fn();
    render(<RemoteComponent onAction={mockCallback} />);
    // Test component behavior
  });
});
```

#### 2. Testing Shared Dependencies

```javascript
// shared-module.test.js
describe('Shared Module Behavior', () => {
  beforeEach(() => {
    // Reset shared state before each test
    if (window.__webpack_share_scopes__) {
      delete window.__webpack_share_scopes__.default;
    }
  });

  it('should use correct shared dependency version', async () => {
    // Mock share scope for testing
    window.__webpack_share_scopes__ = {
      default: {
        'react': {
          '18.0.0': {
            get: () => () => React,
            loaded: true
          }
        }
      }
    };

    const module = await import('./component-using-shared-react');
    expect(module.default).toBeDefined();
  });
});
```

#### 3. Testing Module Federation Configuration

```javascript
// webpack-config.test.js
const webpackConfig = require('../webpack.config.js');

describe('Module Federation Configuration', () => {
  it('should have correct remote entries', () => {
    const mfPlugin = webpackConfig.plugins.find(
      plugin => plugin.constructor.name === 'ModuleFederationPlugin'
    );

    expect(mfPlugin.options.remotes).toEqual({
      'shell': 'shell@http://localhost:3001/remoteEntry.js',
      'mfapp01': 'mfapp01@http://localhost:3002/remoteEntry.js'
    });
  });

  it('should expose correct modules', () => {
    const mfPlugin = webpackConfig.plugins.find(
      plugin => plugin.constructor.name === 'ModuleFederationPlugin'
    );

    expect(mfPlugin.options.exposes).toHaveProperty('./Component');
  });
});
```

### Integration Testing Across Federation Boundaries

#### 1. Cross-Federation Integration Tests

```javascript
// integration.test.js
import { act, render, screen } from '@testing-library/react';

describe('Cross-Federation Integration', () => {
  let mockRemoteEntry;

  beforeEach(() => {
    // Mock remote entry loading
    mockRemoteEntry = {
      get: jest.fn().mockResolvedValue({
        './Component': () => React.createElement('div', {}, 'Mocked Remote Component')
      }),
      init: jest.fn().mockResolvedValue(undefined)
    };

    // Mock dynamic import for remote modules
    global.__webpack_require__ = {
      e: jest.fn().mockResolvedValue(undefined),
      t: jest.fn((module) => module)
    };

    window.shell = mockRemoteEntry;
  });

  it('should load and render remote component', async () => {
    const RemoteWrapper = React.lazy(() =>
      import('shell/Component').catch(() => ({
        default: () => <div>Fallback Component</div>
      }))
    );

    await act(async () => {
      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <RemoteWrapper />
        </React.Suspense>
      );
    });

    expect(screen.getByText('Mocked Remote Component')).toBeInTheDocument();
  });
});
```

#### 2. Testing Federation Error Boundaries

```javascript
// error-boundary.test.js
import { render, screen } from '@testing-library/react';
import FederationErrorBoundary from '../src/components/FederationErrorBoundary';

describe('FederationErrorBoundary', () => {
  const ThrowError = ({ shouldThrow }) => {
    if (shouldThrow) {
      throw new Error('Remote module failed to load');
    }
    return <div>Success</div>;
  };

  it('should catch remote module loading errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <FederationErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={true} />
      </FederationErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
```

### End-to-End Testing for Federated Applications

#### 1. Playwright E2E Tests

```javascript
// e2e/federation.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Module Federation E2E', () => {
  test('should load host and remote applications', async ({ page }) => {
    // Start with host application
    await page.goto('http://localhost:3000');

    // Verify host app loaded
    await expect(page.locator('[data-testid="host-app"]')).toBeVisible();

    // Click button that loads remote component
    await page.click('[data-testid="load-remote"]');

    // Wait for remote component to load
    await page.waitForSelector('[data-testid="remote-component"]');

    // Verify remote component rendered
    await expect(page.locator('[data-testid="remote-component"]')).toBeVisible();
  });

  test('should handle remote loading failures gracefully', async ({ page }) => {
    // Block remote entry requests
    await page.route('**/remoteEntry.js', route => route.abort());

    await page.goto('http://localhost:3000');
    await page.click('[data-testid="load-remote"]');

    // Verify fallback component is shown
    await expect(page.locator('[data-testid="fallback-component"]')).toBeVisible();
  });

  test('should share dependencies correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Load remote component
    await page.click('[data-testid="load-remote"]');
    await page.waitForSelector('[data-testid="remote-component"]');

    // Check that shared React instance is used
    const sharedReactVersion = await page.evaluate(() => {
      return window.React?.version;
    });

    expect(sharedReactVersion).toBeDefined();
  });
});
```

#### 2. Multi-Browser Federation Testing

```javascript
// e2e/multi-browser.spec.js
const { test, expect, devices } = require('@playwright/test');

['chromium', 'firefox', 'webkit'].forEach(browserName => {
  test.describe(`Federation on ${browserName}`, () => {
    test.use({ ...devices['Desktop ' + browserName] });

    test('should work across browsers', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.click('[data-testid="load-remote"]');

      await expect(page.locator('[data-testid="remote-component"]')).toBeVisible();
    });
  });
});
```

### Mock Strategies for Remote Modules During Testing

#### 1. Jest Module Federation Mocks

```javascript
// __mocks__/remote-modules.js
export const mockRemoteComponent = {
  './Component': () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'mocked-remote' }, 'Mocked Component');
  }
};

// Setup file: jest.setup.js
global.__webpack_init_sharing__ = jest.fn().mockResolvedValue(undefined);
global.__webpack_share_scopes__ = { default: {} };

// Mock dynamic imports for remote modules
jest.mock('shell/Component', () => ({
  default: () => <div data-testid="mocked-remote">Mocked Component</div>
}), { virtual: true });
```

#### 2. MSW (Mock Service Worker) for Remote Entries

```javascript
// mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('http://localhost:3001/remoteEntry.js', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'application/javascript'),
      ctx.text(`
        (function() {
          var moduleMap = {
            "./Component": function() {
              return Promise.resolve({
                default: function() {
                  return React.createElement('div', {}, 'Mocked Remote Component');
                }
              });
            }
          };

          window.shell = {
            get: function(module) {
              return moduleMap[module]();
            },
            init: function() {
              return Promise.resolve();
            }
          };
        })();
      `)
    );
  })
];
```

#### 3. Dynamic Mock Loading

```javascript
// test-utils/federation-mocks.js
export class FederationMockRegistry {
  constructor() {
    this.mocks = new Map();
  }

  registerMock(remoteName, modulePath, mockImplementation) {
    const key = `${remoteName}${modulePath}`;
    this.mocks.set(key, mockImplementation);
  }

  getMock(remoteName, modulePath) {
    const key = `${remoteName}${modulePath}`;
    return this.mocks.get(key);
  }

  setupMocks() {
    const originalImport = window.__webpack_require__;

    window.__webpack_require__ = (moduleId) => {
      // Check if this is a federated module
      if (moduleId.includes('/')) {
        const [remoteName, modulePath] = moduleId.split('/', 2);
        const mock = this.getMock(remoteName, `/${modulePath}`);

        if (mock) {
          return Promise.resolve({ default: mock });
        }
      }

      return originalImport ? originalImport(moduleId) : Promise.reject(new Error(`Module not found: ${moduleId}`));
    };
  }
}

// Usage in tests
const mockRegistry = new FederationMockRegistry();
mockRegistry.registerMock('shell', '/Component', () => <div>Mock Component</div>);
mockRegistry.setupMocks();
```
