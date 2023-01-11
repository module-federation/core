export const args = (...argTypes: any) {
  return (target: any, key: any, descriptor: any) => {
    descriptor.value.argTypes = argTypes.map((argType: any) => {
      return typeof argType === "string" ? argType : argType.name;
    }
    return descriptor;
  }
}

export const returns = (returnType: any) {
  return (target: any, key: any, descriptor: any) => {
    if (Array.isArray(returnType)) {
      decriptor.value.returnType = typeof returnType[0] === "string"
        ? returnType[0]
        : returnType[0].name; 
    } else {
      descriptor.value.returnType = typeof returnType === "string"
        ? returnType
        : returnType.name;
    return descriptor;
  }
}
