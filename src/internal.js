export const DEFAULT_SHARE_SCOPE = {
  react: {
    singleton: true,
    requiredVersion: false,
  },
  'react/jsx-runtime': {
    singleton: true,
    requiredVersion: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: false,
  },
  'next/dynamic': {
    requiredVersion: false,
    singleton: true,
  },
  'styled-jsx': {
    requiredVersion: false,
    singleton: true,
  },
  'next/link': {
    requiredVersion: false,
    singleton: true,
  },
  'next/router': {
    requiredVersion: false,
    singleton: true,
  },
  'next/script': {
    requiredVersion: false,
    singleton: true,
  },
  'next/head': {
    requiredVersion: false,
    singleton: true,
  },
};

export const reKeyHostShared = (options) => {
  return Object.entries({
    ...(options || {}),
    ...DEFAULT_SHARE_SCOPE,
  }).reduce((acc, item) => {
    const [itemKey, shareOptions] = item;

    const shareKey = 'host' + (item.shareKey || itemKey);
    acc[shareKey] = shareOptions;
    if (!shareOptions.import) {
      acc[shareKey].import = itemKey;
    }
    if (!shareOptions.shareKey) {
      acc[shareKey].shareKey = itemKey;
    }

    if (DEFAULT_SHARE_SCOPE[itemKey]) {
      acc[shareKey].packageName = itemKey;
    }
    return acc;
  }, {});
}

export const extractUrlAndGlobal = (urlAndGlobal) => {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
}