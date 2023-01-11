import { AutoSchema } from './auto-schema';

type WarningData = {
  message: string;
  moduleId: string;
  moduleIdentifier: string;
  moduleName: string;
  loc: string;
  name: string;
  warning: string;
};

// Resolvers for the "warning" field
export class Warning extends AutoSchema {

  @returns(String) message: string;
  @returns(String) moduleId: string;
  @returns(String) moduleIdentifier: string;
  @returns(String) moduleName: string;
  @returns(String) loc: string;
  @returns(String) name: string;
  @returns(String) warning: string;

  @returns(Module)
  get module(parent: any, args: any, context: any): Module {
    // Get the module with the specified ID from the stats object
    return Stats.fromFile(context.statsFile)
      .modules
      .find((m:any) => m.id === parent.moduleId);
  }

  static from(warningData: WarningData) {
    return new this(warningData);
  }
  
  constructor(warningData: WarningData) {
    Object.assign(this, warningData);
  }

};

