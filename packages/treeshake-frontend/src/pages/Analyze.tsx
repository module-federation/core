import { useState } from 'react';
import type { FormEvent } from 'react';
import AnalyzeFormCmp, {
  type BuildConfigState,
} from '@/components/analyze/AnalyzeForm';
import AnalyzeResultsCmp from '@/components/analyze/AnalyzeResults';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import {
  treeshakeShared,
  type RequestPayload,
  type BundleStats,
  type TreeshakeResult,
} from '@/utils/treeshakeShared';
import { getInitialConfig } from '@/utils/getInitialConfig';

export interface SharedItem {
  id: string;
  name: string;
  version: string;
  exports: string[];
}

interface FormErrors {
  items?: Record<string, { name?: string; version?: string; exports?: string }>;
  sharedConfig?: string;
}

import { parseSharedConfig } from '@/utils/sharedConfig';

export default function AnalyzePage() {
  const { t } = useTranslation();
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([
    { id: '1', name: '', version: '', exports: [] },
  ]);
  const [config, setConfig] = useState<BuildConfigState>(() =>
    getInitialConfig(),
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<
    (BundleStats & { sharedName: string })[] | null
  >(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [fullTreeshakeResult, setFullTreeshakeResult] =
    useState<TreeshakeResult | null>(null);

  const scrollToResults = () => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById('results');
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96; // 96px is pb-24 (6rem)
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const fireConfetti = (origin?: { x: number; y: number }) => {
    if (typeof window === 'undefined') return;
    const { x = 0.5, y = 0.5 } = origin || {};
    const defaults = { origin: { x, y }, zIndex: 100 };

    confetti({
      ...defaults,
      particleCount: 150,
      spread: 180,
      startVelocity: 45,
      angle: 90,
      gravity: 1.2,
      drift: 0,
      ticks: 300,
    });
  };

  const handleSubmit = async (event?: FormEvent) => {
    let btnRect: DOMRect | undefined;
    if (event) {
      event.preventDefault();
      const nativeEvent = event.nativeEvent as unknown as {
        submitter: HTMLElement;
      };
      if (nativeEvent.submitter) {
        btnRect = nativeEvent.submitter.getBoundingClientRect();
      }
    }
    const errors: FormErrors = { items: {} };
    let hasError = false;

    sharedItems.forEach((item) => {
      const itemErrors: { name?: string; version?: string; exports?: string } =
        {};
      if (!item.name.trim())
        itemErrors.name = t('analyze.formErrorSharedRequired');
      if (!item.version.trim())
        itemErrors.version = t('analyze.formErrorVersionRequired');
      if (!item.exports.length)
        itemErrors.exports = t('analyze.formErrorExportsRequired');

      if (Object.keys(itemErrors).length > 0) {
        hasError = true;
        errors.items![item.id] = itemErrors;
      }
    });

    if (config.shared) {
      const items = config.shared
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const item of items) {
        const parts = item.split('@');
        if (parts.length < 2) {
          errors.sharedConfig = t('analyze.sharedVersionRequired', {
            name: item,
          });
          hasError = true;
          break;
        }
      }
    }

    setFormErrors(errors);
    if (hasError) {
      toast({
        title: t('analyze.formErrorTitleIncomplete'),
        description: t('analyze.formErrorDescIncomplete'),
        variant: 'destructive',
      });
      return;
    }
    try {
      const primaryItem = sharedItems[0];
      const extraItems = sharedItems
        .slice(1)
        .map(
          (item) =>
            [
              item.name.trim(),
              item.version.trim(),
              item.exports.map((e) => e.trim()).filter(Boolean),
            ] as [string, string, string[]],
        );

      const payload: RequestPayload = {
        sharedName: primaryItem.name.trim(),
        sharedVersion: primaryItem.version.trim(),
        shared: [
          [
            primaryItem.name.trim(),
            primaryItem.version.trim(),
            primaryItem.exports.map((e) => e.trim()).filter(Boolean),
          ],
        ],
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

      payload.shared.push(...extraItems);

      if (config.shared) {
        const extraShared = parseSharedConfig(config.shared);
        payload.shared.push(...extraShared);
      }

      const names = payload.shared.map((s) => s[0]);
      const uniqueNames = new Set(names);
      if (uniqueNames.size !== names.length) {
        const duplicates = names.filter(
          (item, index) => names.indexOf(item) !== index,
        );
        const uniqueDuplicates = [...new Set(duplicates)];
        throw new Error(
          t('analyze.errorDuplicateSharedDeps', {
            names: uniqueDuplicates.join(', '),
          }),
        );
      }

      setLoading(true);
      if (!fullTreeshakeResult) {
        throw new Error(t('analyze.errorNoFullResult'));
      }
      const res = await treeshakeShared(payload, fullTreeshakeResult);
      if (!res || res.length === 0) {
        throw new Error(t('analyze.errorRequestFailed'));
      }
      const bundleStats = res;
      setResult(bundleStats);
      toast({
        title: t('analyze.analyzeSuccessTitle'),
        description: t('analyze.analyzeSuccessDesc'),
      });

      if (btnRect) {
        const x = 0.5;
        const y = (btnRect.top + btnRect.height / 2) / window.innerHeight;
        fireConfetti({ x, y });
      } else {
        fireConfetti();
      }
      setTimeout(scrollToResults, 300);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('analyze.analyzeErrorDescFallback');
      toast({
        title: t('analyze.analyzeErrorTitle'),
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSharedItems([{ id: '1', name: '', version: '', exports: [] }]);
    setFormErrors({});
    setResult(null);
  };

  return (
    <>
      <section className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-3xl flex-col justify-center pb-24 pt-10">
        <AnalyzeFormCmp
          sharedItems={sharedItems}
          setSharedItems={setSharedItems}
          config={config}
          setConfig={setConfig}
          formErrors={formErrors}
          loading={loading}
          advancedOpen={advancedOpen}
          setAdvancedOpen={setAdvancedOpen}
          onSubmit={handleSubmit}
          onReset={handleReset}
          setFullTreeshakeResult={setFullTreeshakeResult}
        />
      </section>

      {result && <AnalyzeResultsCmp result={result} />}
    </>
  );
}
