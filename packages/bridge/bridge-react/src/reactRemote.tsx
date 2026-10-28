import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  getInstance,
  type ModuleFederation,
} from '@module-federation/enhanced/runtime';
import type { DataFetchParams } from './lazy/types';
import type { ProviderParams } from './types';
import { createLazyComponentResource } from './lazy/createLazyComponent';
import { autoFetchDataPlugin } from './lazy';
import { transformError, DelayedLoading } from './lazy/AwaitDataFetch';

export interface ReactRemoteErrorInfo {
  error: Error;
  retry: () => void;
}

export interface CreateReactRemoteOptions {
  /** A registered alias/expose, or a CSR loader returning an MF module namespace. */
  remote: string | (() => Promise<unknown>);
  instance?: ModuleFederation | null;
  exportName?: string;
  /** Compatibility hint for unmarked legacy modules. */
  render?: 'component' | 'bridge';
  loading?: React.ReactNode;
  fallback?: (info: ReactRemoteErrorInfo) => React.ReactNode;
  noSSR?: boolean;
  dataFetchParams?: DataFetchParams;
  injectScript?: boolean;
  injectLink?: boolean;
  delayLoading?: number;
  /** Consumer-owned application mount. Source route selection belongs to the framework. */
  basename?: string;
  memoryRoute?: ProviderParams['memoryRoute'];
  /** Framework router integration for this mount. Framework consumers supply it automatically. */
  navigation?: ProviderParams['navigation'];
}

export type ReactRemoteProps<P extends object = Record<string, unknown>> =
  CreateReactRemoteOptions & { props?: P };

type Namespace = Record<string, any> & { [key: symbol]: unknown };
type Provider = {
  render: (info: Record<string, unknown> & { dom: HTMLElement }) => unknown;
  destroy: (info: { dom: HTMLElement; moduleName: string }) => unknown;
};
const configured = new WeakSet<ModuleFederation>();
const moduleId = Symbol.for('mf_module_id');

const asError = (error: unknown) =>
  error instanceof Error ? error : new Error(String(error));
function namespace(value: unknown, id?: string): Namespace {
  if (!value || (typeof value !== 'object' && typeof value !== 'function'))
    throw new Error('A React remote must return an MF module namespace.');
  if (!id || (value as Namespace)[moduleId]) return value as Namespace;
  // Keep raw loadRemote exports unchanged, including frozen namespaces.
  return Object.defineProperty(
    Object.create(
      Object.getPrototypeOf(value),
      Object.getOwnPropertyDescriptors(value),
    ),
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
      load,
    };
  }
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
  return {
    render: metadata?.render || hint || 'component',
    recovered: undefined,
    load,
  };
}

