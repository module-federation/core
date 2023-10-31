export type Position = import('acorn').Position;
export type RealDependencyLocation =
  import('../Dependency').RealDependencyLocation;
export type SourcePosition = import('../Dependency').SourcePosition;
export type ObjectDeserializerContext =
  import('./serialization').ObjectDeserializerContext;
export type ObjectSerializerContext =
  import('./serialization').ObjectSerializerContext;
export type WebpackObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext & {
    writeLazy?: (value: any) => void;
  };
