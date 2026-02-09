import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ChevronsUpDown, Loader2, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { checkTreeshakeShared } from '@/utils/checkTreeshakeShared';
import type { RequestPayload, TreeshakeResult } from '@/utils/treeshakeShared';
import type { BuildConfigState, SharedItem } from './AnalyzeForm';

import { parseSharedConfig } from '@/utils/sharedConfig';

export function ExportsInput({
  values,
  onChange,
  error,
  disabled,
  options,
  placeholder,
  loading,
  item,
  onMoveToShared,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  error?: string;
  disabled?: boolean;
  options?: string[];
  placeholder?: string;
  loading?: boolean;
  item?: SharedItem;
  onMoveToShared?: () => void;
}) {
  const [current, setCurrent] = useState('');
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const commitToken = (raw: string) => {
    const token = raw.trim();
    if (!token) return;
    if (values.includes(token)) return;
    onChange([...values, token]);
    setCurrent('');
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
      event.preventDefault();
      commitToken(current);
    } else if (event.key === 'Backspace' && !current && values.length) {
      event.preventDefault();
      onChange(values.slice(0, -1));
    }
  };
  const handleBlur = () => {
    if (!disabled && current.trim()) commitToken(current);
  };
  const handleRemove = (value: string) => {
    if (!disabled) onChange(values.filter((v) => v !== value));
  };

  const isErrorPlaceholder =
    placeholder === 'This module does not support treeshake';

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/70 opacity-80 cursor-not-allowed">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          <span className="text-zinc-500">{placeholder || 'Loading...'}</span>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (options && options.length > 0) {
    return (
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div
              className={cn(
                'flex min-h-12 w-full flex-wrap items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur-md transition-colors dark:bg-zinc-900/70 cursor-pointer',
                error
                  ? 'border-red-500/70 ring-1 ring-red-500/40'
                  : 'border-zinc-200/70 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700',
                disabled && 'opacity-60 cursor-not-allowed',
              )}
            >
              {values.map((value) => (
                <Badge
                  key={value}
                  variant="secondary"
                  className="flex items-center gap-1 rounded-full bg-zinc-900/90 px-2 py-1 text-xs text-zinc-50 shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                >
                  <span>{value}</span>
                  <button
                    type="button"
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800/80 text-[10px] text-zinc-50 transition hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(value);
                    }}
                  >
                    ✕
                  </button>
                </Badge>
              ))}
              <div
                className={cn(
                  'flex-1 min-w-20 text-sm text-zinc-500 dark:text-zinc-400',
                  isErrorPlaceholder && 'text-red-500',
                )}
              >
                {values.length === 0 && (placeholder || 'Select exports...')}
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
          >
            <Command>
              <div className="flex items-center border-b pr-3">
                <CommandInput
                  placeholder="Search exports..."
                  className="flex-1 border-0 focus:ring-0"
                />
                <button
                  type="button"
                  className="ml-2 whitespace-nowrap text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  onClick={() => {
                    if (values.length === options.length) {
                      onChange([]);
                    } else {
                      onChange([...options]);
                    }
                  }}
                >
                  {values.length === options.length
                    ? 'Unselect All'
                    : 'Select All'}
                </button>
              </div>
              <CommandList>
                <CommandEmpty>No export found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-y-auto">
                  {options.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => {
                        if (values.includes(option)) {
                          onChange(values.filter((v) => v !== option));
                        } else {
                          onChange([...values, option]);
                        }
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          'mr-2 h-4 w-4',
                          values.includes(option) ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex min-h-12 w-full flex-wrap items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 text-sm shadow-sm backdrop-blur-md transition-colors dark:bg-zinc-900/70',
          error
            ? 'border-red-500/70 ring-1 ring-red-500/40'
            : 'border-zinc-200/70 hover:border-zinc-300 dark:border-zinc-800/80 dark:hover:border-zinc-700',
          disabled && 'opacity-60 cursor-not-allowed',
        )}
      >
        {values.map((value) => (
          <Badge
            key={value}
            variant="secondary"
            className="flex items-center gap-1 rounded-full bg-zinc-900/90 px-2 py-1 text-xs text-zinc-50 shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
          >
            <span>{value}</span>
            <button
              type="button"
              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800/80 text-[10px] text-zinc-50 transition hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(value);
              }}
            >
              ✕
            </button>
          </Badge>
        ))}
        <input
          disabled={disabled}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={
            values.length
              ? t('analyze.fieldExportsPlaceholderMore')
              : placeholder || t('analyze.fieldExportsPlaceholderEmpty')
          }
          className={cn(
            'flex-1 min-w-20 border-none bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500 disabled:cursor-not-allowed',
            isErrorPlaceholder && 'placeholder:text-red-500',
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {isErrorPlaceholder && item && onMoveToShared && (
        <div className="mt-1 flex items-center justify-between rounded-md bg-yellow-50 p-2 text-xs text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
          <span>{t('analyze.suggestionMoveToShared')}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs hover:bg-yellow-100 hover:text-yellow-800 dark:hover:bg-yellow-900/40 dark:hover:text-yellow-300"
            onClick={onMoveToShared}
          >
            {t('analyze.btnMoveToShared')}
          </Button>
        </div>
      )}
    </div>
  );
}

