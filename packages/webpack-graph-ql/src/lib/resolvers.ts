const fs = require('fs');

// A helper function to read and parse the stats file
function getStatsObject(statsFile:any) {
  const stats = fs.readFileSync(statsFile, 'utf8');
  return JSON.parse(stats);
}

// The root query resolver
const Query = {
  stats: (parent:any, args:any, context:any) => {
    // Read and parse the stats file
    const statsObject = getStatsObject(context.statsFile);

    // Return the stats object
    return statsObject;
  },
};

// Resolvers for the "assets" field
const Assets = {
  name: (parent: any) => parent.name,
  size: (parent: any) => parent.size,
  chunkNames: (parent: any) => parent.chunkNames,
};

// Resolvers for the "chunks" field
const Chunks = {
  id: (parent: any) => parent.id,
  names: (parent: any) => parent.names,
  modules: (parent: any) => parent.modules,
  origins: (parent: any) => parent.origins,
};

// Resolvers for the "module" field
const Module = {
  id: (parent: any) => parent.id,
  identifier: (parent: any) => parent.identifier,
  name: (parent: any) => parent.name,
  size: (parent: any) => parent.size,
  cacheable: (parent: any) => parent.cacheable,
  built: (parent: any) => parent.built,
  optional: (parent: any) => parent.optional,
  prefetched: (parent: any) => parent.prefetched,
  chunkIds: (parent: any) => parent.chunkIds,
  chunks: (parent: any) => parent.chunks,
  issuer: (parent: any) => parent.issuer,
  issuerId: (parent: any) => parent.issuerId,
  issuerName: (parent: any) => parent.issuerName,
  profile: (parent: any) => parent.profile,
  failed: (parent: any) => parent.failed,
  errors: (parent: any) => parent.errors,
  warnings: (parent: any) => parent.warnings,
  reasons: (parent: any) => parent.reasons,
  usedExports: (parent: any) => parent.usedExports,
  providedExports: (parent: any) => parent.providedExports,
  depth: (parent: any) => parent.depth,
  source: (parent: any) => parent.source,
  index: (parent: any) => parent.index,
};

// Resolvers for the "origin" field
const Origin = {
  moduleId: (parent: any) => parent.moduleId,
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
};
// Resolvers for the "error" field
const Error = {
  message: (parent: any) => parent.message,
  moduleId: (parent: any) => parent.moduleId,
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
  error: (parent: any) => parent.error,
};

// Resolvers for the "warning" field
const Warning = {
  message: (parent: any) => parent.message,
  moduleId: (parent: any) => parent.moduleId,
  module: (parent: any, args: any, context: any) => {
    // Get the module with the specified ID from the stats object
    const statsObject = getStatsObject(context.statsFile);
    const module = statsObject.modules.find((m:any) => m.id === parent.moduleId);
    return module;
  },
  moduleIdentifier: (parent: any) => parent.moduleIdentifier,
  moduleName: (parent: any) => parent.moduleName,
  loc: (parent: any) => parent.loc,
  name: (parent: any) => parent.name,
  warning: (parent: any) => parent.warning,
};


// Resolvers for the "reason" field
const Reason = {
  moduleId: (parent: any) => parent.moduleId,
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

// Resolvers for the "dependency" field
const Dependency = {
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

// Resolvers for the "children" field
const Children = {
  id: (parent: any) => parent.id,
  identifier: (parent: any) => parent.identifier,
  name: (parent: any) => parent.name,
  size: (parent: any) => parent.size,
  cacheable: (parent: any) => parent.cacheable,
  built: (parent: any) => parent.built,
  optional: (parent: any) => parent.optional,
  prefetched: (parent: any) => parent.prefetched,
  chunkIds: (parent: any) => parent.chunkIds,
  chunks: (parent: any) => parent.chunks,
  issuer: (parent: any) => parent.issuer,
  issuerId: (parent: any) => parent.issuerId,
  issuerName: (parent: any) => parent.issuerName,
  profile: (parent: any) => parent.profile,
  failed: (parent: any) => parent.failed,
  errors: (parent: any) => parent.errors,
  warnings: (parent: any) => parent.warnings,
  reasons: (parent: any) => parent.reasons,
  usedExports: (parent: any) => parent.usedExports,
  providedExports: (parent: any) => parent.providedExports,
  depth: (parent: any) => parent.depth,
  source: (parent: any) => parent.source,
  index: (parent: any) => parent.index,
};



// Resolvers for the "issuer" field
const Issuer = {
  id: (parent: any) => parent.id,
  identifier: (parent: any) => parent.identifier,
  name: (parent: any) => parent.name,
  size: (parent: any) => parent.size,
  cacheable: (parent: any) => parent.cacheable,
  built: (parent: any) => parent.built,
  optional: (parent: any) => parent.optional,
  prefetched: (parent: any) => parent.prefetched,
  chunkIds: (parent: any) => parent.chunkIds,
  chunks: (parent: any) => parent.chunks,
  issuer: (parent: any) => parent.issuer,
  issuerId: (parent: any) => parent.issuerId,
  issuerName: (parent: any) => parent.issuerName,
  profile: (parent: any) => parent.profile,
  failed: (parent: any) => parent.failed,
  errors: (parent: any) => parent.errors,
  warnings: (parent: any) => parent.warnings,
  reasons: (parent: any) => parent.reasons,
  usedExports: (parent: any) => parent.usedExports,
  providedExports: (parent: any) => parent.providedExports,
  depth: (parent: any) => parent.depth,
  source: (parent: any) => parent.source,
  index: (parent: any) => parent.index,
};



// The resolver map
export default {
  Query,
  Assets,
  Chunks,
  Module,
  Origin,
  Error,
  Warning,
  Reason,
  Dependency,
  Children,
  Issuer,
};
