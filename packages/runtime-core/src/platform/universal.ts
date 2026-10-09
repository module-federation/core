import { isBrowserEnvValue } from '@module-federation/sdk/core';
import { loadScriptNode } from '@module-federation/sdk/node';
import type { NodePlatform } from '../type';
import { web } from './web';
import { node } from './node';

declare const ENV_TARGET: 'web' | 'node';

// Inline so a defined ENV_TARGET folds the unused loader out at parse time.
export const universal: NodePlatform = (
  typeof ENV_TARGET !== 'undefined' ? ENV_TARGET === 'web' : isBrowserEnvValue
)
  ? { ...web, loadScriptNode }
  : node;
