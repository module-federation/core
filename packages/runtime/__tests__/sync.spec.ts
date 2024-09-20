import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Helper function to check if a method is private
function isPrivate(methodName: string): boolean {
  return methodName.startsWith('_');
}

describe('Module export sync tests', async () => {
  // Dynamically import the index module
  const Index = await import('../src/index');

  beforeAll(async () => {
    // Mock the global __webpack_require__ to provide the runtime
    //@ts-ignore
    globalThis.__webpack_require__ = {
      federation: {
        runtime: Index,
      },
    };
  });

  afterAll(async () => {
    // Clean up the global __webpack_require__ mock
    //@ts-ignore
    delete globalThis.__webpack_require__;
  });

  // Dynamically import the embedded module
  const Embedded = await import('../src/embedded');

  it('should have the same exports in embedded.ts and index.ts', () => {
    // Compare the exports of embedded.ts and index.ts
    const embeddedExports = Object.keys(Embedded).sort();
    const indexExports = Object.keys(Index).sort();
    expect(embeddedExports).toEqual(indexExports);
  });

  it('FederationHost class should have the same methods in embedded.ts and index.ts', () => {
    // Create instances of FederationHost from both embedded.ts and index.ts
    const embeddedHost = new Embedded.FederationHost({
      name: '@federation/test',
      remotes: [],
    });
    const indexHost = new Index.FederationHost({
      name: '@federation/test',
      remotes: [],
    });

    // Get the method names of FederationHost instances, excluding private methods
    const embeddedMethods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(embeddedHost),
    )
      .filter(
        (prop) => typeof embeddedHost[prop] === 'function' && !isPrivate(prop),
      )
      .sort();
    const indexMethods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(indexHost),
    )
      .filter(
        (prop) => typeof indexHost[prop] === 'function' && !isPrivate(prop),
      )
      .sort();

    // Compare the method names
    expect(embeddedMethods).toEqual(indexMethods);
  });

  it('Module class should have the same methods in embedded.ts and index.ts', () => {
    // Create instances of Module from both embedded.ts and index.ts
    const embeddedModule = new Embedded.Module({
      remoteInfo: {
        name: '@federation/test',
        entry: '',
        type: '',
        entryGlobalName: '',
        shareScope: '',
      },
      host: new Embedded.FederationHost({
        name: '@federation/test',
        remotes: [],
      }),
    });
    const indexModule = new Index.Module({
      remoteInfo: {
        name: '@federation/test',
        entry: '',
        type: '',
        entryGlobalName: '',
        shareScope: '',
      },
      host: new Index.FederationHost({
        name: '@federation/test',
        remotes: [],
      }),
    });

    // Get the method names of Module instances, excluding private methods
    const embeddedMethods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(embeddedModule),
    )
      .filter(
        (prop) =>
          typeof embeddedModule[prop] === 'function' && !isPrivate(prop),
      )
      .sort();
    const indexMethods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(indexModule),
    )
      .filter(
        (prop) => typeof indexModule[prop] === 'function' && !isPrivate(prop),
      )
      .sort();

    // Compare the method names
    expect(embeddedMethods).toEqual(indexMethods);
  });
});
