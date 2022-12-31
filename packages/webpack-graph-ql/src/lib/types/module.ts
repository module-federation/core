import { AutoSchema } from './auto-schema';
import { Chunk, ChunkData } from './chunk';
import { Issuer, IssuerData, } from './issuer';
import { Profile, ProfileData } from './profile';
import { WebpackModuleError, ErrorData } './error';
import { Warning, WarningData } './warning';
import { Reason, ReasonData } from './reason';

export type ModuleData = {
  assets: AssetData[];
  built: boolean;
  cacheable: boolean;
  chunks: string[];
  chunks: ChunkData[]; // I don't see this
  depth: number; // I don't see this.
  errors: ErrorData[];
  failed: boolean;
  id: string;
  identifier: string;
  index: number; // I don't see this.
  issuer: IssuerData; // I don't see this.
  issuerId: string; // I don't see this.
  issuerName: string; // I don't see this.
  name: string;
  optional: boolean;
  prefetched: boolean;
  profile: ProfileData;
  providedExports: string[]; // I don't see this.
  reasons: ReasonData[];
  usedExports: string[];
  size: number;
  source: string;
  warnings: WarningData[];
}

const cachedModules: Map<string, Module> = new Map();

export class Module extends AutoSchema {

  private profileData: ProfileData;
  private chunksData: ChunkData[];
  private issuerData: IssuerData;
  private errorsData: ErrorData[];
  private warningsData: WarningData[];
  private reasonsData: ReasonData[];

  @returns(String) id: string;
  @returns(String) identifier: string;
  @returns(String) name: string;
  @returns("Int") size: number;
  @returns(Boolean) cacheable: boolean;
  @returns(Boolean) built: boolean;
  @returns(Boolean) optional: boolean;
  @returns(Boolean) prefetched: boolean;
  @returns([String]) chunkIds: string[];
  @returns(String) issuerId: string;
  @returns(String) issuerName: string;
  @returns(Boolean) failed: boolean;
  @returns([String]) usedExports: string[];
  @returns([String]) providedExports: string[];
  @returns("Int") depth: number;
  @returns(String) source: string;
  @returns("Int") index: number;

  @returns([Chunk])
  get chunks(): Chunk[] {
    return this.chunks.map(Chunk.findById);
  }

  @returns(Issuer)
  get issuer(): Issuer {
    return Issuer.from(this.#issuerData);
  };

  @returns(Profile)
  get profile(): Profile {
    return Profile.from(this.profileData);
  }

  @returns([WebpackModuleError])
  get errors(): WebpackModuleError[] {
    return this.errorsData.map(WebpackModuleError.from);
  };

  @returns([Warning])
  get warnings(): Warning[] {
    return this.warningsData.map(Warning.from);
  };

  @returns([Reason])
  get reasons(): Reason[] {
    return this.reasonsData.map(Reason.from);
  }

  @returns(Module);
  static findById(moduleId: string, statsFile: string) => {
    // Get the module with the specified ID from the stats object
    const statsObject = Stats.fromFile(statsFile);
    cachedModules.get(moduleId);
    return module;
  },

  static from(moduleData: moduleData) {
    new this(moduleData);
  }

  constructor({
    chunks: chunkIds
    ...moduleData
  }: ModuleData) {
    cachedModules.set(moduleObject.moduleId, this);
    Object.assign(this, {
      chunkIds,
      ...moduleData
    });
  }

}

