import { GlobalModuleInfo, ConsumerModuleInfo } from '@module-federation/sdk';

const basicProxyCore = require('../../vendor/basic-proxy-core.js') as {
  getModuleInfo(
    proxyRules: Array<any>,
    moduleInfo: GlobalModuleInfo,
  ): {
    status: string;
    moduleInfo: GlobalModuleInfo;
    overrides: Record<string, string>;
  };
};

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
  return basicProxyCore.getModuleInfo(
    proxyRules,
    window.__FEDERATION__.moduleInfo,
  );
};
