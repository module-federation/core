import type { ExperimentalConfig, NextConfigComplete, NextConfig } from './config-shared';
export { normalizeConfig } from './config-shared';
export type { DomainLocale, NextConfig } from './config-shared';
export declare function warnOptionHasBeenDeprecated(config: NextConfig, nestedPropertyKey: string, reason: string, silent: boolean): boolean;
export declare function warnOptionHasBeenMovedOutOfExperimental(config: NextConfig, oldExperimentalKey: string, newKey: string, configFileName: string, silent: boolean): NextConfig;
export default function loadConfig(phase: string, dir: string, { customConfig, rawConfig, silent, onLoadUserConfig, reactProductionProfiling, }?: {
    customConfig?: object | null;
    rawConfig?: boolean;
    silent?: boolean;
    onLoadUserConfig?: (conf: NextConfig) => void;
    reactProductionProfiling?: boolean;
}): Promise<NextConfigComplete>;
export type ConfiguredExperimentalFeature = {
    name: keyof ExperimentalConfig;
    type: 'boolean';
    value: boolean;
} | {
    name: keyof ExperimentalConfig;
    type: 'number';
    value: number;
} | {
    name: keyof ExperimentalConfig;
    type: 'other';
};
export declare function getConfiguredExperimentalFeatures(userNextConfigExperimental: NextConfig['experimental']): ConfiguredExperimentalFeature[];
