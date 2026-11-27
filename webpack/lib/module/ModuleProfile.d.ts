export = ModuleProfile;
declare class ModuleProfile {
    /** @type {number} */
    startTime: number;
    /** @type {number} */
    factoryStartTime: number;
    /** @type {number} */
    factoryEndTime: number;
    /** @type {number} */
    factory: number;
    /** @type {number} */
    factoryParallelismFactor: number;
    /** @type {number} */
    restoringStartTime: number;
    /** @type {number} */
    restoringEndTime: number;
    /** @type {number} */
    restoring: number;
    /** @type {number} */
    restoringParallelismFactor: number;
    /** @type {number} */
    integrationStartTime: number;
    /** @type {number} */
    integrationEndTime: number;
    /** @type {number} */
    integration: number;
    /** @type {number} */
    integrationParallelismFactor: number;
    /** @type {number} */
    buildingStartTime: number;
    /** @type {number} */
    buildingEndTime: number;
    /** @type {number} */
    building: number;
    /** @type {number} */
    buildingParallelismFactor: number;
    /** @type {number} */
    storingStartTime: number;
    /** @type {number} */
    storingEndTime: number;
    /** @type {number} */
    storing: number;
    /** @type {number} */
    storingParallelismFactor: number;
    /** @type {{ start: number, end: number }[] | undefined} */
    additionalFactoryTimes: {
        start: number;
        end: number;
    }[] | undefined;
    /** @type {number} */
    additionalFactories: number;
    /** @type {number} */
    additionalFactoriesParallelismFactor: number;
    /**
     * @deprecated
     * @type {number}
     */
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