export function SharedItemInput({
  item,
  updateItem,
  config,
  setConfig,
  removeItem,
  formErrors,
  loading,
  setFullTreeshakeResult,
  allItems,
}: {
  item: SharedItem;
  updateItem: <K extends keyof SharedItem>(
    id: string,
    field: K,
    value: SharedItem[K],
  ) => void;
  config: BuildConfigState;
  setConfig: (updater: (prev: BuildConfigState) => BuildConfigState) => void;
  removeItem: (id: string) => void;
  formErrors?: { name?: string; version?: string; exports?: string };
  loading: boolean;
  setFullTreeshakeResult?: (result: TreeshakeResult | null) => void;
  allItems: SharedItem[];
}) {
  const { t } = useTranslation();
  const [pkgVersions, setPkgVersions] = useState<
    { version: string; tag?: string }[]
  >([]);
  const [versionLoading, setVersionLoading] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [canTreeshake, setCanTreeshake] = useState<boolean | null>(null);
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [sharedError, setSharedError] = useState<string | null>(null);

  // Check treeshake availability
  useEffect(() => {
    if (!item.name || !item.version) {
      setCanTreeshake(null);
      setAvailableModules([]);
      return;
    }

    const check = async () => {
      setCheckLoading(true);
      try {
        const payload: RequestPayload = {
          sharedName: item.name.trim(),
          sharedVersion: item.version.trim(),
          shared: [[item.name.trim(), item.version.trim(), []]],
          target: config.target
            ? config.target
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
            : ['web', 'browserslist:> 0.01%,not dead,not op_mini all'],
          plugins: config.plugins
            ? config.plugins
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        };

        const otherItems = allItems
          .filter((i) => i.id !== item.id && i.name && i.version)
          .map(
            (i) =>
              [i.name.trim(), i.version.trim(), i.exports] as [
                string,
                string,
                string[],
              ],
          );
        payload.shared.push(...otherItems);

        if (config.shared) {
          try {
            const extraShared = parseSharedConfig(config.shared);
            payload.shared.push(...extraShared);
          } catch (e) {
            // Error parsing shared config, likely incomplete
            console.warn('Failed to parse shared config for check', e);
          }
        }

        const names = payload.shared.map((s) => s[0]);
        const uniqueNames = new Set(names);
        if (uniqueNames.size !== names.length) {
          const duplicates = names.filter(
            (item, index) => names.indexOf(item) !== index,
          );
          const uniqueDuplicates = [...new Set(duplicates)];
          if (uniqueDuplicates.includes(item.name.trim())) {
            setSharedError(
              t('analyze.errorDuplicateSharedCurrent', {
                name: item.name.trim(),
              }),
            );
          } else {
            toast.error(
              t('analyze.errorDuplicateSharedDeps', {
                names: uniqueDuplicates.join(', '),
              }),
            );
            setSharedError(
              t('analyze.errorDuplicateSharedDeps', {
                names: uniqueDuplicates.join(', '),
              }),
            );
          }
          setCanTreeshake(null);
          if (setFullTreeshakeResult) setFullTreeshakeResult(null);
          setCheckLoading(false);
          return;
        }

        const result = await checkTreeshakeShared(payload);
        if (result === false) {
          setCanTreeshake(false);
          setAvailableModules([]);
          if (setFullTreeshakeResult) setFullTreeshakeResult(null);
        } else {
          setCanTreeshake(true);
          if (setFullTreeshakeResult) setFullTreeshakeResult(result);
          if (result.modules) {
            setAvailableModules(result.modules);
          }
        }
      } catch (e) {
        console.error('Check treeshake failed', e);
        setCanTreeshake(null);
        if (setFullTreeshakeResult) setFullTreeshakeResult(null);
        toast.error(
          (e as Error).message || 'Failed to check treeshake support',
        );
      } finally {
        setCheckLoading(false);
      }
    };

    check();
  }, [
    item.name,
    item.version,
    config.target,
    config.plugins,
    config.shared,
    t,
  ]);

  // Fetch versions
  useEffect(() => {
    if (!item.name) {
      setPkgVersions([]);
      setSharedError(null);
      return;
    }

    // Check for duplicates
    const currentName = item.name.trim();
    const otherItemNames = allItems
      .filter((i) => i.id !== item.id && i.name)
      .map((i) => i.name.trim());

    let extraSharedNames: string[] = [];
    if (config.shared) {
      try {
        const extraShared = parseSharedConfig(config.shared);
        extraSharedNames = extraShared.map((s) => s[0]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        // ignore
      }
    }

    const allOtherNames = new Set([...otherItemNames, ...extraSharedNames]);

    if (allOtherNames.has(currentName)) {
      setPkgVersions([]);
      setSharedError(
        t('analyze.errorDuplicateSharedCurrent', { name: currentName }),
      );
      return;
    }

    const timer = setTimeout(async () => {
      setVersionLoading(true);
      setSharedError(null);
      try {
        const res = await fetch(
          `https://data.jsdelivr.com/v1/package/npm/${item.name}`,
        );
        if (res.ok) {
          const data = await res.json();
          const versions = (data.versions || []).map((v: string) => ({
            version: v,
          }));
          const tags = data.tags || {};

          Object.entries(tags).forEach(([tag, v]) => {
            const found = versions.find(
              (ver: { version: string }) => ver.version === v,
            );
            if (found) {
              found.tag = tag;
            }
          });

          setPkgVersions(versions);
        } else if (res.status === 404) {
          setPkgVersions([]);
          setSharedError(`Package "${item.name}" not found or has no versions`);
          toast.error(`Package "${item.name}" not found`);
        } else {
          setPkgVersions([]);
        }
      } catch (e) {
        console.error('Failed to fetch versions', e);
        setPkgVersions([]);
      } finally {
        setVersionLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [item.name, allItems, config.shared]);

  const handleMoveToShared = () => {
    if (!item.name || !item.version) return;
    const sharedString = `${item.name}@${item.version}`;
    setConfig((prev) => ({
      ...prev,
      shared: prev.shared ? `${prev.shared}\n${sharedString}` : sharedString,
    }));

    if (allItems.length > 1) {
      removeItem(item.id);
    } else {
      // If it's the last item, reset it instead of removing
      updateItem(item.id, 'name', '');
      updateItem(item.id, 'version', '');
      updateItem(item.id, 'exports', []);
    }

    toast.success(`Moved ${item.name} to shared config`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200">
            <span>{t('analyze.fieldSharedLabel')}</span>
            {formErrors?.name && (
              <span className="text-[11px] text-red-500">
                {formErrors.name}
              </span>
            )}
          </label>
          <Input
            value={item.name}
            onChange={(e) => {
              updateItem(item.id, 'name', e.target.value);
              updateItem(item.id, 'version', '');
              updateItem(item.id, 'exports', []);
            }}
            placeholder={t('analyze.fieldSharedPlaceholder')}
            className={cn(
              'h-9 bg-white/70 text-sm backdrop-blur-sm dark:bg-slate-900/70',
              (formErrors?.name || sharedError) &&
                'border-red-500/70 ring-1 ring-red-500/40',
            )}
          />
          {sharedError && (
            <span className="text-[11px] text-red-500">{sharedError}</span>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200">
            <span>{t('analyze.fieldVersionLabel')}</span>
            {formErrors?.version && (
              <span className="text-[11px] text-red-500">
                {formErrors.version}
              </span>
            )}
          </label>
          <Popover open={versionOpen} onOpenChange={setVersionOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={versionOpen}
                className={cn(
                  'h-9 w-full justify-between bg-white/70 text-sm font-normal backdrop-blur-sm dark:bg-slate-900/70',
                  !item.version && 'text-muted-foreground',
                  formErrors?.version &&
                    'border-red-500/70 ring-1 ring-red-500/40',
                )}
                disabled={!item.name || versionLoading}
              >
                {item.version
                  ? pkgVersions.find((v) => v.version === item.version)?.tag
                    ? `${item.version} (${pkgVersions.find((v) => v.version === item.version)?.tag})`
                    : item.version
                  : versionLoading
                    ? 'Loading versions...'
                    : t('analyze.fieldVersionPlaceholder')}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search version..." />
                <CommandList>
                  <CommandEmpty>No version found.</CommandEmpty>
                  <CommandGroup>
                    {pkgVersions.map((v) => (
                      <CommandItem
                        key={v.version}
                        value={v.version}
                        onSelect={(currentValue) => {
                          updateItem(
                            item.id,
                            'version',
                            currentValue === item.version ? '' : currentValue,
                          );
                          setVersionOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 h-4 w-4',
                            item.version === v.version
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {v.version}
                        {v.tag && (
                          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {v.tag}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200">
          <span>{t('analyze.fieldExportsLabel')}</span>
          {formErrors?.exports && (
            <span className="text-[11px] text-red-500">
              {formErrors.exports}
            </span>
          )}
        </label>
        <ExportsInput
          values={item.exports}
          onChange={(val) => updateItem(item.id, 'exports', val)}
          error={formErrors?.exports}
          disabled={
            loading || checkLoading || canTreeshake === false || !canTreeshake
          }
          options={canTreeshake ? availableModules : undefined}
          placeholder={
            canTreeshake === false
              ? 'This module does not support treeshake'
              : checkLoading
                ? 'Checking treeshake support...'
                : !canTreeshake
                  ? 'Please select a version first'
                  : undefined
          }
          loading={checkLoading}
          item={item}
          onMoveToShared={handleMoveToShared}
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {t('analyze.fieldExportsHelp')}
        </p>
      </div>
    </div>
  );
}
