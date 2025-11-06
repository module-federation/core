import type { IndependentSharePluginOptions } from '../lib/sharing/treeshake/IndependentSharePlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'IndependentSharePlugin';

export default class IndependentSharePlugin extends BaseWrapperPlugin {
  constructor(options: IndependentSharePluginOptions) {
    super(
      options,
      PLUGIN_NAME,
      '../lib/sharing/treeshake/IndependentSharePlugin',
    );
  }
}
