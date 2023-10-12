import { getModule, loadAndInitializeRemote } from '@module-federation/core';

export interface ModuleOptions {
  name: string;
  url: string;
  modulePath: string;
}

export default async function useDynamicModule({
  name,
  url,
  modulePath,
}: ModuleOptions): Promise<{ default: any }> {
  const remoteContainer = await loadAndInitializeRemote({ global: name, url });
  return (
    (await getModule({
      remoteContainer,
      modulePath,
    })) ?? {
      // todo: not sure this gonna work with React.lazy, but swallow the error here would be a mistake, imho
      default: undefined,
    }
  );
}
