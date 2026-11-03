import React, { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import {
  getInstance,
  type ModuleFederation,
} from '@module-federation/enhanced/runtime';
import type {
  CreateReactRemoteOptions,
  ReactRemoteProps,
  CreateReactRemote,
  ReactRemoteComponent,
} from './reactRemoteTypes';
export type {
  CreateReactRemoteOptions,
  ReactRemoteProps,
  ReactRemoteErrorInfo,
} from './reactRemoteTypes';
import type { RemoteAppWrapperProps } from './remote/RemoteAppWrapper';
import { createLazyComponentResource } from './lazy/createLazyComponent';
import { autoFetchDataPlugin } from './lazy';
import { initializeRemoteDataFetch } from './lazy/data-fetch/runtime-plugin';
import type { BridgeProviderInstance } from './types';

type Namespace = Record<string, any> & { [key: symbol]: unknown };
const configured = new WeakSet<ModuleFederation>();
const moduleId = Symbol.for('mf_module_id');

const asError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error));
function namespace(
  value: unknown,
  id?: string,
  individualExport = false,
): Namespace {
  if (!value || (typeof value !== 'object' && typeof value !== 'function'))
    throw new Error('A React remote must return an MF module namespace.');
  if (
    individualExport ||
    (typeof value === 'function' && !('default' in value)) ||
    ('$$typeof' in value && !('default' in value))
  ) {
    return Object.defineProperty({ default: value }, moduleId, { value: id });
  }
  if (!id || (value as Namespace)[moduleId] === id) return value as Namespace;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  delete (descriptors as Record<symbol, unknown>)[moduleId];
  // Keep raw loadRemote exports unchanged, including frozen namespaces.
  return Object.defineProperty(
    Object.create(Object.getPrototypeOf(value), descriptors),
    moduleId,
    { value: id },
  );
}

async function resolveProtocol(
  instance: ModuleFederation,
  id: string,
  hint?: CreateReactRemoteOptions['render'],
) {
  // Resolve through the runtime's full beforeRequest / afterResolve chain.
  // Its final result includes the platform-selected snapshot and expose.
  const resolvedRemote = instance.remoteHandler.getRemoteModuleAndOptions({
    id,
  });
  // Keep protocol selection before loading. Without a framework SSR context,
  // Bridge exposes retain their existing server placeholder behavior.
  const load = () =>
    instance.remoteHandler.loadRemote(id, undefined, resolvedRemote);
  let match: Awaited<typeof resolvedRemote>['remoteMatchInfo'];
  try {
    match = (await resolvedRemote).remoteMatchInfo;
  } catch {
    // Continue through the normal runtime error and diagnostic hooks without
    // resolving twice or executing an unknown provider on Node.
    return {
      render: hint || 'component',
      recovered: namespace(await load(), id),
      match: undefined,
      load,
    };
  }
  return {
    render: selectProtocol(match, id, hint),
    recovered: undefined,
    match,
    load,
  };
}

export type RemoteMatch = Awaited<
  ReturnType<ModuleFederation['remoteHandler']['getRemoteModuleAndOptions']>
>['remoteMatchInfo'];

function selectProtocol(
  match: RemoteMatch,
  id: string,
  hint?: CreateReactRemoteOptions['render'],
) {
  const { remoteSnapshot: snapshot, expose } = match;
  const metadata =
    snapshot && 'modules' in snapshot
      ? snapshot.modules.find(
          (item) =>
            item.modulePath === expose ||
            item.moduleName === expose.replace(/^\.\//, ''),
        )
      : undefined;
  if (metadata?.isService)
    throw new Error(`Service App '${id}' is not supported by this consumer.`);
  if (
    metadata?.render &&
    metadata.render !== 'bridge' &&
    metadata.render !== 'component'
  ) {
    throw new Error(
      `Remote '${id}' declares an unsupported rendering protocol.`,
    );
  }
  if (metadata?.render && hint && metadata.render !== hint) {
    throw new Error(
      `Remote '${id}' render hint conflicts with its manifest protocol.`,
    );
  }
  return metadata?.render || hint || 'component';
}

class RemoteBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: CreateReactRemoteOptions['fallback'];
    retry: () => void;
    resource: unknown;
  },
  { error?: Error; resource?: unknown }
