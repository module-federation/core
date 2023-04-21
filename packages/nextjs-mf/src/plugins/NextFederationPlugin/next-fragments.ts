import { RuleSetConditionAbsolute } from 'webpack';

export const regexEqual = (
  x:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetConditionAbsolute[]
    | undefined,
  y: RegExp
): boolean => {
  return (
    x instanceof RegExp &&
    y instanceof RegExp &&
    x.source === y.source &&
    x.global === y.global &&
    x.ignoreCase === y.ignoreCase &&
    x.multiline === y.multiline
  );
};
