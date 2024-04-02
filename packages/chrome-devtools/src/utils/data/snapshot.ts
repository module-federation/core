import { GlobalModuleInfo, ModuleInfo } from '@module-federation/sdk';

export const calculateSnapshot = (
  originSnapshot: GlobalModuleInfo,
  overrides: Record<string, string>,
) => {
  const overridesWithoutType = Object.keys(overrides).reduce(
    (memo: Record<string, string>, current: string) => {
      if (current.includes(':')) {
        const [, moduleId] = current.split(':');
        memo[moduleId] = overrides[current];
      }
      return memo;
    },
    {},
  );
  const newSnapshot = JSON.parse(JSON.stringify(originSnapshot));
  const moduleIds = Object.keys(originSnapshot);
  moduleIds.forEach((moduleId) => {
    const module = originSnapshot[moduleId] as ModuleInfo;
    if ('remotesInfo' in module) {
      const remoteIds = Object.keys(module.remotesInfo);
      remoteIds.forEach((id: string) => {
        const [, splitId] = id.split(':');
        const entry =
          overrides[id] ||
          overridesWithoutType[id] ||
          overrides[splitId] ||
          overridesWithoutType[splitId];
        if (entry) {
          newSnapshot[moduleId].remotesInfo[id].matchedVersion = entry;

          const customEntryId = `${id}:${entry}`;
          newSnapshot[customEntryId] = {
            remoteEntry: entry,
            version: entry,
          };
        }
      });
    }
  });
  return newSnapshot;
};

export const calculateMicroAppSnapshot = (
  originSnapshot: GlobalModuleInfo,
  overrides: Record<string, string>,
) => {
  let masterApp: ModuleInfo | null = null;
  const newSnapshot = JSON.parse(JSON.stringify(originSnapshot));
  const moduleIds = Object.keys(originSnapshot);
  moduleIds.forEach((moduleId) => {
    const module = newSnapshot[moduleId] as ModuleInfo;
    if (
      'consumerList' in module &&
      Array.isArray(module.consumerList) &&
      module.consumerList.length > 0
    ) {
      masterApp = module;
    }
  });

  if (!masterApp) {
    return newSnapshot;
  }

  // @ts-expect-error
  const microApps: Array<string> = masterApp.consumerList;
  const microAppsCount = microApps.length;
  for (let i = 0; i < microAppsCount; i++) {
    let overrideTarget = '';
    const microApp = microApps[i];
    const idWithVersion = Object.keys(overrides).find((id) => {
      let target = id;
      if (id.includes(':')) {
        const [, name] = id.split(':');
        target = name;
      }
      if (microApp.includes(target)) {
        overrideTarget = id;
        return true;
      }
      return false;
    });
    if (idWithVersion) {
      const entry = overrides[overrideTarget];
      const idArray = microApp.split(':');
      idArray[idArray.length - 1] = entry;
      microApps[i] = idArray.join(':');

      const customEntryId = `${overrideTarget}:${entry}`;
      newSnapshot[customEntryId] = {
        remoteEntry: entry,
        version: entry,
      };
    }
  }

  const snapshot = calculateSnapshot(newSnapshot, overrides);
  return snapshot;
};