> {
  state: { error?: Error; resource?: unknown } = {};
  static getDerivedStateFromProps(
    props: { resource: unknown },
    state: { resource?: unknown },
  ) {
    return props.resource !== state.resource
      ? { resource: props.resource, error: undefined }
      : null;
  }
  static getDerivedStateFromError(error: unknown) {
    return { error: asError(error) };
  }
  render() {
    if (this.state.error) {
      if (!this.props.fallback) throw this.state.error;
      return this.props.fallback({
        error: this.state.error,
        retry: this.props.retry,
      });
    }
    return this.props.children;
  }
}

export type PreparedRemote<P extends object> = {
  Component: React.ComponentType<P>;
  loadClient?: () => Promise<React.ComponentType<P>>;
  loadProvider?: RemoteAppWrapperProps['loadProvider'];
};
export type RemoteResource<P extends object> = {
  prepare: () => Promise<PreparedRemote<P>>;
};

function createConsumer<P extends object>(
  getOptions: () => CreateReactRemoteOptions,
  RemoteApp: React.ComponentType<RemoteAppWrapperProps>,
  useEnvironment: UseRemoteEnvironment,
) {
  return function RemoteConsumer(props: P) {
    const options = getOptions();
    const instance = options.instance || getInstance();
    const [attempt, setAttempt] = useState(0);
    const retry = useCallback(() => setAttempt((value) => value + 1), []);
    const paramsKey = JSON.stringify(options.dataFetchParams);
    const environment = useEnvironment(getOptions, attempt, instance);
    const { instanceId, serverBridge, ClientOnlyRemote } = environment;
    const resource = useMemo(() => {
      const bridgeComponent =
        (
          id: string,
          loadProvider: NonNullable<RemoteAppWrapperProps['loadProvider']>,
          serverProvider?: BridgeProviderInstance,
        ) =>
        (businessProps: P) => (
          <RemoteApp
            loadProvider={loadProvider}
            instance={instance}
            moduleName={id}
            ssrInstanceId={instanceId}
            ssrProvider={serverProvider}
            loading={getOptions().loading}
            remoteProps={businessProps as Record<string, unknown>}
            routing={{
              basename: getOptions().basename,
              memoryRoute: getOptions().memoryRoute,
              navigation: getOptions().navigation,
            }}
          />
        );
      let prepared: Promise<PreparedRemote<P>> | undefined;
      const prepare = (): Promise<PreparedRemote<P>> =>
        (prepared ||= (() => {
          const work = (async (): Promise<PreparedRemote<P>> => {
            if (!instance)
              throw new Error(
                'An initialized MF runtime instance is required.',
              );
            if (!configured.has(instance)) {
              instance.registerPlugins([autoFetchDataPlugin()]);
              configured.add(instance);
            }
            let id: string;
            let loaded: Promise<Namespace> | undefined;
            let selection: Awaited<ReturnType<typeof resolveProtocol>>;
            if (typeof options.remote === 'string') {
              id = options.remote;
              selection = await resolveProtocol(instance, id, options.render);
            } else {
              // Calling a loader executes the module, not a Bridge provider or
              // React component. Cache the exact result for this render attempt.
              // Unlike strings, loaders must run before source/type discovery, so
              // framework SSR must also account for their module-level side effects.
              const value = await options.remote();
              const handler = instance.remoteHandler as {
                getLoadedRemoteInfo?: (value: unknown) =>
                  | {
                      remoteMatchInfo?: RemoteMatch;
                      id: string;
                      recovered: boolean;
                      isModule: boolean;
                    }
                  | undefined;
              };
              let source = handler.getLoadedRemoteInfo?.(value);
              let selectedNamespace: Namespace | undefined;
              if (
                !source &&
                handler.getLoadedRemoteInfo &&
                value &&
                typeof value === 'object'
              ) {
                // Bundler interop may create another namespace after the factory
                // returns. Identify only the export actually requested here.
                const exportName = options.exportName || 'default';
                const selected = (value as Namespace)[exportName];
                source = handler.getLoadedRemoteInfo(selected);
                if (source) selectedNamespace = { [exportName]: selected };
              }
              if (source) {
                id = source.id;
                const module = namespace(
                  selectedNamespace || value,
                  id,
                  !selectedNamespace && !source.isModule,
                );
                loaded = Promise.resolve(module);
                selection = source.recovered
                  ? {
                      render: options.render || 'component',
                      recovered: module,
                      match: undefined,
                      load: () => loaded!,
                    }
                  : {
                      render: selectProtocol(
                        source.remoteMatchInfo!,
                        id,
                        options.render,
                      ),
                      recovered: undefined,
                      match: source.remoteMatchInfo!,
                      load: () => loaded!,
                    };
              } else {
                // Older runtimes only identify module namespaces. Never guess
                // the source of a default export or another runtime's object.
                const module = namespace(value);
                const identity =
                  !handler.getLoadedRemoteInfo && module[moduleId];
                if (typeof identity !== 'string')
                  throw new Error(
                    'The remote loader returned no MF module identity for this runtime instance. Use a remote alias/expose, or load the value with the same updated runtime instance.',
                  );
                id = identity;
                loaded = Promise.resolve(module);
                selection = await resolveProtocol(instance, id, options.render);
              }
            }
            const protocol = selection.render;
            if (protocol !== 'bridge' && environment.target === 'server')
              environment.skip();
            if (selection.recovered && protocol === 'component') {
              // A runtime fallback has no successful remote registry entry,
              // data loader or remote asset metadata to hydrate.
              return {
                Component: selection.recovered[
                  options.exportName || 'default'
                ] as React.ComponentType<P>,
              };
            }
            if (selection.recovered)
              loaded = Promise.resolve(selection.recovered);
            const load = () =>
              (loaded ||= selection
                .load()
                .then((value) => namespace(value, id)));
            if (protocol === 'bridge') {
              if (options.exportName && options.exportName !== 'default')
                throw new Error(
                  'Bridge exposes use the default provider export.',
                );
              const loadProvider = async () => {
                const module = await load();
                if (typeof module.default !== 'function')
                  throw new Error(
                    `Bridge '${id}' must have a default provider export.`,
                  );
                return module.default;
              };
              const serverProvider =
                environment.target === 'server'
                  ? await environment.prepareBridge(
                      id,
                      loadProvider,
                      selection.match,
                    )
                  : undefined;
              return {
                Component: bridgeComponent(id, loadProvider, serverProvider),
                loadProvider,
              };
            }
            const resolvedRemoteInfo = selection.match?.remoteInfo && {
              ...selection.match.remoteInfo,
              snapshot: selection.match.remoteSnapshot,
              expose: selection.match.expose,
            };
            if (selection.match?.remoteInfo) {
              initializeRemoteDataFetch({
                id,
                moduleInfo: selection.match.remoteInfo,
                remoteSnapshot: selection.match.remoteSnapshot,
                host: instance,
              });
            }
            const lazy = createLazyComponentResource({
              resolvedRemoteInfo,
              cacheDataForMount: true,
              loader: load,
              instance,
              export: options.exportName || 'default',
              loading: options.loading ?? null,
              fallback: ({ error }: { error: Error }) => {
                // React error boundaries do not catch during server rendering.
                // Keep the lazy data/loader fallback in the server response.
                const fallback = getOptions().fallback;
                if (environment.target === 'server' && fallback) {
                  return fallback({ error: asError(error), retry });
                }
                throw error;
              },
              noSSR: options.noSSR,
              dataFetchParams: options.dataFetchParams,
              injectScript: options.injectScript,
              injectLink: options.injectLink,
              delayLoading: options.delayLoading,
            });
            return {
              Component: lazy.Component as React.ComponentType<P>,
              loadClient: async () => {
                const loaded = await lazy.loadClient();
                return (businessProps: P) => (
                  <loaded.Component {...businessProps} mfData={loaded.data} />
                );
              },
            };
          })();
          return (
            environment.target === 'server' ? environment.wait(work) : work
          ).catch((error) => {
            if (environment.target === 'server') environment.fail(error);
            const fallback = getOptions().fallback;
            if (environment.target === 'server' && fallback) {
              return {
                Component: () => fallback({ error: asError(error), retry }),
              };
            }
            throw error;
          });
        })());
      return {
        prepare,
        // The server has already selected Bridge for this container. Hydrate
        // its Host wrapper immediately, so parent updates cannot abandon an
        // unresolved classification Suspense boundary and discard remote DOM.
        Hydrate:
          serverBridge?.remote === options.remote && attempt === 0
            ? bridgeComponent(serverBridge.moduleName, async () => {
                const selected = await prepare();
                if (!selected.loadProvider)
                  throw new Error(
                    'The hydrated remote must retain its Bridge rendering protocol.',
                  );
                return selected.loadProvider();
              })
            : undefined,
        Lazy: React.lazy(async () => ({
          default: (await prepare()).Component,
        })),
      };
    }, [
      instance,
      options.remote,
      options.render,
      options.exportName,
      options.noSSR,
      options.injectScript,
      options.injectLink,
      paramsKey,
      attempt,
      environment,
      instanceId,
      serverBridge,
    ]);
    return (
      <RemoteBoundary
        key={attempt}
        resource={resource}
        fallback={options.fallback}
        retry={retry}
      >
        <Suspense fallback={options.loading ?? null}>
          {options.noSSR ? (
            <ClientOnlyRemote
              resource={resource}
              loading={options.loading ?? null}
              delayLoading={options.delayLoading}
              remoteProps={props}
            />
          ) : resource.Hydrate ? (
            React.createElement(resource.Hydrate, props)
          ) : (
            React.createElement(
              resource.Lazy,
              props as React.Attributes &
                React.ComponentProps<typeof resource.Lazy>,
            )
          )}
        </Suspense>
      </RemoteBoundary>
    );
  };
}

