
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

