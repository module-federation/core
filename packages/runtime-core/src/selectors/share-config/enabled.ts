import { formatShareConfigs } from '../../utils/share';

export function selectShareConfigs(
  globalOptions: Parameters<typeof formatShareConfigs>[0],
  userOptions: Parameters<typeof formatShareConfigs>[1],
) {
  return formatShareConfigs(globalOptions, userOptions).allShareInfos;
}
