import { formatShareConfigs } from '../../utils/share';

declare const FEDERATION_OPTIMIZE_NO_SHARED: boolean;

const useShared =
  typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_SHARED
    : true;

export function selectShareConfigs(
  globalOptions: Parameters<typeof formatShareConfigs>[0],
  userOptions: Parameters<typeof formatShareConfigs>[1],
) {
  return useShared
    ? formatShareConfigs(globalOptions, userOptions).allShareInfos
    : {};
}
