export class FallbackDependency extends Dependency {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {FallbackDependency} deserialize fallback dependency
   */
  static deserialize(context: ObjectDeserializerContext): FallbackDependency;
  /**
   * @param {string[]} requests requests
   */
  constructor(requests: string[]);
  requests: string[];
}
declare namespace FallbackDependency {
  export { ObjectDeserializerContext, ObjectSerializerContext };
}
