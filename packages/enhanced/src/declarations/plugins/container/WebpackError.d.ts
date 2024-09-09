import type { Module } from 'webpack';

declare class WebpackError extends Error {
  /**
   * Creates an instance of WebpackError.
   */
  constructor(message?: string);
  details?: string;
  module?: null | Module;
  loc?: SyntheticDependencyLocation | RealDependencyLocation;
  hideStack?: boolean;
  chunk?: Chunk;
  file?: string;
  serialize(__0: ObjectSerializerContext): void;
  deserialize(__0: ObjectDeserializerContext): void;

  /**
   * Create .stack property on a target object
   */
  static captureStackTrace(
    targetObject: object,
    constructorOpt?: Function,
  ): void;

  /**
   * Optional override for formatting stack traces
   */
  static prepareStackTrace?: (
    err: Error,
    stackTraces: NodeJS.CallSite[],
  ) => any;
  static stackTraceLimit: number;
}
