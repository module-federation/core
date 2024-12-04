import { describe, it, expect } from 'vitest';
import { assert, getRegisteredShare } from '@module-federation/runtime-core';

describe('get expected shared', () => {
  it('get loading shared if sharedStrategy is "loaded-first"', () => {
    let res;
    const promise = new Promise((resolve) => {
      // pending
      res = resolve;
    });
    const shareScopeMap = {
      default: {
        react: {
          '18.2.0': {
            deps: [],
            useIn: [],
            from: 'host',
            get: () => {
              //noop
            },
            loaded: undefined,
            loading: promise,
            lib: undefined,
            version: '18.2.0',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.2.0',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
          '18.3.1': {
            deps: [],
            useIn: [],
            from: 'remote',
            loaded: undefined,
            get: () => {
              //noop
            },
            loading: null,
            version: '18.3.1',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.3.1',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
        },
      },
    };

    const shareInfoRes = {
      deps: [],
      useIn: [],
      from: 'remote',
      loaded: undefined,
      get: () => {
        //noop
      },
      loading: null,
      version: '18.3.1',
      scope: ['default'],
      shareConfig: {
        fixedDependencies: false,
        requiredVersion: '18.3.1',
        strictVersion: false,
        singleton: true,
        eager: false,
      },
      strategy: 'loaded-first',
    };

    // @ts-ignore
    const registeredShared = getRegisteredShare(
      shareScopeMap,
      'react',
      shareInfoRes,
      {
        emit: () => undefined,
      },
    );
    assert(registeredShared, 'must get registeredShared');
    expect(registeredShared.from).toEqual('host');
    res();
  });

  it('get loaded shared if it has been loaded and sharedStrategy is "loaded-first"', () => {
    const shareScopeMap = {
      default: {
        react: {
          '18.2.0': {
            deps: [],
            useIn: [],
            from: 'host',
            get: () => {
              //noop
            },
            loaded: true,
            lib: {},
            loading: Promise.resolve(),
            version: '18.2.0',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.2.0',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
          '18.3.1': {
            deps: [],
            useIn: [],
            from: 'remote',
            loaded: undefined,
            get: () => {
              //noop
            },
            loading: null,
            version: '18.3.1',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.3.1',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
        },
      },
    };

    const shareInfoRes = {
      deps: [],
      useIn: [],
      from: 'remote',
      loaded: undefined,
      get: () => {
        //noop
      },
      loading: null,
      version: '18.3.1',
      scope: ['default'],
      shareConfig: {
        fixedDependencies: false,
        requiredVersion: '18.3.1',
        strictVersion: false,
        singleton: true,
        eager: false,
      },
      strategy: 'loaded-first',
    };

    // @ts-ignore
    const registeredShared = getRegisteredShare(
      shareScopeMap,
      'react',
      shareInfoRes,
      {
        emit: () => undefined,
      },
    );
    assert(registeredShared, 'must get registeredShared');
    expect(registeredShared.from).toEqual('host');
  });

  it('get max version shared if all registered shared no loaded or loading and sharedStrategy is "loaded-first"', () => {
    const shareScopeMap = {
      default: {
        react: {
          '18.2.0': {
            deps: [],
            useIn: [],
            from: 'host',
            get: () => {
              //noop
            },
            loaded: undefined,
            lib: undefined,
            loading: null,
            version: '18.2.0',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.2.0',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
          '18.3.1': {
            deps: [],
            useIn: [],
            from: 'remote',
            loaded: undefined,
            get: () => {
              //noop
            },
            loading: null,
            version: '18.3.1',
            scope: ['default'],
            shareConfig: {
              requiredVersion: '^18.3.1',
              singleton: 1,
              eager: 0,
              strictVersion: false,
            },
            strategy: 'loaded-first',
          },
        },
      },
    };

    const shareInfoRes = {
      deps: [],
      useIn: [],
      from: 'remote',
      loaded: undefined,
      get: () => {
        //noop
      },
      loading: null,
      version: '18.3.1',
      scope: ['default'],
      shareConfig: {
        fixedDependencies: false,
        requiredVersion: '18.3.1',
        strictVersion: false,
        singleton: true,
        eager: false,
      },
      strategy: 'loaded-first',
    };

    // @ts-ignore
    const registeredShared = getRegisteredShare(
      shareScopeMap,
      'react',
      shareInfoRes,
      {
        emit: () => undefined,
      },
    );
    assert(registeredShared, 'must get registeredShared');
    expect(registeredShared.from).toEqual('remote');
  });
});
