export = Serializer;
declare class Serializer {
  constructor(middlewares: any, context: any);
  serializeMiddlewares: any;
  deserializeMiddlewares: any;
  context: any;
  serialize(obj: any, context: any): any;
  deserialize(value: any, context: any): any;
}
