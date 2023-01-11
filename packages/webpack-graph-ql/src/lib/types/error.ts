export type ErrorWarningTraceItem = {
  originIdentifier: string;
  originName: string;
  moduleIdentifier: string;
  moduleName: string;
  dependencies: DependencyData[];
  originId: number;
  moduleId: number;
};

type ErrorWarningData = {
  moduleIdentifier: string;
  moduleName: string;
  loc: string;
  message: string;
  moduleId: number;
  moduleTrace: ErrorWarningTraceItem[];
  details: string;
  stack: string;
};

// Resolvers for the "error" field
export class WebpackModuleError {

  static name: string = "Error";
  
  @returns(String) message: string;
  @returns(String) moduleId: string;
  @returns(String) moduleIdentifier: string;
  @returns(String) moduleName: string;
  @returns("Int") loc: number;
  @returns(String) name: string;
  @returns(String) error: string;

  // TODO make this use a static method of Module class, cache modules on
  // Module
  @returns(Module)
  get module(): Module {
    return Module.findById(this.moduleId);
  }

  constructor(errorData: ErrorData) {
    Object.assign(this, errorData);
  }

};

