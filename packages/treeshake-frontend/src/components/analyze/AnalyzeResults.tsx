import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Code2, Copy, Download, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { BundleStats } from '@/utils/treeshakeShared';

type AnalyzeResultsProps = {
  result: (BundleStats & { sharedName: string })[] | null;
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightCode(code: string): string {
  const escaped = escapeHtml(code);
  return escaped.replace(
    /(\/\/.*$)|(".*?"|'.*?'|`.*?`)|\b(export|import|from|const|let|var|function|return|if|else|class|extends|new|async|await|try|catch|finally|switch|case|default)\b|\b(string|number|boolean|Promise|Array|Record|any|void|unknown)\b/gm,
    (match, comment, string, keyword, type) => {
      if (comment) return `<span class="text-zinc-500">${comment}</span>`;
      if (string) return `<span class="text-emerald-400">${string}</span>`;
      if (keyword)
        return `<span class="text-sky-400 font-semibold">${keyword}</span>`;
      if (type) return `<span class="text-purple-300">${type}</span>`;
      return match;
    },
  );
}

function CodePanel({
  title,
  code,
  fileName,
}: {
  title: string;
  code: string;
  fileName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const { displayCode, truncated } = useMemo(() => {
    const lines = code ? code.split('\n') : [];
    if (!lines.length)
      return {
        displayCode: t('common.bundleEmptyPlaceholder'),
        truncated: false,
      };
    if (expanded || lines.length <= 80)
      return { displayCode: code, truncated: false };
    return { displayCode: lines.slice(0, 80).join('\n'), truncated: true };
  }, [code, expanded, t]);
  const highlighted = useMemo(() => highlightCode(displayCode), [displayCode]);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: t('common.copySuccessTitle'),
        description: t('common.copySuccessDescFile', { file: fileName }),
      });
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast({
        title: t('common.copyErrorTitle'),
        description: t('common.copyErrorDesc'),
        variant: 'destructive',
      });
    }
  };
  const handleDownload = () => {
    try {
      const blob = new Blob([code || ''], {
        type: 'text/javascript;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast({
        title: t('common.downloadErrorTitle'),
        description: t('common.downloadErrorDesc'),
        variant: 'destructive',
      });
    }
  };
  return (
    <Card className="flex h-full flex-col border-zinc-200/70 bg-white/80 shadow-lg shadow-sky-500/5 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/80">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Code2 className="h-4 w-4 text-sky-500" />
            {title}
          </CardTitle>
          <CardDescription className="text-xs">{fileName}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs"
            onClick={handleCopy}
          >
            <Copy className="mr-1 h-3 w-3" />
            {copied ? t('common.copied') : t('common.copy')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-2 text-xs"
            onClick={handleDownload}
          >
            <Download className="mr-1 h-3 w-3" />
            {t('common.download')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 pb-4">
        <div className="relative max-h-96 overflow-auto rounded-xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-4 text-xs leading-relaxed text-zinc-50 shadow-inner">
          <pre className="whitespace-pre text-[11px]">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
          {truncated && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/90 to-transparent" />
          )}
        </div>
        {truncated && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 h-8 w-full text-xs"
            onClick={() => setExpanded(true)}
          >
            {t('common.showAllCode')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function AnalyzeResultTabContent({
  result,
}: {
  result: BundleStats & { sharedName: string };
}) {
  const { t } = useTranslation();
  const fullSize = result.full.size ?? 0;
  const treeshakeSize = result.treeshake.size ?? 0;
  const savedBytes = Math.max(fullSize - treeshakeSize, 0);
  const savedPercent = fullSize > 0 ? (savedBytes / fullSize) * 100 : 0;
  const fullKbValue = fullSize / 1024;
  const treeshakeKbValue = treeshakeSize / 1024;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-lg shadow-sky-500/10 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-2.5 text-[11px] font-medium tracking-wide text-slate-600 dark:border-slate-700 dark:text-slate-300">
            <span>{t('results.overviewTitle')}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Sparkles className="h-3 w-3" />
              {t('results.overviewDoneBadge')}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr className="bg-slate-50/90 text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                  <th className="w-32 px-4 py-2 text-left font-medium">
                    {t('results.tableMetric')}
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    {t('results.tableFull')}
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    {t('results.tableTreeshake')}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100/90 dark:border-slate-800/90">
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                    {t('results.metricSize')}
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-slate-800 dark:text-slate-100">
                    {fullKbValue ? `${fullKbValue.toFixed(1)} KB` : '--'}
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-emerald-500 dark:text-emerald-300">
                    {treeshakeKbValue
                      ? `${treeshakeKbValue.toFixed(1)} KB`
                      : '--'}
                  </td>
                </tr>
                <tr className="border-t border-slate-100/90 dark:border-slate-800/90">
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                    {t('results.metricLoadTime')}
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-slate-800 dark:text-slate-100">{`~${Math.round(result.full.resourcePerf.duration || 0)} ms`}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-emerald-500 dark:text-emerald-300">{`~${Math.round(result.treeshake.resourcePerf.duration || 0)} ms`}</td>
                </tr>
                <tr className="border-t border-slate-100/90 dark:border-slate-800/90">
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                    {t('results.metricModules')}
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-slate-800 dark:text-slate-100">
                    {result.full.modules.names?.length}
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-emerald-500 dark:text-emerald-300">
                    {result.treeshake.modules.names?.length}
                  </td>
                </tr>
                <tr className="border-t border-slate-100/90 dark:border-slate-800/90">
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                    {t('results.metricSavedPercent')}
                  </td>
                  <td className="px-4 py-2 text-[11px] text-slate-400">
                    {t('results.metricSavedPercentNA')}
                  </td>
                  <td className="px-4 py-2 font-mono text-[11px] text-fuchsia-500 dark:text-fuchsia-300">
                    {savedPercent > 0 ? `${savedPercent.toFixed(1)}%` : '--'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-zinc-200/80 bg-white/90 shadow-md shadow-sky-500/10 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <CardHeader className="pb-3">
            <CardDescription className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t('results.cardFullTitle')}
            </CardDescription>
            <CardTitle className="flex items-baseline gap-2 text-xl">
              <span>{fullKbValue > 0 ? fullKbValue.toFixed(1) : '--'}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                KB
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <p>{t('results.cardFullDesc')}</p>
            <div className="flex items-center gap-2">
              <p>
                {t('results.cardFullModules', {
                  count: result.full.modules.names?.length,
                })}
              </p>
              {result.full.modules.names?.length && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Info className="h-3 w-3 text-slate-400" />
                      <span className="sr-only">View modules</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <div className="border-b border-slate-100 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:text-slate-300">
                      Module Exports
                    </div>
                    <ScrollArea className="h-64">
                      <div className="p-2">
                        {result.full.modules.names!.map((name, i) => (
                          <div
                            key={i}
                            className="rounded px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
                          >
                            {name}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 bg-white/90 shadow-md shadow-emerald-500/10 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <CardHeader className="pb-3">
            <CardDescription className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t('results.cardTreeshakeTitle')}
            </CardDescription>
            <CardTitle className="flex items-baseline gap-2 text-xl">
              <span>
                {treeshakeKbValue > 0 ? treeshakeKbValue.toFixed(1) : '--'}
              </span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                KB
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <p>{t('results.cardTreeshakeDesc')}</p>
            <div className="flex items-center gap-2">
              <p>
                {t('results.cardTreeshakeModules', {
                  count: result.treeshake.modules.names?.length,
                })}
              </p>
              {result.treeshake.modules.names?.length && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Info className="h-3 w-3 text-slate-400" />
                      <span className="sr-only">View modules</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <div className="border-b border-slate-100 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:text-slate-300">
                      Module Exports
                    </div>
                    <ScrollArea className="h-64">
                      <div className="p-2">
                        {result.treeshake.modules.names!.map((name, i) => (
                          <div
                            key={i}
                            className="rounded px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
                          >
                            {name}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 bg-white/90 shadow-md shadow-fuchsia-500/10 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <CardHeader className="pb-3">
            <CardDescription className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t('results.cardSavedTitle')}
            </CardDescription>
            <CardTitle className="flex items-baseline gap-2 text-xl">
              <span>
                {savedBytes > 0 ? (savedBytes / 1024).toFixed(1) : '--'}
              </span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                KB
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <p>{t('results.cardSavedDesc')}</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span>{t('results.cardSavedPercentLabel')}</span>
                <span>
                  {savedPercent > 0 ? savedPercent.toFixed(1) : '--'}
                  {t('results.cardSavedPercentUnit')}
                </span>
              </div>
              <Progress
                value={savedPercent}
                className="h-2 bg-fuchsia-500/10"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200/80 bg-white/90 shadow-md shadow-emerald-500/10 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/90">
          <CardHeader className="pb-3">
            <CardDescription className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t('results.cardKeptTitle')}
            </CardDescription>
            <CardTitle className="flex items-baseline gap-2 text-xl">
              <span>{result.treeshake.modules.names?.length}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                {t('results.cardKeptExportsUnit')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <p>{t('results.cardKeptDesc')}</p>
            <p>
              {t('results.cardKeptFullCount', {
                count: result.full.modules.names?.length,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
            {t('results.codeCompareTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('results.codeCompareDesc')}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CodePanel
            title={t('results.cardFullTitle')}
            code={result.full.js ?? ''}
            fileName="shared.full.js"
          />
          <CodePanel
            title={t('results.cardTreeshakeTitle')}
            code={result.treeshake.js ?? ''}
            fileName="shared.treeshake.js"
          />
        </div>
      </section>
    </div>
  );
}

export default function AnalyzeResults({ result }: AnalyzeResultsProps) {
  if (!result || result.length === 0) return null;

  return (
    <section id="results" className="space-y-6">
      <Tabs defaultValue={result[0].sharedName} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {result.map((item) => (
            <TabsTrigger key={item.sharedName} value={item.sharedName}>
              {item.sharedName}
            </TabsTrigger>
          ))}
        </TabsList>
        {result.map((item) => (
          <TabsContent key={item.sharedName} value={item.sharedName}>
            <AnalyzeResultTabContent result={item} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
