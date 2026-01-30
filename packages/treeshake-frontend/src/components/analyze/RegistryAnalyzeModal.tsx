import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Network, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchRegistryTreeshakeConfig } from '@/utils/fetchRegistryModuleInfo';
import type { BuildConfigState, SharedItem } from './AnalyzeForm';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface RegistryAnalyzeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setSharedItems: React.Dispatch<React.SetStateAction<SharedItem[]>>;
  setConfig: (updater: (prev: BuildConfigState) => BuildConfigState) => void;
}

interface RegistryModuleItem {
  id: string;
  name: string;
  manifestUrl: string;
  configData?: {
    pureShared?: string[];
    sharedItems: SharedItem[];
    remotes?: Array<{ name: string; version?: string }>;
  } | null;
  error?: string | null;
}

interface RemotesSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remotes: Array<{ name: string; version?: string }>;
  onConfirm: (
    selectedRemotes: Array<{ name: string; version?: string }>,
  ) => void;
}

function RemotesSelectionModal({
  open,
  onOpenChange,
  remotes,
  onConfirm,
}: RemotesSelectionModalProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSelected(remotes.map((r) => r.name));
    }
  }, [open, remotes]);

  const toggleSelect = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const handleConfirm = () => {
    const selectedRemotes = remotes.filter((r) => selected.includes(r.name));
    onConfirm(selectedRemotes);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">
            Select Remotes to Add
          </DialogTitle>
          <DialogDescription>
            Choose which remote modules you want to add to the analysis.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {remotes.map((remote) => (
            <div key={remote.name} className="flex items-center space-x-2">
              <Checkbox
                id={`remote-${remote.name}`}
                checked={selected.includes(remote.name)}
                onCheckedChange={() => toggleSelect(remote.name)}
              />
              <label
                htmlFor={`remote-${remote.name}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-200"
              >
                {remote.name}{' '}
                {remote.version ? (
                  <span className="text-muted-foreground text-xs dark:text-slate-400">
                    ({remote.version})
                  </span>
                ) : null}
              </label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm ({selected.length})</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const looksLikeUrl = (value: string) =>
  value.startsWith('http://') ||
  value.startsWith('https://') ||
  value.startsWith('//');

export function RegistryAnalyzeModal({
  open,
  onOpenChange,
  setSharedItems,
  setConfig,
}: RegistryAnalyzeModalProps) {
  const [items, setItems] = useState<RegistryModuleItem[]>([
    { id: '1', name: '', manifestUrl: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const [remotesModalOpen, setRemotesModalOpen] = useState(false);
  const [currentRemotes, setCurrentRemotes] = useState<
    Array<{ name: string; version?: string }>
  >([]);

  const openRemotesModal = (
    remotes: Array<{ name: string; version?: string }>,
  ) => {
    setCurrentRemotes(remotes);
    setRemotesModalOpen(true);
  };

  const scheduleFetchConfig = useCallback((id: string, manifestUrl: string) => {
    if (!looksLikeUrl(manifestUrl)) return;
    const configTimerId = `${id}-config`;
    if (debounceTimers.current[configTimerId]) {
      clearTimeout(debounceTimers.current[configTimerId]);
    }
    debounceTimers.current[configTimerId] = setTimeout(() => {
      fetchConfig(id, manifestUrl);
      delete debounceTimers.current[configTimerId];
    }, 500);
  }, []);

  const fetchConfig = useCallback(async (id: string, manifestUrl: string) => {
    if (!manifestUrl) return;

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, error: null } : item)),
    );

    try {
      const res = await fetchRegistryTreeshakeConfig(manifestUrl);
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              error: null,
              configData: res
                ? {
                    pureShared: res.pureShared,
                    sharedItems: res.sharedItems || [],
                    remotes: res.remotes,
                  }
                : null,
            };
          }
          return item;
        }),
      );
    } catch (e: unknown) {
      console.error(`Failed to fetch config for ${manifestUrl}`, e);
      let errorMessage = 'Failed to load config';
      if (typeof e === 'object' && e !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('response' in e && (e as any).response?.status === 404) {
          errorMessage = 'Manifest not found';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } else if ('message' in e && typeof (e as any).message === 'string') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorMessage = (e as any).message;
        }
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, configData: null, error: errorMessage }
            : item,
        ),
      );
    }
  }, []);

  const updateItem = (id: string, updates: Partial<RegistryModuleItem>) => {
    setItems((prev) => {
      const newItems = prev.map((item) => {
        if (item.id !== id) return item;
        const newItem = { ...item, ...updates };

        if (
          (updates.name !== undefined && updates.name !== item.name) ||
          (updates.manifestUrl !== undefined &&
            updates.manifestUrl !== item.manifestUrl)
        ) {
          newItem.configData = null;
        }

        return newItem;
      });

      const current = newItems.find((i) => i.id === id);
      if (current?.manifestUrl) {
        scheduleFetchConfig(id, current.manifestUrl);
      }

      return newItems;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', manifestUrl: '' },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleRemotesConfirm = (
    selectedRemotes: Array<{ name: string; version?: string }>,
  ) => {
    setItems((prev) => {
      const newItems = [...prev];
      const existingNames = new Set(prev.map((i) => i.name));
      const addedItems: RegistryModuleItem[] = [];

      selectedRemotes.forEach((remote) => {
        if (!existingNames.has(remote.name)) {
          const manifestUrl = looksLikeUrl(remote.version ?? '')
            ? (remote.version as string)
            : '';
          const newItem: RegistryModuleItem = {
            id: crypto.randomUUID(),
            name: remote.name,
            manifestUrl,
          };
          newItems.push(newItem);
          addedItems.push(newItem);
          existingNames.add(remote.name);
        }
      });

      setTimeout(() => {
        addedItems.forEach((item) => {
          if (item.manifestUrl) {
            scheduleFetchConfig(item.id, item.manifestUrl);
          }
        });
      }, 0);

      return newItems;
    });

    toast.success(`Added ${selectedRemotes.length} remote modules`);
  };

  const handleSubmit = async () => {
    const validItems = items.filter((i) => i.name && i.manifestUrl);
    if (validItems.length === 0) {
      toast.error('Please fill in at least one module');
      return;
    }

    setLoading(true);
    try {
      const allSharedItems: SharedItem[] = [];
      const mergedConfig: Partial<BuildConfigState> = {};
      const pureSharedItems: string[] = [];
      let missingConfigCount = 0;

      for (const item of validItems) {
        if (item.configData) {
          allSharedItems.push(...item.configData.sharedItems);
          if (item.configData.pureShared) {
            pureSharedItems.push(...item.configData.pureShared);
          }
        } else {
          missingConfigCount++;
        }
      }

      if (missingConfigCount > 0) {
        const missingItems = validItems.filter((i) => !i.configData);
        const results = await Promise.all(
          missingItems.map((item) =>
            fetchRegistryTreeshakeConfig(item.manifestUrl).catch(() => null),
          ),
        );

        results.forEach((res) => {
          if (res) {
            if (res.sharedItems) {
              allSharedItems.push(...res.sharedItems);
            }
            if (res.pureShared.length > 0) {
              pureSharedItems.push(...res.pureShared);
            }
          }
        });
      }

      if (pureSharedItems.length > 0) {
        const existingNames = new Set(allSharedItems.map((i) => i.name));
        const uniquePureShared = pureSharedItems.filter((s) => {
          const parts = s.split('@');
          let pkgName = s;
          if (parts.length > 1) {
            if (s.startsWith('@')) {
              if (parts.length > 2) {
                pkgName = '@' + parts[1];
              } else {
                pkgName = s;
              }
            } else {
              pkgName = parts[0];
            }
          }
          return !existingNames.has(pkgName);
        });

        if (uniquePureShared.length > 0) {
          mergedConfig.shared = uniquePureShared.join('\n');
        }
      }

      if (!mergedConfig.target) {
        mergedConfig.target =
          'web,\nbrowserslist:> 0.01%,not dead,not op_mini all';
      }

      if (allSharedItems.length > 0) {
        setSharedItems(allSharedItems);
        setConfig((prev) => ({ ...prev, ...mergedConfig }));
        onOpenChange(false);
        toast.success(`Loaded config for ${validItems.length} modules`);
      } else {
        toast.error('Failed to load manifest config or no data returned');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error loading manifest config');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = items.every(
    (item) => item.name && item.manifestUrl && !item.error,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RemotesSelectionModal
        open={remotesModalOpen}
        onOpenChange={setRemotesModalOpen}
        remotes={currentRemotes}
        onConfirm={handleRemotesConfirm}
      />
      <DialogContent className="sm:max-w-[650px] dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">
            Import Manifest Config
          </DialogTitle>
          <DialogDescription>
            Provide a manifest stats URL to prefill shared exports.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'relative grid gap-4 rounded-lg border border-slate-200/60 bg-white/50 px-8 py-6 dark:border-slate-800/60 dark:bg-slate-900/50',
                item.error &&
                  'border-red-500/50 dark:border-red-500/50 bg-red-50/10 dark:bg-red-900/10',
              )}
            >
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute right-2 top-2 z-10 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor={`registry-name-${item.id}`}
                  className="text-right dark:text-slate-300"
                >
                  Name
                </Label>
                <Input
                  id={`registry-name-${item.id}`}
                  value={item.name}
                  onChange={(e) =>
                    updateItem(item.id, { name: e.target.value })
                  }
                  placeholder="@scope/name"
                  className="col-span-3 dark:bg-slate-900/50 dark:border-slate-800/60 dark:text-slate-200 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right dark:text-slate-300">
                  Manifest URL
                </Label>
                <Input
                  value={item.manifestUrl}
                  onChange={(e) =>
                    updateItem(item.id, { manifestUrl: e.target.value })
                  }
                  placeholder="https://.../mf-manifest-stats.json"
                  className="col-span-3 dark:bg-slate-900/50 dark:border-slate-800/60 dark:text-slate-200 dark:placeholder:text-slate-500"
                />
              </div>

              {item.error && (
                <div className="text-xs text-red-500 mt-2">{item.error}</div>
              )}

              {item.configData?.remotes &&
              item.configData.remotes.length > 0 ? (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs flex items-center gap-1 w-full dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={() => openRemotesModal(item.configData!.remotes!)}
                  >
                    <Network className="h-3 w-3" />
                    Add Remotes ({item.configData.remotes.length})
                  </Button>
                </div>
              ) : null}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full border-dashed dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Plus className="mr-2 h-4 w-4" /> Add another module
          </Button>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
          >
            {loading ? 'Loading...' : 'Load Config'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
