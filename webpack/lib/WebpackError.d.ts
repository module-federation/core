export = WebpackError;
/** @typedef {import("./Chunk")} Chunk */
/** @typedef {import("./Dependency").DependencyLocation} DependencyLocation */
/** @typedef {import("./Module")} Module */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("./serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class WebpackError extends Error {
  /** @type {string | undefined} */
  details: string | undefined;
  /** @type {Module | undefined | null} */
  module: Module | undefined | null;
  /** @type {DependencyLocation | undefined} */
  loc: DependencyLocation | undefined;
  /** @type {boolean | undefined} */
  hideStack: boolean | undefined;
  /** @type {Chunk | undefined} */
  chunk: Chunk | undefined;
  /** @type {string | undefined} */
  file: string | undefined;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize({ write }: ObjectSerializerContext): void;
  /**
   * @param {ObjectDeserializerContext} context context
   */
  deserialize({ read }: ObjectDeserializerContext): void;
  stack: string;
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
type Module = import('./Module');
type DependencyLocation = import('./Dependency').DependencyLocation;
type Chunk = import('./Chunk');
type ObjectSerializerContext =
  import('./serialization/ObjectMiddleware').ObjectSerializerContext;
type ObjectDeserializerContext =
  import('./serialization/ObjectMiddleware').ObjectDeserializerContext;
