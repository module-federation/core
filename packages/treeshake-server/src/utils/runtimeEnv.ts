export type RuntimeEnv = Record<string, string | undefined>;

let runtimeEnv: RuntimeEnv = {};

export const setRuntimeEnv = (env: RuntimeEnv) => {
  runtimeEnv = env;
};

export const getRuntimeEnv = (): RuntimeEnv => runtimeEnv;
