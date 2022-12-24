const fs = require('fs');

// A helper function to read and parse the stats file
function getStatsObject(statsFile) {
  const stats = fs.readFileSync(statsFile, 'utf8');
  return JSON.parse(stats);
}

// The root query resolver
const Query = {
  stats: (parent, args, context) => {
    // Read and parse the stats file
    const statsObject = getStatsObject(context.statsFile);

    // Return the stats object
    return statsObject;
  },
};

// Resolvers for the "assets" field
const Assets = {
  name: (parent) => parent.name,
  size: (parent) => parent.size,
  chunkNames: (parent) => parent.chunkNames,
};

// Resolvers for the "chunks" field
const Chunks = {
  id: (parent) => parent.id,
  names: (parent) => parent.names,
  modules: (parent) => parent.modules,
  origins: (parent) => parent.origins,
};

// Resolvers for the "module" field
const Module = {
  id: (parent) => parent.id,
  identifier: (parent) => parent.identifier,
  name: (parent) => parent.name,
  size: (parent) => parent.size,
  cacheable: (parent) => parent.cacheable,
  built: (parent) => parent.built,
  optional: (parent) => parent.optional,
  prefetched: (parent) => parent.prefetched,
  chunkIds: (parent) => parent.chunkIds,
  chunks: (parent) => parent.chunks,
  issuer: (parent) => parent.issuer,
  issuerId: (parent) => parent.issuerId,
  issuerName: (parent) => parent.issuerName,
  profile: (parent) => parent.profile,
  failed: (parent) => parent.failed,
  errors: (parent) => parent.errors,
  warnings: (parent) => parent.warnings,
  reasons: (parent) => parent.reasons,
  usedExports: (parent) => parent.usedExports,
  providedExports: (parent) => parent.providedExports,
  depth: (parent) => parent.depth,
  source: (parent) => parent.source,
  index: (parent) => parent.index,
};

// Resolvers for the "origin" field
const Origin = {
  moduleId: (parent) => parent.moduleId,
  module: (parent, args, context) => {
    // Get the module with the specified ID from the stats object
    const statsObject = getStatsObject(context.statsFile);
    const module = statsObject.modules.find((m) => m.id === parent.moduleId);
    return module;
  },
  moduleIdentifier: (parent) => parent.moduleIdentifier,
  moduleName: (parent) => parent.moduleName,
  loc: (parent) => parent.loc,
  name: (parent) => parent.name,
};
// Resolvers for the "error" field
const Error = {
  message: (parent) => parent.message,
  moduleId: (parent) => parent.moduleId,
  module: (parent, args, context) => {
    // Get the module with the specified ID from the stats object
    const statsObject = getStatsObject(context.statsFile);
    const module = statsObject.modules.find((m) => m.id === parent.moduleId);
    return module;
  },
  moduleIdentifier: (parent) => parent.moduleIdentifier,
  moduleName: (parent) => parent.moduleName,
  loc: (parent) => parent.loc,
  name: (parent) => parent.name,
  error: (parent) => parent.error,
};

// Resolvers for the "warning" field
const Warning = {
  message: (parent) => parent.message,
  moduleId: (parent) => parent.moduleId,
  module: (parent, args, context) => {
    // Get the module with the specified ID from the stats object
    const statsObject = getStatsObject(context.statsFile);
    const module = statsObject.modules.find((m) => m.id === parent.moduleId);
    return module;
  },
  moduleIdentifier: (parent) => parent.moduleIdentifier,
  moduleName: (parent) => parent.moduleName,
  loc: (parent) => parent.loc,
  name: (parent) => parent.name,
  warning: (parent) => parent.warning,
};

// Resolvers for the "reason" field
const Reason = {
  moduleId: (parent) => parent.moduleId,
  module: (parent, args, context) => {
    // Get the module with the specified ID from the stats object
    const statsObject = getStatsObject(context.statsFile);
    const module = statsObject.modules.find((m) => m.id === parent.moduleId);
    return module;
  },
  moduleIdentifier: (parent) => parent.moduleIdentifier,
  moduleName: (parent) => parent.moduleName,
  loc: (parent) => parent.loc,
  name: (parent) => parent.name,
  reason: (parent) => parent.reason,
};

// Resolvers for the "dependency" field
const Dependency = {
  moduleId: (parent) => parent.moduleId,
  module: (parent, args, context) => {
    // Get the module with the specified ID from the stats object
    const statsObject = getStatsObject(context.statsFile);
    const module = statsObject.modules.find((m) => m.id === parent.moduleId);
    return module;
  },
  moduleIdentifier: (parent) => parent.moduleIdentifier,
  moduleName: (parent) => parent.moduleName,
  loc: (parent) => parent.loc,
  name: (parent) => parent.name,
  dependency: (parent) => parent.dependency,
};

// Resolvers for the "children" field
const Children = {
  id: (parent) => parent.id,
  identifier: (parent) => parent.identifier,
  name: (parent) => parent.name,
  size: (parent) => parent.size,
  cacheable: (parent) => parent.cacheable,
  built: (parent) => parent.built,
  optional: (parent) => parent.optional,
  prefetched: (parent) => parent.prefetched,
  chunkIds: (parent) => parent.chunkIds,
  chunks: (parent) => parent.chunks,
  issuer: (parent) => parent.issuer,
  issuerId: (parent) => parent.issuerId,
  issuerName: (parent) => parent.issuerName,
  profile: (parent) => parent.profile,
  failed: (parent) => parent.failed,
  errors: (parent) => parent.errors,
  warnings: (parent) => parent.warnings,
  reasons: (parent) => parent.reasons,
  usedExports: (parent) => parent.usedExports,
  providedExports: (parent) => parent.providedExports,
  depth: (parent) => parent.depth,
  source: (parent) => parent.source,
  index: (parent) => parent.index,
};



// Resolvers for the "issuer" field
const Issuer = {
  id: (parent) => parent.id,
  identifier: (parent) => parent.identifier,
  name: (parent) => parent.name,
  size: (parent) => parent.size,
  cacheable: (parent) => parent.cacheable,
  built: (parent) => parent.built,
  optional: (parent) => parent.optional,
  prefetched: (parent) => parent.prefetched,
  chunkIds: (parent) => parent.chunkIds,
  chunks: (parent) => parent.chunks,
  issuer: (parent) => parent.issuer,
  issuerId: (parent) => parent.issuerId,
  issuerName: (parent) => parent.issuerName,
  profile: (parent) => parent.profile,
  failed: (parent) => parent.failed,
  errors: (parent) => parent.errors,
  warnings: (parent) => parent.warnings,
  reasons: (parent) => parent.reasons,
  usedExports: (parent) => parent.usedExports,
  providedExports: (parent) => parent.providedExports,
  depth: (parent) => parent.depth,
  source: (parent) => parent.source,
  index: (parent) => parent.index,
};



// The resolver map
const resolvers = {
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
