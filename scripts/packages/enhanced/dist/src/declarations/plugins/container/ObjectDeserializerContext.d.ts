export type ObjectDeserializerContext = {
  read: () => any;
  setCircularReference: (arg0: any) => void;
};
