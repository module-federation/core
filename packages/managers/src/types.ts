import { WebpackOptionsNormalized } from 'webpack';
import { sharePlugin } from '@module-federation/sdk';

export type EntryStaticNormalized = Awaited<
  ReturnType<Extract<WebpackOptionsNormalized['entry'], () => any>>
>;

export type EntryDescriptionNormalized =
  EntryStaticNormalized[keyof EntryStaticNormalized];

export type ContainerOptionsFormat<T> =
  | (string | Record<string, string | string[] | T>)[]
  | Record<string, string | string[] | T>;
export type NormalizeSimple<R> = (value: string | string[], key: string) => R;
export type NormalizeOptions<T, R> = (value: T, key: string) => R;
export type ProcessFN<R> = (key: string, normalizedOptions: R) => void;
export type ParsedContainerOptions<T> = [string, T][];

export type NormalizedSharedOption = {
  name: string;
  version: string;
} & sharePlugin.SharedConfig;

export interface NormalizedSharedOptions {
  [depName: string]: NormalizedSharedOption;
}
