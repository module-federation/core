import resolvers from './resolvers';
const schema = `
type Query {
  stats: Stats
}

type Stats {
  assets: [Asset]
  chunks: [Chunk]
  modules: [Module]
  errors: [Error]
  warnings: [Warning]
  hash: String
  version: String
  time: Int
}

type Asset {
  name: String
  size: Int
  chunkNames: [String]
}

type Chunk {
  id: String
  names: [String]
  modules: [Module]
  origins: [Origin]
}

type Module {
  id: String
  identifier: String
  name: String
  size: Int
  cacheable: Boolean
  built: Boolean
  optional: Boolean
  prefetched: Boolean
  chunkIds: [String]
  chunks: [Chunk]
  issuer: Module
  issuerId: String
  issuerName: String
  profile: Profile
  failed: Boolean
  errors: [Error]
  warnings: [Warning]
  reasons: [Reason]
  usedExports: [String]
  providedExports: [String]
  depth: Int
  source: String
  index: Int
}

type Origin {
  moduleId: String
  module: Module
  moduleIdentifier: String
  moduleName: String
  loc: String
  name: String
}

type Error {
  message: String
  moduleId: String
  module: Module
  moduleIdentifier: String
  moduleName: String
  loc: String
  name: String
  error: String
}

type Warning {
  message: String
  moduleId: String
  module: Module
  moduleIdentifier: String
  moduleName: String
  loc: String
  name: String
  warning: String
}

type Profile {
  factory: String
  factoryDetail: FactoryDetail
  create: String
  createDetail: CreateDetail
  build: String
  buildDetail: BuildDetail
  buildFactory: String
  buildFactoryDetail: BuildFactoryDetail
  buildCreate: String
  buildCreateDetail: BuildCreateDetail
}

type FactoryDetail {
  time: Int
  ownTime: Int
}

type CreateDetail {
  time: Int
  ownTime: Int
}

type BuildDetail {
  time: Int
  ownTime: Int
}

type BuildFactoryDetail {
  time: Int
  ownTime: Int
}

type BuildCreateDetail {
  time: Int
  ownTime: Int
}

type Reason {
  moduleId: String
  module: Module
  moduleIdentifier: String
  moduleName: String
  loc: String
  name: String
  reasons: [Reason]
  source: String
  error: String
}
`

export default schema;

