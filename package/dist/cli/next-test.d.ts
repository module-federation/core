export interface NextTestOptions {
    testRunner?: string;
}
export declare const SUPPORTED_TEST_RUNNERS_LIST: readonly ["playwright"];
export type SupportedTestRunners = (typeof SUPPORTED_TEST_RUNNERS_LIST)[number];
export declare function nextTest(directory?: string, testRunnerArgs?: string[], options?: NextTestOptions): Promise<unknown>;
