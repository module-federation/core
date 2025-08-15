import type { Resolution } from 'metro-resolver';

export function createModulePathRemapper() {
  const mappings = new Map<string, string>();
  const reverseMappings = new Map<string, string>();

  return {
    addMapping(originalPath: string, overridePath: string) {
      mappings.set(originalPath, overridePath);
      reverseMappings.set(overridePath, originalPath);
    },
    removeMapping(originalPath: string) {
      const overridePath = mappings.get(originalPath);
      if (!overridePath) return;
      mappings.delete(originalPath);
      reverseMappings.delete(overridePath);
    },
    remap(resolved: Resolution): Resolution {
      if (!('filePath' in resolved)) return resolved;
      if (!mappings.has(resolved.filePath)) return resolved;
      const overridePath = mappings.get(resolved.filePath)!;
      return { filePath: overridePath, type: resolved.type };
    },
    reverse(overridePath: string) {
      if (!reverseMappings.has(overridePath)) return overridePath;
      return reverseMappings.get(overridePath)!;
    },
  };
}
