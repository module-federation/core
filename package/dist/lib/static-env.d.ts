import type { NextConfigComplete } from '../server/config-shared';
/**
 * Collects all environment variables that are using the `NEXT_PUBLIC_` prefix.
 */
export declare function getNextPublicEnvironmentVariables(): Record<string, string | undefined>;
/**
 * Collects the `env` config value from the Next.js config.
 */
export declare function getNextConfigEnv(config: NextConfigComplete): Record<string, string | undefined>;
export declare function getStaticEnv(config: NextConfigComplete): Record<string, string | undefined>;
export declare function populateStaticEnv(config: NextConfigComplete): void;