function BridgeMount({
  load,
  instance,
  id,
  loading,
  remoteProps,
  basename,
  memoryRoute,
  navigation,
}: {
  load: () => Promise<Namespace>;
  instance: ModuleFederation;
  id: string;
  loading?: React.ReactNode;
  remoteProps: object;
  basename?: string;
  memoryRoute?: ProviderParams['memoryRoute'];
  navigation?: ProviderParams['navigation'];
}) {
  const dom = useRef<HTMLDivElement>(null);
  const latest = useRef({ remoteProps, basename, memoryRoute, navigation });
  latest.current = { remoteProps, basename, memoryRoute, navigation };
  const ownerRef = useRef<{
    active: boolean;
    provider?: Provider;
    queue: Promise<unknown>;
    update: () => void;
  }>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error>();
  useEffect(() => {
    const element = dom.current!;
    let destroyed = false;
    const owner = {
      active: true,
      provider: undefined as Provider | undefined,
      queue: Promise.resolve() as Promise<unknown>,
      update: () => {
        owner.queue = owner.queue
          .then(async () => {
            if (!owner.active || !owner.provider) return;
            const { remoteProps: props, ...controls } = latest.current;
            // Undefined top-level options must not erase legacy routing props.
            for (const key of [
              'basename',
              'memoryRoute',
              'navigation',
            ] as const) {
              if (controls[key] === undefined) delete controls[key];
            }
            const info = {
              ...props,
              ...controls,
              moduleName: id,
              dom: element,
            };
            const context = {
              side: 'consumer' as const,
              framework: 'react' as const,
              operation: 'render' as const,
            };
            const extra =
              instance.bridgeHook?.lifecycle.beforeBridgeRender.emit(
                info,
                context,
              );
            await owner.provider.render({
              ...info,
              ...(extra as any)?.extraProps,
            });
            instance.bridgeHook?.lifecycle.afterBridgeRender.emit(info, {
              context,
            });
            if (owner.active) setReady(true);
          })
          .catch((failure) => {
            if (owner.active) setError(asError(failure));
          });
      },
    };
    ownerRef.current = owner;
    const destroy = async () => {
      if (destroyed || !owner.provider) return;
      destroyed = true;
      const info = { moduleName: id, dom: element };
      const context = {
        side: 'consumer' as const,
        framework: 'react' as const,
        operation: 'destroy' as const,
        reason: 'unmount' as const,
      };
      instance.bridgeHook?.lifecycle.beforeBridgeDestroy.emit(info, context);
      await owner.provider.destroy(info);
      instance.bridgeHook?.lifecycle.afterBridgeDestroy.emit(info, { context });
    };
    owner.queue = load()
      .then(async (module) => {
        if (!owner.active) return;
        if (typeof module.default !== 'function')
          throw new Error(
            `Bridge '${id}' must have a default provider export.`,
          );
        const provider = await module.default();
        if (
          !provider ||
          typeof provider.render !== 'function' ||
          typeof provider.destroy !== 'function'
        ) {
          throw new Error(
            `Bridge '${id}' must provide render and destroy methods.`,
          );
        }
        owner.provider = provider;
        if (!owner.active) await destroy();
      })
      .catch((failure) => {
        if (owner.active) setError(asError(failure));
      });
    owner.update();
    return () => {
      owner.active = false;
      void owner.queue.then(destroy).catch((failure) => console.error(failure));
    };
  }, [load, instance, id]);
  useEffect(() => {
    if (ownerRef.current?.provider) ownerRef.current.update();
  }, [remoteProps, basename, memoryRoute, navigation]);
  if (error) throw error;
  return (
    <>
      <div ref={dom} data-mf-bridge={id} />
      {!ready && loading}
    </>
  );
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

type PreparedRemote<P extends object> = {
  Component: React.ComponentType<P>;
  loadClient?: () => Promise<React.ComponentType<P>>;
};
type RemoteResource<P extends object> = {
  prepare: () => Promise<PreparedRemote<P>>;
};

function ClientOnlyRemote<P extends object>({
  resource,
  loading,
  delayLoading,
  remoteProps,
}: {
  resource: RemoteResource<P>;
  loading: React.ReactNode;
  delayLoading?: number;
  remoteProps: P;
}) {
  const [state, setState] = useState<{
    resource: RemoteResource<P>;
    Component?: React.ComponentType<P>;
    error?: Error;
  }>();
  const pending = useRef<{
    resource: RemoteResource<P>;
    promise: Promise<React.ComponentType<P>>;
  }>();
  useEffect(() => {
    let active = true;
    // Start work in the first effect, without waiting for a gate render or
    // mounting the legacy consumer's second client-loading effect.
    if (pending.current?.resource !== resource) {
      pending.current = {
        resource,
        promise: resource
          .prepare()
          .then((result) =>
            result.loadClient ? result.loadClient() : result.Component,
          ),
      };
    }
    const commit = (next: NonNullable<typeof state>) => {
      if (!active) return;
      // This effect belongs to the placeholder inside Suspense, so that
      // boundary has hydrated before preparation starts. No gate transition is
      // needed, and ready content can commit at the usual update priority.
      setState(next);
    };
    pending.current.promise.then(
      (Component) => commit({ resource, Component }),
      (error) =>
        commit({ resource, error: transformError(asError(error)).error }),
    );
    return () => {
      active = false;
    };
  }, [resource]);
  if (state?.resource !== resource)
    return (
      <DelayedLoading delayLoading={delayLoading}>{loading}</DelayedLoading>
    );
  if (state.error) throw state.error;
  const Component = state.Component!;
  return <Component {...remoteProps} />;
}

function createConsumer<P extends object>(
  getOptions: () => CreateReactRemoteOptions,
) {
  return function RemoteConsumer(props: P) {
    const options = getOptions();
    const instance = options.instance || getInstance();
    const [attempt, setAttempt] = useState(0);
    const retry = useCallback(() => setAttempt((value) => value + 1), []);
    const paramsKey = JSON.stringify(options.dataFetchParams);
    const resource = useMemo(() => {
      let prepared: Promise<PreparedRemote<P>> | undefined;
      const prepare = () =>
        (prepared ||= (async (): Promise<PreparedRemote<P>> => {
          if (!instance)
            throw new Error('An initialized MF runtime instance is required.');
          if (!configured.has(instance)) {
            instance.registerPlugins([autoFetchDataPlugin()]);
            configured.add(instance);
          }
          let id: string;
          let loaded: Promise<Namespace> | undefined;
          if (typeof options.remote === 'string') {
            id = options.remote;
          } else {
            if (typeof window === 'undefined') {
              throw new Error(
                'Use a remote alias/expose for automatic SSR protocol selection.',
              );
            }
            loaded = options.remote().then((value) => namespace(value));
            const module = await loaded;
            const identity = module[moduleId];
            if (typeof identity !== 'string')
              throw new Error(
                'The remote loader returned no MF module identity. Use a remote alias/expose.',
              );
            id = identity;
          }
          const selection = await resolveProtocol(instance, id, options.render);
          const protocol = selection.render;
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
            (loaded ||= selection.load().then((value) => namespace(value, id)));
          if (protocol === 'bridge') {
            if (options.exportName && options.exportName !== 'default')
              throw new Error(
                'Bridge exposes use the default provider export.',
              );
            return {
              Component: (businessProps: P) => (
                <BridgeMount
                  load={load}
                  instance={instance}
                  id={id}
                  loading={getOptions().loading}
                  remoteProps={businessProps}
                  basename={getOptions().basename}
                  memoryRoute={getOptions().memoryRoute}
                  navigation={getOptions().navigation}
                />
              ),
            };
          }
          const lazy = createLazyComponentResource({
            loader: load,
            instance,
            export: options.exportName || 'default',
            loading: options.loading ?? null,
            fallback: ({ error }: { error: Error }) => {
              // React error boundaries do not catch during server rendering.
              // Keep the lazy data/loader fallback in the server response.
              const fallback = getOptions().fallback;
              if (typeof window === 'undefined' && fallback) {
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
        })().catch((error) => {
          const fallback = getOptions().fallback;
          if (typeof window === 'undefined' && fallback) {
            return {
              Component: () => fallback({ error: asError(error), retry }),
            };
          }
          throw error;
        }));
      return {
        prepare,
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
          ) : (
            React.createElement(resource.Lazy, props as React.Attributes & P)
          )}
        </Suspense>
      </RemoteBoundary>
    );
  };
}

export function createReactRemote<P extends object = Record<string, unknown>>(
  options: CreateReactRemoteOptions,
): React.ComponentType<P> {
  return createConsumer<P>(() => options);
}

export function ReactRemote<P extends object = Record<string, unknown>>({
  props,
  ...options
}: ReactRemoteProps<P>) {
  const current = useRef(options);
  current.current = options;
  const Component = useMemo(() => createConsumer<P>(() => current.current), []);
  return <Component {...(props as P)} />;
}
