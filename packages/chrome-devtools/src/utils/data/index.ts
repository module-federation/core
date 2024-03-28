import { GlobalModuleInfo, ConsumerModuleInfo } from '@module-federation/sdk';

import { calculateSnapshot, calculateMicroAppSnapshot } from './snapshot';

export const separateType = (moduleInfo: GlobalModuleInfo) => {
  const consumers: Record<string, GlobalModuleInfo[string]> = {};
  const producer: Array<string> = [];
  Object.keys(moduleInfo).forEach((key) => {
    const remotesInfo = (moduleInfo[key] as ConsumerModuleInfo)?.remotesInfo;
    if (remotesInfo) {
      const moduleIds = Object.keys(remotesInfo);
      if (moduleIds.length) {
        moduleIds.forEach((id) => {
          let formatId = id;
          if (id.includes(':')) {
            formatId = id.split(':').pop() as string;
          }
          const hasBeenAdded = producer.includes(formatId);
          if (!hasBeenAdded) {
            producer.push(id);
          }
        });
        consumers[key] = moduleInfo[key];
      }
    }
  });

  return {
    consumers,
    producer,
  };
};

export const getModuleInfo = async (
  proxyRules: Array<any>,
): Promise<{
  status: string;
  moduleInfo: GlobalModuleInfo;
  overrides: Record<string, string>;
}> => {
  let freshModuleInfo;
  const { moduleInfo } = window.__FEDERATION__;
  const { consumers } = separateType(moduleInfo);
  const overrides: Record<string, string> = {};

  const isMicroMode = Object.keys(consumers).some((moduleId) => {
    // @ts-expect-error
    const subApps = consumers[moduleId].consumerList;
    return Array.isArray(subApps) && subApps.length;
  });

  proxyRules.forEach((rule: { key: string; value: string }) => {
    const { key, value } = rule;
    overrides[key] = value;
  });
  if (isMicroMode) {
    freshModuleInfo = calculateMicroAppSnapshot(moduleInfo, overrides);
  } else {
    freshModuleInfo = calculateSnapshot(moduleInfo, overrides);
  }

  console.debug('New Snapshot: ', freshModuleInfo);
  return {
    status: 'success',
    moduleInfo: freshModuleInfo as GlobalModuleInfo,
    overrides,
  };
};

export * from './snapshot';
