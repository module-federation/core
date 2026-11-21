import React, { Suspense, useEffect, useState } from 'react';
import { getInstance } from '@module-federation/modern-js-v3/runtime';
import {
  createLazyComponent,
  createRemoteAppComponent,
  collectSSRAssets,
  autoFetchDataPlugin,
} from '@module-federation/bridge-react/base';
import helpers from '@module-federation/runtime/helpers';

const initialized = new WeakSet<object>();

type Module = Record<string, any> & { [key: symbol]: string };
type Options = {
  id?: string;
  loader?: () => Promise<Module>;
  export?: string;
  noSSR?: boolean;
  loading?: React.ReactNode;
};
type Descriptor = {
  type: 'app' | 'component';
  data: boolean;
  id: string;
  source: 'snapshot' | 'manifest';
};

class Boundary extends React.Component<
  { children: React.ReactNode },
  { error?: Error }
> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <pre role="alert">{this.state.error.message}</pre>
    ) : (
      this.props.children
    );
  }
}
function ClientOnly({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : loading;
}

// Demo prototype, not a new public bridge-react API.
export function createReactRemote(options: Options) {
  if (!options.loader && !options.id)
    throw new Error('id or loader is required');
  const instance = getInstance()!;
  if (!initialized.has(instance)) {
    instance.registerPlugins([autoFetchDataPlugin()]);
    initialized.add(instance);
  }
  const exportName = options.export || 'default';
  let modulePromise: Promise<Module> | undefined;
  const load = () =>
    (modulePromise ||= Promise.resolve().then(async () => {
      // loader is authoritative, including when id points at a different expose.
      const module = options.loader
        ? await options.loader()
        : await instance.loadRemote<Module>(options.id!);
      if (!module) throw new Error('Remote module is empty');
      return module;
    }));

  function readDescriptor(
    id: string,
    snapshot: any,
    expose: string,
    source: Descriptor['source'],
  ): Descriptor {
    const name = expose.replace(/^\.\//, '');
    const type = snapshot?.reactExposes?.[name]?.[exportName]?.type;
    if (type !== 'app' && type !== 'component')
      throw new Error(`Missing React expose metadata: ${id}#${exportName}`);
    return {
      type,
      id,
      source: snapshot.reactMetadataSource || source,
      data: snapshot.modules.some((m: any) => m.moduleName === `${name}.data`),
    };
  }
  function match(id: string) {
    const result = helpers.utils.matchRemoteWithNameAndExpose(
      instance.options.remotes,
      id,
    );
    if (!result) throw new Error(`Unknown remote: ${id}`);
    return result;
  }
  function known(id: string): Descriptor | undefined {
    const { remote, expose } = match(id);
    const { remoteSnapshot } =
      instance.snapshotHandler.getGlobalRemoteInfo(remote);
    if (!remoteSnapshot || !('modules' in remoteSnapshot)) return;
    return readDescriptor(id, remoteSnapshot, expose, 'snapshot');
  }
  async function resolve(id: string) {
    const cached = known(id);
    if (cached) return cached;
    const { remote, expose } = match(id);
    const { remoteSnapshot } =
      await instance.snapshotHandler.loadRemoteSnapshotInfo({
        moduleInfo: remote,
        id,
      });
    return readDescriptor(id, remoteSnapshot, expose, 'manifest');
  }
  function adapter(descriptor: Descriptor): React.ComponentType<any> {
    let Selected: React.ComponentType<any>;
    if (descriptor.type === 'app') {
      Selected = createRemoteAppComponent({
        loader: load,
        export: exportName,
        loading: null,
        fallback: ({ error }) => <pre role="alert">{String(error)}</pre>,
      });
    } else if (descriptor.data) {
      Selected = createLazyComponent({
        instance,
        loader: async () => {
          // Re-register request-local data getters even when the module is cached.
          const { remote } = match(descriptor.id);
          await instance.snapshotHandler.loadRemoteSnapshotInfo({
            moduleInfo: remote,
            id: descriptor.id,
          });
          return load();
        },
        export: exportName,
        noSSR: options.noSSR,
        loading: options.loading,
        fallback: ({ error }) => <pre role="alert">{error.message}</pre>,
      });
    } else {
      Selected = React.lazy(async () => {
        const module = await load();
        const Component = module[exportName];
        return {
          default: (props: any) => (
            <>
              {globalThis.FEDERATION_SSR &&
                collectSSRAssets({ id: descriptor.id, instance })}
              <Component {...props} />
            </>
          ),
        };
      });
    }
    return function Adapter(props) {
      return (
        <section data-kind={descriptor.type} data-source={descriptor.source}>
          <small>
            {descriptor.type}
            {descriptor.data ? ' + DataLoader' : ''} · {descriptor.source}
          </small>
          {descriptor.type === 'app' ? (
            <ClientOnly loading={options.loading}>
              <Selected {...props} />
            </ClientOnly>
          ) : (
            <Selected {...props} />
          )}
        </section>
      );
    };
  }
  // Never use id to choose a renderer when a loader was supplied.
  const descriptor =
    !options.loader && options.id ? known(options.id) : undefined;
  const Entry = descriptor
    ? adapter(descriptor)
    : React.lazy(async () => {
        let id = options.id;
        if (options.loader) {
          const module = await load();
          id = module[Symbol.for('mf_module_id')];
          if (!id) throw new Error('loader result is missing mf_module_id');
        }
        return { default: adapter(await resolve(id!)) };
      });
  return function Remote(props: Record<string, unknown>) {
    const content = (
      <Boundary>
        <Suspense fallback={options.loading}>
          <Entry {...props} />
        </Suspense>
      </Boundary>
    );
    return options.noSSR ? (
      <ClientOnly loading={options.loading}>{content}</ClientOnly>
    ) : (
      content
    );
  };
}
