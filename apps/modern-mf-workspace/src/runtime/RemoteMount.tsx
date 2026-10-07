import React, { useEffect, useRef, useState } from 'react';
import {
  loadRemote,
  registerRemotes,
} from '@module-federation/modern-js-v3/runtime';
import type { Json, ToolDeclaration } from '../../shared/contracts';
import type { RemoteContext, RemoteRuntime } from '../remotes/types';
import type { ResolvedApplication } from './discovery';
import { ToolRegistry } from './tools';

interface BridgeProvider {
  render(props: Record<string, unknown>): Promise<void>;
  destroy(props: { dom: HTMLElement; moduleName: string }): void;
}
let mountSequence = 0;
export const applicationKey = (app: ResolvedApplication) =>
  `${app.context.endpoint}:${app.context.consumerKey}:${app.context.sid}:${app.provider.name}:${app.basename}`;
interface Props {
  application: ResolvedApplication;
  path: string;
  registry: ToolRegistry;
  navigate(path: string, signal?: AbortSignal): Promise<void>;
  renderNested(path: string, props?: Record<string, Json>): React.ReactNode;
  trace(event: string, detail?: unknown): void;
  extra?: Record<string, Json>;
}
export function RemoteMount(props: Props) {
  const { application: app, registry } = props;
  const dom = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const update = useRef<() => Promise<void>>();
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const [mountId, setMountId] = useState('');
  useEffect(() => {
    let disposed = false;
    const lifetime = new AbortController();
    let rendering = false;
    let renderQueue = Promise.resolve();
    let destroyed = false;
    let instance: BridgeProvider | undefined;
    const element = dom.current!;
    const disposers = new Set<() => void>();
    const moduleName = `${app.provider.name}/App`;
    const context: RemoteContext = {
      mountId: `mount${++mountSequence}`,
      endpoint: app.context.endpoint,
      consumerKey: app.context.consumerKey,
      sid: app.context.sid,
      basename: app.basename,
      providerName: app.provider.name,
      version: app.provider.version,
      props: { ...app.context.props, ...app.props },
    };
    setMountId(context.mountId);
    const assertActive = () => {
      if (disposed) throw new Error('TOOL_INSTANCE_EXPIRED: 页面已卸载');
    };
    const routeId = app.context.routes.find(
      (route) => route.bindingId === app.binding.id,
    )?.id;
    const declared: ToolDeclaration[] = app.context.capabilities
      .filter((capability) =>
        capability.target.kind === 'self'
          ? app.context.provider?.name === app.provider.name
          : capability.target.routeId === routeId,
      )
      .flatMap((capability) => capability.tools ?? []);
    const runtime: RemoteRuntime = {
      registerTools: (_context, definitions) => {
        if (disposed) return () => {};
        if (_context.mountId !== context.mountId)
          throw new Error('工具不能注册到其他挂载实例');
        const dispose = registry.register(context, definitions, declared);
        disposers.add(dispose);
        return () => {
          dispose();
          disposers.delete(dispose);
        };
      },
      navigate: async (path, signal) => {
        assertActive();
        const navigationSignal = signal
          ? AbortSignal.any([signal, lifetime.signal])
          : lifetime.signal;
        navigationSignal.throwIfAborted();
        const url = new URL(path, location.origin);
        if (
          url.origin !== location.origin ||
          (url.pathname !== context.basename &&
            !url.pathname.startsWith(`${context.basename}/`))
        )
          throw new Error('远程页面不能跳出自己的挂载范围');
        await latest.current.navigate(path, navigationSignal);
        assertActive();
      },
      renderNested: (path, extra) =>
        disposed ? null : latest.current.renderNested(path, extra),
      trace: (event, detail) => {
        if (!disposed) latest.current.trace(event, detail);
      },
    };
    const destroy = () => {
      if (!instance || destroyed || rendering) return;
      destroyed = true;
      const previous = instance;
      queueMicrotask(() => previous.destroy({ dom: element, moduleName }));
    };
    const performRender = async () => {
      if (disposed || !instance) return;
      rendering = true;
      const current = latest.current;
      try {
        await instance.render({
          ...current.extra,
          dom: element,
          moduleName,
          basename: app.basename,
          context,
          runtime,
          version: app.provider.version,
          path: current.path,
          productId:
            new URL(current.path, location.origin).searchParams.get(
              'product',
            ) ?? current.extra?.productId,
        });
      } finally {
        rendering = false;
        if (disposed) destroy();
      }
    };
    const render = () => {
      renderQueue = renderQueue.catch(() => {}).then(performRender);
      return renderQueue;
    };
    update.current = render;
    setError('');
    setReady(false);
    props.trace('mf.load', {
      provider: app.provider,
      mountId: context.mountId,
    });
    void (async () => {
      registerRemotes([
        {
          name: app.provider.name,
          entry: new URL(app.provider.entry, location.origin).href,
        },
      ]);
      const module = await loadRemote<{ default: () => BridgeProvider }>(
        moduleName,
      );
      if (disposed) return;
      if (!module?.default) throw new Error('远程应用没有导出 Bridge provider');
      instance = module.default();
      await render();
      if (disposed) return;
      setReady(true);
      props.trace('mf.mount', {
        provider: app.provider.name,
        basename: app.basename,
        mountId: context.mountId,
        sid: app.context.sid,
      });
    })().catch((error) => {
      if (!disposed) {
        setError(String(error));
        props.trace('mf.error', String(error));
      }
    });
    return () => {
      disposed = true;
      lifetime.abort();
      update.current = undefined;
      disposers.forEach((dispose) => dispose());
      disposers.clear();
      destroy();
      props.trace('mf.unmount', {
        mountId: context.mountId,
        provider: app.provider.name,
      });
    };
  }, [applicationKey(app), retry]);
  useEffect(() => {
    if (ready)
      void update.current?.().catch((error) => setError(String(error)));
  }, [props.path, JSON.stringify(props.extra), ready]);
  return (
    <div
      className="remote-mount"
      data-provider={app.provider.name}
      data-mount-id={mountId}
    >
      {!ready && !error && (
        <div className="loading">
          <span className="spinner" /> 正在加载 {app.binding.title}…
        </div>
      )}
      {error && (
        <div className="error-state">
          <strong>页面加载失败</strong>
          <p>{error}</p>
          <button onClick={() => setRetry((value) => value + 1)}>
            重新加载
          </button>
        </div>
      )}
      <div ref={dom} />
    </div>
  );
}
