import CoreHoistContainerReferencesPlugin from '../lib/container/HoistContainerReferencesPlugin';
import BaseWrapperPlugin from './BaseWrapperPlugin';

const PLUGIN_NAME = 'HoistContainerReferencesPlugin';

export default class HoistContainerReferencesPlugin extends BaseWrapperPlugin {
  constructor() {
    super({}, PLUGIN_NAME, CoreHoistContainerReferencesPlugin);
  }
}
