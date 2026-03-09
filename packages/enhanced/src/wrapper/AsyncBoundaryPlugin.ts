import type { Options } from '../lib/container/AsyncBoundaryPlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'AsyncBoundaryPlugin';

export default class AsyncBoundaryPlugin extends BaseWrapperPlugin {
  constructor(options: Options) {
    super(options, PLUGIN_NAME, '../lib/container/AsyncBoundaryPlugin');
  }
}
