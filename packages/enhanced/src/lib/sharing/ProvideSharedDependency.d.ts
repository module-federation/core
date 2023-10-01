export class ProvideSharedDependency extends Dependency {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ProvideSharedDependency} deserialize fallback dependency
   */
  static deserialize(
    context: ObjectDeserializerContext,
  ): ProvideSharedDependency;
  /**
   * @param {string} shareScope share scope
   * @param {string} name module name
   * @param {string | false} version version
   * @param {string} request request
   * @param {boolean} eager true, if this is an eager dependency
   */
  constructor(
    shareScope: string,
    name: string,
    version: string | false,
    request: string,
    eager: boolean,
  );
  shareScope: string;
  name: string;
  version: string | false;
  request: string;
  eager: boolean;
}
declare namespace ProvideSharedDependency {
  export { shareScope, ObjectDeserializerContext, ObjectSerializerContext };
}
export type ObjectDeserializerContext =
  import('webpack/lib/serialization/ObjectMiddleware').ObjectDeserializerContext;
declare let shareScope: any;
export type ObjectSerializerContext =
  import('webpack/lib/serialization/ObjectMiddleware').ObjectSerializerContext;
