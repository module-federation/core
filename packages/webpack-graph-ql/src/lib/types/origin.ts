import { AutoSchema } from './auto-schema';
import { Module, ModuleData } from './module';

type OriginData = {
  moduleId: string;
  moduleIdentifier: string;
  moduleName: string;
  loc: number;
  name: number;
};

export class Origin extends AutoSchema {

  @returns(String) moduleId: string;
  @returns(String) moduleIdentifier: string;
  @returns(String) moduleName: string;
  @returns(String) loc: number;
  @returns(String) name: string;

  @returns(Module)  
  get module(parent:any, args:any, context:any): Module {
    return Module.findById(this.moduleId);
  }

  static from(originData: OriginData) {
    return new this(originData);
  }

  constructor(originData: OriginData) {
    Object.assign(this, originData);
  }

};
