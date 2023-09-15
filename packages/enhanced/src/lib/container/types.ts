export type ContainerEntryDependency = {
    name: string;
    exposes: Record<string, string>;
    shareScope: string;
};
  
export type ContainerEntryModule = {
    _name: string;
    _exposes: [string, { import: string[], name: string }][];
    _shareScope: string;
};
  
export type ModuleFactoryResult = {
    module: ContainerEntryModule;
};

export interface ObjectSerializerContext {
    write: (data: any) => void;
    setCircularReference: (ref: any) => void;
    snapshot: () => any;
    rollback: (snapshot: any) => void;
  }

  export  interface ObjectDeserializerContext {
	read: () => any;
	setCircularReference: (arg0?: any) => void;
}

export interface LibIdentOptions {
    context?: any;
    request?: any;
}

