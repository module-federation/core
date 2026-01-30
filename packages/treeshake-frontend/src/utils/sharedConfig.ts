import i18n from '@/i18n';

export function parseSharedConfig(sharedConfig: string) {
  if (!sharedConfig) return [];

  return sharedConfig
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const parts = s.split('@');
      if (parts.length < 2) {
        throw new Error(i18n.t('analyze.sharedVersionRequired', { name: s }));
      }
      const version = parts.pop()!;
      const name = parts.join('@');
      return [name, version, []] as [string, string, string[]];
    });
}
