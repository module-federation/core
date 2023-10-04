export = ModuleProfile;
declare class ModuleProfile {
  startTime: number;
  factoryStartTime: number;
  factoryEndTime: number;
  factory: number;
  factoryParallelismFactor: number;
  restoringStartTime: number;
  restoringEndTime: number;
  restoring: number;
  restoringParallelismFactor: number;
  integrationStartTime: number;
  integrationEndTime: number;
  integration: number;
  integrationParallelismFactor: number;
  buildingStartTime: number;
  buildingEndTime: number;
  building: number;
  buildingParallelismFactor: number;
  storingStartTime: number;
  storingEndTime: number;
  storing: number;
  storingParallelismFactor: number;
  /** @type {{ start: number, end: number }[] | undefined } */
  additionalFactoryTimes: {
    start: number;
    end: number;
  }[];
  additionalFactories: number;
  additionalFactoriesParallelismFactor: number;
  /** @deprecated */
  additionalIntegration: number;
  markFactoryStart(): void;
  markFactoryEnd(): void;
  markRestoringStart(): void;
  markRestoringEnd(): void;
  markIntegrationStart(): void;
  markIntegrationEnd(): void;
  markBuildingStart(): void;
  markBuildingEnd(): void;
  markStoringStart(): void;
  markStoringEnd(): void;
  /**
   * Merge this profile into another one
   * @param {ModuleProfile} realProfile the profile to merge into
   * @returns {void}
   */
  mergeInto(realProfile: ModuleProfile): void;
}