/** Inject the existing router-aware or router-free Bridge renderer at the entry point. */
export function createReactRemoteConsumers(
  RemoteApp: React.ComponentType<RemoteAppWrapperProps>,
  useEnvironment: UseRemoteEnvironment,
): { createReactRemote: CreateReactRemote; ReactRemote: ReactRemoteComponent } {
  function createReactRemote<P extends object = Record<string, unknown>>(
    options: CreateReactRemoteOptions,
  ): React.ComponentType<P> {
    return createConsumer<P>(() => options, RemoteApp, useEnvironment);
  }
  function ReactRemote<P extends object = Record<string, unknown>>({
    props,
    ...options
  }: ReactRemoteProps<P>) {
    const current = useRef(options);
    current.current = options;
    const Component = useMemo(
      () => createConsumer<P>(() => current.current, RemoteApp, useEnvironment),
      [],
    );
    return <Component {...(props as P)} />;
  }
  return {
    createReactRemote: createReactRemote as CreateReactRemote,
    ReactRemote: ReactRemote as ReactRemoteComponent,
  };
}

interface BrowserEnvironment {
  target: 'browser';
  instanceId?: string;
  serverBridge?: {
    moduleName: string;
    remote: CreateReactRemoteOptions['remote'];
  };
  ClientOnlyRemote: React.ComponentType<any>;
}
interface ServerEnvironment {
  target: 'server';
  instanceId: string;
  serverBridge?: never;
  ClientOnlyRemote: React.ComponentType<any>;
  skip: () => void;
  fail: (error: unknown) => void;
  wait: <T>(promise: Promise<T>) => Promise<T>;
  prepareBridge: (
    id: string,
    loadProvider: NonNullable<RemoteAppWrapperProps['loadProvider']>,
    match?: RemoteMatch,
  ) => Promise<BridgeProviderInstance | undefined>;
}
export type RemoteEnvironment = BrowserEnvironment | ServerEnvironment;
export type UseRemoteEnvironment = (
  getOptions: () => CreateReactRemoteOptions,
  attempt: number,
  instance: ModuleFederation | null | undefined,
) => RemoteEnvironment;
