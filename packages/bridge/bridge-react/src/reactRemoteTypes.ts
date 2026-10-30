import type * as React from 'react';
import type { ModuleFederation } from '@module-federation/enhanced/runtime';
import type { RemoteModuleMap } from '@module-federation/sdk';
import type { DataFetchParams } from './lazy/types';
import type { BridgeProvider, ProviderParams } from './types';

export type RemoteSource = string | (() => unknown);

export interface ReactRemoteErrorInfo {
  error: Error;
  retry: () => void;
}

export interface CreateReactRemoteOptions<
  Source extends RemoteSource = RemoteSource,
  Export extends string = string,
> {
  /** A registered remote ID, or a thunk returning a namespace or its component. */
  remote: Source;
  instance?: ModuleFederation | null;
  exportName?: Export;
  render?: 'component' | 'bridge';
  loading?: React.ReactNode;
  fallback?: (info: ReactRemoteErrorInfo) => React.ReactNode;
  noSSR?: boolean;
  dataFetchParams?: DataFetchParams;
  injectScript?: boolean;
  injectLink?: boolean;
  delayLoading?: number;
  basename?: string;
  memoryRoute?: ProviderParams['memoryRoute'];
  navigation?: ProviderParams['navigation'];
}

type RemoteModule<Source extends RemoteSource> = Source extends string
  ? Source extends keyof RemoteModuleMap
    ? RemoteModuleMap[Source]
    : unknown
  : Source extends () => infer Result
    ? NonNullable<Awaited<Result>>
    : never;

type ExportProps<Value> =
  Value extends BridgeProvider<infer Props>
    ? Props
    : Value extends React.JSXElementConstructor<infer Props>
      ? Props
      : Value extends React.ExoticComponent<infer Props>
        ? Props
        : never;

export type RemoteExportName<Source extends RemoteSource> =
  unknown extends RemoteModule<Source>
    ? string
    : [ExportProps<RemoteModule<Source>>] extends [never]
      ? Extract<
          {
            [Key in keyof RemoteModule<Source>]: Key extends 'default'
              ? [ExportProps<RemoteModule<Source>[Key]>] extends [never]
                ? never
                : Key
              : RemoteModule<Source>[Key] extends BridgeProvider<unknown>
                ? never
                : [ExportProps<RemoteModule<Source>[Key]>] extends [never]
                  ? never
                  : Key;
          }[keyof RemoteModule<Source>],
          string
        >
      : 'default';

export type InferRemoteProps<
  Source extends RemoteSource,
  Export extends string = 'default',
> =
  unknown extends RemoteModule<Source>
    ? Record<string, unknown>
    : Export extends keyof RemoteModule<Source>
      ? ExportProps<RemoteModule<Source>[Export]>
      : Export extends 'default'
        ? ExportProps<RemoteModule<Source>>
        : never;

type NoInference<Value> = [Value][Value extends unknown ? 0 : never];

type PropsField<Props> =
  Record<never, never> extends Props ? { props?: Props } : { props: Props };

export type ReactRemoteProps<Props extends object = Record<string, unknown>> =
  CreateReactRemoteOptions & PropsField<Props>;

/** Explicit Props are used when Source stays at its wide default. */
type ConsumerProps<
  Props extends object,
  Source extends RemoteSource,
  Export extends string,
> = RemoteSource extends Source ? Props : InferRemoteProps<Source, Export>;

/** Explicit Props preserve the full options type, including a dynamic export name. */
type DefaultRemoteExport<Source extends RemoteSource> =
  RemoteSource extends Source
    ? RemoteExportName<Source>
    : Extract<'default', RemoteExportName<Source>>;

/** Shared callable contract for Core and framework adapters. */
export interface CreateReactRemote {
  <
    Props extends object = Record<string, unknown>,
    Source extends RemoteSource = RemoteSource,
    Export extends RemoteExportName<Source> = DefaultRemoteExport<Source>,
  >(
    options: CreateReactRemoteOptions<Source, Export>,
  ): React.ComponentType<ConsumerProps<Props, Source, Export>>;
}

export interface ReactRemoteComponent {
  <
    Props extends object = Record<string, unknown>,
    Source extends RemoteSource = RemoteSource,
    Export extends RemoteExportName<Source> = DefaultRemoteExport<Source>,
  >(
    options: CreateReactRemoteOptions<Source, Export> &
      PropsField<ConsumerProps<NoInference<Props>, Source, Export>>,
  ): React.ReactElement | null;
}
