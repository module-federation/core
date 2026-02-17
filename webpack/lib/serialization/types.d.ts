export type ComplexSerializableType =
  | undefined
  | null
  | number
  | string
  | boolean
  | Buffer
  | any
  | (() => ComplexSerializableType[] | Promise<ComplexSerializableType[]>);
export type PrimitiveSerializableType =
  | undefined
  | null
  | number
  | bigint
  | string
  | boolean
  | Buffer
  | (() => PrimitiveSerializableType[] | Promise<PrimitiveSerializableType[]>);
export type BufferSerializableType =
  | Buffer
  | (() => BufferSerializableType[] | Promise<BufferSerializableType[]>);
