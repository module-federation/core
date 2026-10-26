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
  helpers,
  type ModuleFederation,
} from '@module-federation/enhanced/runtime';
import type { DataFetchParams } from './lazy/types';
import { createLazyComponent } from './lazy/createLazyComponent';
import { autoFetchDataPlugin } from './lazy';

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
  const matched = helpers.utils.matchRemoteWithNameAndExpose(
    instance.options.remotes,
    id,
  );
  if (!matched) throw new Error(`Remote '${id}' is not registered.`);
  const { remote, expose } = matched;
  const hasManifest =
    !('entry' in remote) || /\.json(?:[?#]|$)/.test(remote.entry);
  const snapshot = hasManifest
    ? (
        await instance.snapshotHandler.loadRemoteSnapshotInfo({
          moduleInfo: remote,
          id,
        })
      ).remoteSnapshot
    : undefined;
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

function BridgeMount({
  load,
  instance,
  id,
  loading,
  remoteProps,
}: {
  load: () => Promise<Namespace>;
  instance: ModuleFederation;
  id: string;
  loading?: React.ReactNode;
  remoteProps: object;
}) {
  const dom = useRef<HTMLDivElement>(null);
  const latest = useRef(remoteProps);
  latest.current = remoteProps;
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
            const info = { ...latest.current, moduleName: id, dom: element };
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
  }, [remoteProps]);
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

function createConsumer<P extends object>(
  getOptions: () => CreateReactRemoteOptions,
) {
  return function RemoteConsumer(props: P) {
    const options = getOptions();
    const instance = options.instance || getInstance();
    const [attempt, setAttempt] = useState(0);
    const retry = useCallback(() => setAttempt((value) => value + 1), []);
    const paramsKey = JSON.stringify(options.dataFetchParams);
    const Lazy = useMemo(
      () =>
        React.lazy<React.ComponentType<P>>(async () => {
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
          const protocol = await resolveProtocol(instance, id, options.render);
          const load = () =>
            (loaded ||= instance
              .loadRemote(id)
              .then((value) => namespace(value, id)));
          if (protocol === 'bridge') {
            if (options.exportName && options.exportName !== 'default')
              throw new Error(
                'Bridge exposes use the default provider export.',
              );
            return {
              default: (businessProps: P) => (
                <BridgeMount
                  load={load}
                  instance={instance}
                  id={id}
                  loading={getOptions().loading}
                  remoteProps={businessProps}
                />
              ),
            };
          }
          const Component = createLazyComponent({
            loader: load,
            instance,
            export: options.exportName || 'default',
            loading: options.loading ?? null,
            fallback: ({ error }: { error: Error }) => {
              throw error;
            },
            noSSR: options.noSSR,
            dataFetchParams: options.dataFetchParams,
            injectScript: options.injectScript,
            injectLink: options.injectLink,
            delayLoading: options.delayLoading,
          });
          return { default: Component as React.ComponentType<P> };
        }),
      [
        instance,
        options.remote,
        options.render,
        options.exportName,
        options.noSSR,
        options.injectScript,
        options.injectLink,
        paramsKey,
        attempt,
      ],
    );
    if (options.noSSR && typeof window === 'undefined')
      return <>{options.loading}</>;
    return (
      <RemoteBoundary
        key={attempt}
        resource={Lazy}
        fallback={options.fallback}
        retry={retry}
      >
        <Suspense fallback={options.loading ?? null}>
          {React.createElement(
            Lazy as unknown as React.ComponentType<P>,
            props as React.Attributes & P,
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
