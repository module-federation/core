import { AutoSchema } from 'auto-schema';

// Resolvers for the "dependency" field
export class Dependency extends AutoSchema {
  moduleId: (parent: any) => parent.moduleId,
  module: (parent: any, args: any, context: any) => {
    // Get the module with the specified ID from the stats object
    const statsObject = getStatsObject(context.statsFile);
    const module = statsObject.modules.find((m: any) => m.id === parent.moduleId);
    return module;
  },
  moduleIdentifier: (parent: any) => parent.moduleIdentifier,
  moduleName: (parent: any) => parent.moduleName,
  loc: (parent: any) => parent.loc,
  name: (parent: any) => parent.name,
  dependency: (parent: any) => parent.dependency,
};

