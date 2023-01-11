import { AutoSchema } from './issuer';

// Resolvers for the "issuer" field
const Issuer = {
  @returns(String) id: (parent: any) => parent.id,
  @returns(String) identifier: (parent: any) => parent.identifier,
  @returns(String) name: (parent: any) => parent.name,
  @returns(String) size: (parent: any) => parent.size,
  @returns(String) cacheable: (parent: any) => parent.cacheable,
  @returns(String) built: (parent: any) => parent.built,
  @returns(String) optional: (parent: any) => parent.optional,
  @returns(String) prefetched: (parent: any) => parent.prefetched,
  @returns(String) chunkIds: (parent: any) => parent.chunkIds,
  @returns(String) chunks: (parent: any) => parent.chunks,
  @returns(String) issuer: (parent: any) => parent.issuer,
  @returns(String) issuerId: (parent: any) => parent.issuerId,
  @returns(String) issuerName: (parent: any) => parent.issuerName,
  @returns(String) profile: (parent: any) => parent.profile,
  @returns(String) failed: (parent: any) => parent.failed,
  @returns(String) errors: (parent: any) => parent.errors,
  @returns(String) warnings: (parent: any) => parent.warnings,
  @returns(String) reasons: (parent: any) => parent.reasons,
  @returns(String) usedExports: (parent: any) => parent.usedExports,
  @returns(String) providedExports: (parent: any) => parent.providedExports,
  @returns(String) depth: (parent: any) => parent.depth,
  @returns(String) source: (parent: any) => parent.source,
  @returns(String) index: (parent: any) => parent.index,
};
