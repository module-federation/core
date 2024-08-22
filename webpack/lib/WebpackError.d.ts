export = WebpackError;
/** @typedef {import("./Chunk")} Chunk */
/** @typedef {import("./Dependency").SyntheticDependencyLocation} SyntheticDependencyLocation */
/** @typedef {import("./Dependency").RealDependencyLocation} RealDependencyLocation */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class WebpackError extends Error {
  /**
   * Creates an instance of WebpackError.
   */
  constructor(message?: string);
  /** @type {string | undefined} */
  details?: string;
  /** @type {Module | undefined | null} */
  module?: null | Module;
  /** @type {SyntheticDependencyLocation | RealDependencyLocation | undefined} */
  loc?: SyntheticDependencyLocation | RealDependencyLocation;
  /** @type {boolean | undefined} */
  hideStack?: boolean;
  /** @type {Chunk | undefined} */
  chunk?: Chunk;
  /** @type {string | undefined} */
  file?: string;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize(__0: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
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
declare namespace WebpackError {
  export {
    Chunk,
    SyntheticDependencyLocation,
    RealDependencyLocation,
    Module,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
type Module = import('./Module');
type SyntheticDependencyLocation =
  import('./Dependency').SyntheticDependencyLocation;
type RealDependencyLocation = import('./Dependency').RealDependencyLocation;
type Chunk = import('./Chunk');
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
