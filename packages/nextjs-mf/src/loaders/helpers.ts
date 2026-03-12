import type {
  RuleSetRule,
  RuleSetCondition,
  RuleSetConditionAbsolute,
  RuleSetUseItem,
} from 'webpack';

export function injectRuleLoader(rule: any, loader: RuleSetUseItem = {}) {
  if (rule !== '...') {
    const _rule = rule as {
      loader?: string;
      use?: (RuleSetUseItem | string)[];
      options?: any;
    };
    if (_rule.loader) {
      _rule.use = [loader, { loader: _rule.loader, options: _rule.options }];
      delete _rule.loader;
      delete _rule.options;
    } else if (_rule.use) {
      _rule.use = [loader, ...(_rule.use as any[])];
    }
  }
}

/**
 * This function checks if the current module rule has a loader with the provided name.
 *
 * @param {RuleSetRule} rule - The current module rule.
 * @param {string} loaderName - The name of the loader to check.
 * @returns {boolean} Returns true if the current module rule has a loader with the provided name, otherwise false.
 */
export function hasLoader(rule: RuleSetRule, loaderName: string) {
  //@ts-ignore
  if (rule !== '...') {
    const _rule = rule as {
      loader?: string;
      use?: (RuleSetUseItem | string)[];
      options?: any;
    };
    if (_rule.loader === loaderName) {
      return true;
    } else if (_rule.use && Array.isArray(_rule.use)) {
      for (let i = 0; i < _rule.use.length; i++) {
        const loader = _rule.use[i];
        if (
          typeof loader !== 'string' &&
          typeof loader !== 'function' &&
          loader.loader &&
          (loader.loader === loaderName ||
            loader.loader.includes(`/${loaderName}/`))
        ) {
          return true;
        } else if (typeof loader === 'string') {
          if (loader === loaderName || loader.includes(`/${loaderName}/`)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

interface Resource {
  path: string;
  layer?: string;
  issuerLayer?: string;
}

function matchesCondition(
  condition:
    | RuleSetCondition
    | RuleSetConditionAbsolute
    | RuleSetRule
    | undefined,
  resource: Resource,
  currentPath: string,
): boolean {
  if (condition instanceof RegExp) {
    return condition.test(resource.path);
  } else if (typeof condition === 'string') {
    return resource.path.includes(condition);
  } else if (typeof condition === 'function') {
    return condition(resource.path);
  } else if (typeof condition === 'object') {
    if ('test' in condition && condition.test) {
      const tests = Array.isArray(condition.test)
        ? condition.test
        : [condition.test];
      if (
        !tests.some((test: RuleSetCondition) =>
          matchesCondition(test, resource, currentPath),
        )
      ) {
        return false;
      }
    }
    if ('include' in condition && condition.include) {
      const includes = Array.isArray(condition.include)
        ? condition.include
        : [condition.include];
      if (
        !includes.some((include: RuleSetCondition) =>
          matchesCondition(include, resource, currentPath),
        )
      ) {
        return false;
      }
    }
    if ('exclude' in condition && condition.exclude) {
      const excludes = Array.isArray(condition.exclude)
        ? condition.exclude
        : [condition.exclude];
      if (
        excludes.some((exclude: RuleSetCondition) =>
          matchesCondition(exclude, resource, currentPath),
        )
      ) {
        return false;
      }
    }
    if ('and' in condition && condition.and) {
      return condition.and.every((cond: RuleSetCondition) =>
        matchesCondition(cond, resource, currentPath),
      );
    }
    if ('or' in condition && condition.or) {
      return condition.or.some((cond: RuleSetCondition) =>
        matchesCondition(cond, resource, currentPath),
      );
    }
    if ('not' in condition && condition.not) {
      return !matchesCondition(condition.not, resource, currentPath);
    }
    if ('layer' in condition && condition.layer) {
      if (
        !resource.layer ||
        !matchesCondition(
          condition.layer,
          { path: resource.layer },
          currentPath,
        )
      ) {
        return false;
      }
    }
    if ('issuerLayer' in condition && condition.issuerLayer) {
      if (
        !resource.issuerLayer ||
        !matchesCondition(
          condition.issuerLayer,
          { path: resource.issuerLayer },
          currentPath,
        )
      ) {
        return false;
      }
    }
  }
  return true;
}

export function findLoaderForResource(
  rules: RuleSetRule[],
  resource: Resource,
  path: string[] = [],
): RuleSetRule | null {
  let lastMatchedRule: RuleSetRule | null = null;
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const currentPath = [...path, `rules[${i}]`];
    if (rule.oneOf) {
      for (let j = 0; j < rule.oneOf.length; j++) {
        const subRule = rule.oneOf[j];
        const subPath = [...currentPath, `oneOf[${j}]`];

        if (
          subRule &&
          matchesCondition(subRule, resource, subPath.join('->'))
        ) {
          return subRule;
        }
      }
    } else if (
      rule &&
      matchesCondition(rule, resource, currentPath.join(' -> '))
    ) {
      lastMatchedRule = rule;
    }
  }
  return lastMatchedRule;
}
