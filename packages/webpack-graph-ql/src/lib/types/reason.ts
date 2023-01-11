
// Resolvers for the "reason" field
export class Reason extends AutoSchema {
  @returns(String) moduleId: string;
  module: (parent:any, args:any, context:any) => {
    // Get the module with the specified ID from the stats object
    const statsObject = getStatsObject(context.statsFile);
    const module = statsObject.modules.find((m:any) => m.id === parent.moduleId);
    return module;
  },
  moduleIdentifier: (parent: any) => parent.moduleIdentifier,
  moduleName: (parent: any) => parent.moduleName,
  loc: (parent: any) => parent.loc,
  name: (parent: any) => parent.name,
  reason: (parent: any) => parent.reason,
};

