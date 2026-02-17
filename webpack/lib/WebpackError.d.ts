export = WebpackError;
/** @typedef {import("./Chunk")} Chunk */
/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class WebpackError extends Error {
  [x: number]: () => string;
  /**
   * Creates an instance of WebpackError.
   * @param {string=} message error message
   * @param {{ cause?: unknown }} options error options
   */
  constructor(
    message?: string | undefined,
    options?: {
      cause?: unknown;
    },
  );
  /** @type {string=} */
  details: string | undefined;
  /** @type {(Module | null)=} */
  module: (Module | null) | undefined;
  /** @type {DependencyLocation=} */
  loc: DependencyLocation | undefined;
  /** @type {boolean=} */
  hideStack: boolean | undefined;
  /** @type {Chunk=} */
  chunk: Chunk | undefined;
  /** @type {string=} */
  file: string | undefined;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize({ write }: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize({ read }: ObjectDeserializerContext): void;
  cause: EXPECTED_ANY;
}
declare namespace WebpackError {
  export {
    Chunk,
    DependencyLocation,
    Module,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
type Chunk = import('./Chunk');
type DependencyLocation = import('./Dependency').DependencyLocation;
type Module = import('./Module');
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
