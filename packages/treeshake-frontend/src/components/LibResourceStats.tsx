import React, { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import {
  type LibResourceRecord,
  type SizeSource,
  type SizeStatus,
} from '@/utils/resourceScanner';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

function formatBytesToKB(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0.00';
  return (bytes / 1024).toFixed(2);
}

function truncateMiddle(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const keep = Math.floor((maxLength - 1) / 2);
  return `${text.slice(0, keep)}…${text.slice(-keep)}`;
}

function getSizeSourceLabel(source: SizeSource): string {
  switch (source) {
    case 'performance':
      return 'Source: PerformanceResourceTiming';
    case 'head':
      return 'Source: HEAD Content-Length';
    case 'estimated':
      return 'Source: TextEncoder estimate';
    default:
      return 'Source: Unknown';
  }
}

function getSizeStatusLabel(status: SizeStatus): string {
  switch (status) {
    case 'restricted':
      return 'Restricted by TAO/cache; estimated or partially unavailable';
    case 'unavailable':
      return 'Unable to obtain a valid value';
    default:
      return '';
  }
}

function SizeTooltip({
  value,
  record,
  fieldLabel,
}: {
  value: number | null;
  record: LibResourceRecord;
  fieldLabel: string;
}) {
  if (!value) {
    const statusLabel = getSizeStatusLabel(record.sizeStatus);
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help text-slate-400">
              {record.sizeStatus === 'restricted'
                ? 'Restricted'
                : 'Unavailable'}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {fieldLabel}:{' '}
              {record.sizeStatus === 'restricted'
                ? 'Restricted'
                : 'Unavailable'}
            </p>
            {statusLabel && (
              <p className="text-xs text-slate-400">{statusLabel}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const kb = formatBytesToKB(value);
  const sourceLabel = getSizeSourceLabel(record.sizeSource);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help">{kb}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {fieldLabel}: {kb} KB
          </p>
          <p className="text-xs text-slate-400">{sourceLabel}</p>
          {record.notes && (
            <p className="text-xs text-slate-400">{record.notes}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function LibraryBadges({ libraries }: { libraries: string[] }) {
  if (!libraries.length) return null;

  return (
    <div className="flex gap-1 flex-wrap">
      {libraries.map((lib) => {
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' =
          'secondary';
        if (lib === 'lodash-es') variant = 'outline';
        if (lib === 'lodash') variant = 'outline';

        return (
          <Badge
            key={lib}
            variant={variant}
            className="text-[10px] px-1 py-0 h-5"
          >
            {lib}
          </Badge>
        );
      })}
    </div>
  );
}

export interface LibResourceStatsProps {
  records: LibResourceRecord[];
  loading?: boolean;
  lastScanAt?: Date | null;
  keywords?: string[];
  error?: string | null;
}

export const LibResourceStats: React.FC<LibResourceStatsProps> = ({
  records,
  loading = false,
  lastScanAt = null,
  keywords = ['antd'],
  error = null,
}) => {
  const summaryText = useMemo(() => {
    if (loading) return 'Scanning current page script resources…';
    if (!records.length) {
      if (lastScanAt) {
        return `Scan completed, but no same-origin scripts containing ${keywords.join(', ')} were detected (some may be excluded due to cross-origin or timeout).`;
      }
      return 'No scan yet.';
    }
    return `Detected ${records.length} script resources containing ${keywords.join(', ')} related code.`;
  }, [loading, records.length, lastScanAt, keywords]);

  return (
    <motion.div
      className="rounded-xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, transition: { duration: 0.18, ease: 'easeOut' } }}
    >
      <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-slate-700">
        <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Resource Size Monitor
        </h1>
        <div className="flex items-center gap-2">
          {lastScanAt ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Last scan: {lastScanAt.toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>About script resource sizes</AlertTitle>
          <AlertDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-1">
            <div>
              Only same-origin script resources on the current page are counted,
              and detection is based on whether the full URL contains "
              {keywords.join(', ')}".
            </div>
            <div>
              transferSize / encodedBodySize / decodedBodySize may be affected
              by cross-origin TAO, caching and compression, and can be 0 or
              missing.
            </div>
            <div>
              For 0-sized fields, this component falls back to HEAD
              Content-Length or TextEncoder estimates. Estimated values are for
              reference and may differ from actual network transfer.
            </div>
          </AlertDescription>
        </Alert>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          {summaryText}
        </div>

        <div className="rounded-md border border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Resource URL</TableHead>
                <TableHead>Libraries</TableHead>
                <TableHead className="text-right">Encoded (KB)</TableHead>
                <TableHead className="text-right">Decoded (KB)</TableHead>
                <TableHead className="text-right">Transfer (KB)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-xs">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help truncate block max-w-[300px]">
                            {truncateMiddle(record.url, 60)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-sm break-all">{record.url}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <LibraryBadges libraries={record.libraries} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    <SizeTooltip
                      value={record.encodedBodySize}
                      record={record}
                      fieldLabel="Encoded"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    <SizeTooltip
                      value={record.decodedBodySize}
                      record={record}
                      fieldLabel="Decoded"
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    <SizeTooltip
                      value={record.transferSize}
                      record={record}
                      fieldLabel="Transfer"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {!loading && records.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-xs text-slate-500"
                  >
                    No resources found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {error ? <div className="text-xs text-red-500">{error}</div> : null}
      </div>
    </motion.div>
  );
};
