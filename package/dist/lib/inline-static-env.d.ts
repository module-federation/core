import type { NextConfigComplete } from '../server/config-shared';
export declare function inlineStaticEnv({ distDir, config, }: {
    distDir: string;
    config: NextConfigComplete;
}): Promise<void>;
