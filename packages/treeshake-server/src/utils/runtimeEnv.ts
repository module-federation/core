export type RuntimeEnv = Record<string, string | undefined>;

let runtimeEnv: RuntimeEnv = Object.freeze({}) as RuntimeEnv;

export const setRuntimeEnv = (env: RuntimeEnv) => {
  runtimeEnv = Object.freeze({ ...env }) as RuntimeEnv;
};

export const getRuntimeEnv = (): RuntimeEnv =>
  Object.freeze({ ...runtimeEnv }) as RuntimeEnv;
