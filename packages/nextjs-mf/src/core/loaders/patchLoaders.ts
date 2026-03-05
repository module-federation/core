import type { Configuration, RuleSetRule, RuleSetUseItem } from 'webpack';
import path from 'path';
import fs from 'fs';

type MutableRule = RuleSetRule & {
  oneOf?: RuleSetRule[];
  rules?: RuleSetRule[];
  use?: RuleSetUseItem | RuleSetUseItem[];
  loader?: string;
  options?: unknown;
};

function getUseLoaderIds(rule: MutableRule): string[] {
  const ids: string[] = [];

  const pushUseItem = (item: RuleSetUseItem): void => {
    if (typeof item === 'string') {
      ids.push(item);
      return;
    }

    if (item && typeof item === 'object' && 'loader' in item) {
      const loader = item.loader;
      if (typeof loader === 'string') {
        ids.push(loader);
      }
    }
  };

  if (typeof rule.loader === 'string') {
    ids.push(rule.loader);
  }

  if (Array.isArray(rule.use)) {
    rule.use.forEach((item) => {
      if (!item) {
        return;
      }
      pushUseItem(item as RuleSetUseItem);
    });
  } else if (rule.use && typeof rule.use !== 'function') {
    pushUseItem(rule.use as RuleSetUseItem);
  }

  return ids;
}

function toUseItems(rule: MutableRule): RuleSetUseItem[] {
  if (Array.isArray(rule.use)) {
    const collected: RuleSetUseItem[] = [];
    rule.use.forEach((item) => {
      if (!item || typeof item === 'function') {
        return;
      }

      collected.push(item as RuleSetUseItem);
    });
    return collected;
  }

  if (rule.use && typeof rule.use !== 'function') {
    return [rule.use as RuleSetUseItem];
  }

  if (typeof rule.loader === 'string') {
    return [{ loader: rule.loader, options: rule.options }];
  }

  return [];
}

function setUseItems(rule: MutableRule, items: RuleSetUseItem[]): void {
  rule.use = items;

  if ('loader' in rule) {
    delete rule.loader;
  }

  if ('options' in rule) {
    delete rule.options;
  }
}

function ensurePrependedLoader(
  rule: MutableRule,
  targetLoaderPath: string,
): void {
  const items = toUseItems(rule);
  const alreadyInjected = items.some((item) => {
    if (typeof item === 'string') {
      return item === targetLoaderPath;
    }

    return Boolean(
      item && typeof item === 'object' && item.loader === targetLoaderPath,
    );
  });

  if (alreadyInjected) {
    return;
  }

  setUseItems(rule, [{ loader: targetLoaderPath }, ...items]);
}

function visitRule(
  rule: RuleSetRule,
  callback: (rule: MutableRule) => void,
): void {
  if (!rule || typeof rule !== 'object') {
    return;
  }

  const mutableRule = rule as MutableRule;
  callback(mutableRule);

  if (Array.isArray(mutableRule.oneOf)) {
    mutableRule.oneOf.forEach((nestedRule) => {
      if (!nestedRule || typeof nestedRule !== 'object') {
        return;
      }
      visitRule(nestedRule as RuleSetRule, callback);
    });
  }

  if (Array.isArray(mutableRule.rules)) {
    mutableRule.rules.forEach((nestedRule) => {
      if (!nestedRule || typeof nestedRule !== 'object') {
        return;
      }
      visitRule(nestedRule as RuleSetRule, callback);
    });
  }
}

function resolveLoaderPath(localName: string): string {
  const absolutePath = path.resolve(__dirname, `${localName}.js`);

  if (fs.existsSync(absolutePath)) {
    return absolutePath;
  }

  return require.resolve(`./${localName}`);
}

export function applyFederatedAssetLoaderFixes(config: Configuration): void {
  if (!config.module || !Array.isArray(config.module.rules)) {
    return;
  }

  const fixNextImageLoaderPath = resolveLoaderPath('fixNextImageLoader');
  const fixUrlLoaderPath = resolveLoaderPath('fixUrlLoader');

  config.module.rules.forEach((rule) => {
    if (!rule || typeof rule !== 'object') {
      return;
    }

    visitRule(rule as RuleSetRule, (mutableRule) => {
      const loaderIds = getUseLoaderIds(mutableRule);
      const hasNextImageLoader = loaderIds.some((id) =>
        id.includes('next-image-loader'),
      );
      const hasUrlLoader = loaderIds.some((id) => id.includes('url-loader'));

      if (hasNextImageLoader) {
        ensurePrependedLoader(mutableRule, fixNextImageLoaderPath);
      }

      if (hasUrlLoader) {
        ensurePrependedLoader(mutableRule, fixUrlLoaderPath);
      }
    });
  });
}
