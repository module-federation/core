import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  Settings2,
  Check,
  Zap,
  Trash2,
  Plus,
} from 'lucide-react';
import type { TreeshakeResult } from '@/utils/treeshakeShared';
import { SharedItemInput } from './SharedItemInput';
import { RegistryAnalyzeModal } from './RegistryAnalyzeModal';

export interface BuildConfigState {
  target: string;
  plugins: string;
  shared: string;
}

export interface SharedItem {
  id: string;
  name: string;
  version: string;
  exports: string[];
}

export interface AnalyzeFormProps {
  sharedItems: SharedItem[];
  setSharedItems: React.Dispatch<React.SetStateAction<SharedItem[]>>;
  config: BuildConfigState;
  setConfig: (updater: (prev: BuildConfigState) => BuildConfigState) => void;
  formErrors: {
    items?: Record<
      string,
      { name?: string; version?: string; exports?: string }
    >;
    sharedConfig?: string;
  };
  loading: boolean;
  advancedOpen: boolean;
  setAdvancedOpen: (v: boolean) => void;
  onSubmit: (e: FormEvent) => void;
  onReset: () => void;
  setFullTreeshakeResult: (result: TreeshakeResult | null) => void;
}

export default function AnalyzeForm({
  sharedItems,
  setSharedItems,
  config,
  setConfig,
  formErrors,
  loading,
  advancedOpen,
  setAdvancedOpen,
  onSubmit,
  onReset,
  setFullTreeshakeResult,
}: AnalyzeFormProps) {
  const { t } = useTranslation();
  const [registryModalOpen, setRegistryModalOpen] = useState(false);

  const updateItem = <K extends keyof SharedItem>(
    id: string,
    field: K,
    value: SharedItem[K],
  ) => {
    setSharedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    setSharedItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', version: '', exports: [] },
    ]);
  };

  const removeItem = (id: string) => {
    setSharedItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((item) => item.id !== id);
    });
  };

  return (
    <Card className="relative border-slate-200/80 bg-white/80 shadow-xl shadow-sky-500/20 backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-900/90">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Zap className="h-4 w-4 text-sky-500" />
              {t('analyze.formCardTitle')}
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              {t('analyze.formCardDesc')}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => {
                setSharedItems([
                  {
                    id: '1',
                    name: 'antd',
                    version: '6.1.0',
                    exports: ['Button', 'List', 'Badge'],
                  },
                ]);
                setConfig((prev) => ({
                  ...prev,
                  shared: 'react@18.2.0\nreact-dom@18.2.0',
                  target: 'web\nbrowserslist:> 0.01%,not dead,not op_mini all',
                  plugins: '',
                }));
              }}
            >
              {t('common.fillDemo')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              onClick={() => setRegistryModalOpen(true)}
            >
              {t('common.importManifest')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={onReset}
            >
              {t('common.reset')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-5 text-sm">
        <RegistryAnalyzeModal
          open={registryModalOpen}
          onOpenChange={setRegistryModalOpen}
          setSharedItems={setSharedItems}
          setConfig={setConfig}
        />
        <form className="space-y-4" onSubmit={onSubmit}>
          {sharedItems.map((item, index) => (
            <div
              key={item.id}
              className="relative rounded-lg border border-slate-200/60 bg-white/50 p-3 dark:border-slate-800/60 dark:bg-slate-900/50"
            >
              {sharedItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute right-2 top-2 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <SharedItemInput
                item={item}
                updateItem={updateItem}
                config={config}
                setConfig={setConfig}
                removeItem={removeItem}
                formErrors={formErrors.items?.[item.id]}
                loading={loading}
                setFullTreeshakeResult={
                  index === 0 ? setFullTreeshakeResult : undefined
                }
                allItems={sharedItems}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed text-xs"
            onClick={addItem}
          >
            <Plus className="mr-2 h-3 w-3" /> Add another shared module
          </Button>

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50/90 px-3 py-2 text-xs shadow-sm dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300">
                  <Settings2 className="h-3 w-3" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {t('advanced.title')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('advanced.subtitle')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px]"
                  >
                    {advancedOpen ? (
                      <>
                        <>{t('advanced.collapse')}</>
                        <ChevronUp className="ml-1 h-3 w-3" />
                      </>
                    ) : (
                      <>
                        <>{t('advanced.expand')}</>
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            <CollapsibleContent className="mt-3 space-y-3 rounded-xl border border-slate-200/80 bg-white/90 p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <span>{t('advanced.sharedLabel')}</span>
                  {formErrors.sharedConfig && (
                    <span className="text-[11px] text-red-500">
                      {formErrors.sharedConfig}
                    </span>
                  )}
                </label>
                <Textarea
                  value={config.shared || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, shared: e.target.value }))
                  }
                  placeholder={t('advanced.sharedPlaceholder')}
                  className={cn(
                    'h-20 bg-slate-50/80 text-xs dark:bg-slate-900/80',
                    formErrors.sharedConfig &&
                      'border-red-500/70 ring-1 ring-red-500/40',
                  )}
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('advanced.sharedDesc')}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {t('advanced.targetLabel')}
                </label>
                <Textarea
                  value={config.target}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, target: e.target.value }))
                  }
                  placeholder={t('advanced.targetPlaceholder')}
                  className="h-20 bg-slate-50/80 text-xs dark:bg-slate-900/80"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('advanced.targetDesc')}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {t('advanced.pluginsLabel')}
                </label>
                <Input
                  value={config.plugins || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, plugins: e.target.value }))
                  }
                  placeholder={t('advanced.pluginsPlaceholder')}
                  className="h-8 bg-slate-50/80 text-xs dark:bg-slate-900/80"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {t('advanced.pluginsDesc')}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                <Check className="h-3 w-3" />
              </div>
              <span>{t('common.formSubmitHint')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-fuchsia-500 to-emerald-500 px-5 text-sm font-medium text-white shadow-lg shadow-sky-500/40 transition-transform hover:translate-y-0.5 hover:shadow-xl disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin" />
                    {t('common.submitLoading')}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    {t('common.submitIdle')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
