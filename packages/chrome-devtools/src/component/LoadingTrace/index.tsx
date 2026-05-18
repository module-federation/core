import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Empty, Input, Modal, Switch } from '@arco-design/web-react';
import {
  IconDownload,
  IconPlayArrow,
  IconQuestionCircle,
  IconRefresh,
  IconSearch,
  IconSettings,
} from '@arco-design/web-react/icon';
import { useTranslation } from 'react-i18next';

import {
  applyObservabilityConfig,
  disableObservabilityConfig,
  getObservabilityReportScopeLabel,
  mergeObservabilityReports,
  readObservabilityConfig,
  readObservabilitySnapshot,
  reloadInspectedPage,
  type ObservabilityDevtoolsReport,
} from '../../utils/chrome/observability';
import {
  DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG,
  normalizeObservabilityDevtoolsConfig,
  type ObservabilityDevtoolsConfig,
  type ObservabilityDevtoolsLevel,
} from '../../utils/chrome/observability-shared';
import { MESSAGE_OBSERVABILITY_DEVTOOLS_EVENT } from '../../utils/chrome/messages';
import styles from './index.module.scss';

interface LoadingTraceProps {
  tabId?: number;
  resetKey?: number;
}

interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: Array<SegmentedOption<T>>;
  onChange(value: T): void;
}

interface FieldLabelProps {
  label: string;
  tip: string;
}

const FieldLabel = ({ label, tip }: FieldLabelProps) => (
  <span className={styles.labelWithHelp}>
    <span className={styles.labelText}>{label}</span>
    <span
      className={styles.helpIcon}
      data-tip={tip}
      tabIndex={0}
      aria-label={tip}
    >
      <IconQuestionCircle />
    </span>
    <span className={styles.labelColon}>:</span>
  </span>
);

const SegmentedControl = <T extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) => (
  <div className={styles.segmentedControl} role="group">
    {options.map((option) => {
      const isActive = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          className={`${styles.segmentButton} ${
            isActive ? styles.segmentButtonActive : ''
          }`}
          aria-pressed={isActive}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

const formatTime = (timestamp?: number) => {
  if (!timestamp) {
    return '-';
  }
  try {
    return new Date(timestamp).toLocaleTimeString();
  } catch {
    return '-';
  }
};

const getReportTitle = (report: ObservabilityDevtoolsReport) =>
  report.requestId ||
  report.remote?.name ||
  report.shared?.name ||
  report.traceId ||
  'unknown';

const getReportOutcome = (report: ObservabilityDevtoolsReport) =>
  report.summary?.outcome || report.status || 'pending';

const parseStableVersion = (version?: string) => {
  const matched = version?.match(/^(\d+)\.(\d+)\.(\d+)(?:\+[\w.-]+)?$/);
  if (!matched) {
    return null;
  }

  return {
    major: Number(matched[1]),
    minor: Number(matched[2]),
    patch: Number(matched[3]),
  };
};

const isVersionLessThan = (
  version: ReturnType<typeof parseStableVersion>,
  target: { major: number; minor: number; patch: number },
) => {
  if (!version) {
    return false;
  }
  if (version.major !== target.major) {
    return version.major < target.major;
  }
  if (version.minor !== target.minor) {
    return version.minor < target.minor;
  }
  return version.patch < target.patch;
};

const getLimitedObservabilityLabel = (report: ObservabilityDevtoolsReport) => {
  const runtimeVersion = parseStableVersion(report.runtimeVersion);
  if (
    runtimeVersion &&
    isVersionLessThan(runtimeVersion, { major: 2, minor: 5, patch: 0 })
  ) {
    return 'lowVersion';
  }

  if (!report.runtimeVersion) {
    return 'unknownVersion';
  }

  return undefined;
};

const getReportState = (report: ObservabilityDevtoolsReport) => {
  const outcome = getReportOutcome(report);
  const limitedObservability = getLimitedObservabilityLabel(report);
  if (outcome === 'recovered' || report.summary?.recovered) {
    return 'recovered';
  }
  if (
    report.status === 'error' ||
    outcome === 'failed' ||
    report.failedPhase ||
    report.errorMessage
  ) {
    return 'failed';
  }
  if (
    outcome === 'pending' &&
    report.status === 'success' &&
    limitedObservability
  ) {
    return 'success';
  }
  if (outcome === 'pending') {
    return 'pending';
  }
  if (report.status === 'success') {
    return 'success';
  }
  return 'pending';
};

const getEventStatusState = (status?: string) => {
  switch (status) {
    case 'success':
    case 'complete':
      return 'success';
    case 'error':
    case 'failed':
      return 'failed';
    case 'start':
    case 'pending':
      return 'pending';
    default:
      return 'neutral';
  }
};

const getReportSearchText = (report: ObservabilityDevtoolsReport) =>
  [
    getReportTitle(report),
    report.traceId,
    report.status,
    getReportOutcome(report),
    report.hostName,
    report.runtimeVersion,
    report.remote?.name,
    report.remote?.alias,
    report.remote?.entry,
    report.shared?.name,
    report.shared?.provider,
    report.shared?.requiredVersion,
    report.shared?.selectedVersion,
    report.shared?.availableVersions?.join(' '),
    report.expose,
    report.failedPhase,
    report.errorCode,
    report.errorName,
    report.errorMessage,
    report.ownerHint,
    report.summary?.recovered ? 'recovered' : undefined,
    report.summary?.lastPhase,
    report.diagnosis?.title,
    report.loadedBefore?.consumers
      ?.map((consumer) =>
        [consumer.name, ...(consumer.exposes || [])].join(' '),
      )
      .join(' '),
    report.__scope,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const fuzzyMatchReport = (
  report: ObservabilityDevtoolsReport,
  keyword: string,
) => {
  const tokens = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return true;
  }
  const haystack = getReportSearchText(report);
  return tokens.every((token) => haystack.includes(token));
};

const downloadJson = (name: string, data: unknown) => {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
};

interface CurrentLoadRow {
  labelKey: string;
  value?: string | number | boolean | false;
}

const formatCurrentLoadValue = (
  value: string | number | boolean | false | undefined,
) => {
  if (value === false) {
    return 'false';
  }
  if (value === true) {
    return 'true';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return value || undefined;
};

const getConfigSignature = (config: ObservabilityDevtoolsConfig) =>
  JSON.stringify(normalizeObservabilityDevtoolsConfig(config));

interface LoadingTraceTabCache {
  reports: ObservabilityDevtoolsReport[];
  selectedTraceId?: string;
}

const getLoadingTraceTabKey = (tabId?: number) =>
  typeof tabId === 'number' ? String(tabId) : 'unknown';

const LoadingTrace = ({ tabId, resetKey = 0 }: LoadingTraceProps) => {
  const { t } = useTranslation();
  const [config, setConfig] = useState<ObservabilityDevtoolsConfig>(
    DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG,
  );
  const [savedConfig, setSavedConfig] = useState<ObservabilityDevtoolsConfig>(
    DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG,
  );
  const [stored, setStored] = useState(false);
  const [reports, setReports] = useState<ObservabilityDevtoolsReport[]>([]);
  const [scopes, setScopes] = useState<string[]>([]);
  const [hasUserObservabilityPlugin, setHasUserObservabilityPlugin] =
    useState(false);
  const [selectedTraceId, setSelectedTraceId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [reportKeyword, setReportKeyword] = useState('');
  const refreshTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const userPluginPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const tabCacheRef = useRef<Map<string, LoadingTraceTabCache>>(new Map());
  const activeTabKey = useMemo(() => getLoadingTraceTabKey(tabId), [tabId]);
  const activeTabKeyRef = useRef(activeTabKey);
  const resetKeyRef = useRef(resetKey);

  const filteredReports = useMemo(
    () => reports.filter((report) => fuzzyMatchReport(report, reportKeyword)),
    [reports, reportKeyword],
  );

  const selectedReport = useMemo(
    () =>
      filteredReports.find((report) => report.traceId === selectedTraceId) ||
      filteredReports[0],
    [filteredReports, selectedTraceId],
  );

  const latestReport = reports[0];
  const isObservabilityEnabled = stored && config.enabled !== false;
  const isConfigDirty = useMemo(
    () => getConfigSignature(config) !== getConfigSignature(savedConfig),
    [config, savedConfig],
  );
  const levelOptions = useMemo<
    Array<SegmentedOption<ObservabilityDevtoolsLevel>>
  >(
    () => [
      {
        label: t('loadingTrace.config.verbose'),
        value: 'verbose',
      },
      {
        label: t('loadingTrace.config.summary'),
        value: 'summary',
      },
      {
        label: t('loadingTrace.config.error'),
        value: 'error',
      },
    ],
    [t],
  );
  const shouldShowApplyButton = !isObservabilityEnabled || isConfigDirty;
  const emptyDescription = useMemo(() => {
    if (!hasUserObservabilityPlugin && !isObservabilityEnabled) {
      return t('loadingTrace.emptyEnableChrome');
    }

    return t('loadingTrace.empty');
  }, [hasUserObservabilityPlugin, isObservabilityEnabled, t]);
  const sourceStateLabel = isObservabilityEnabled
    ? 'ON'
    : hasUserObservabilityPlugin
      ? 'CUSTOM'
      : 'OFF';
  const eventCount = useMemo(
    () =>
      reports.reduce(
        (count, report) => count + (report.events?.length || 0),
        0,
      ),
    [reports],
  );

  const applyTabCache = useCallback(
    (
      tabKey: string,
      update:
        | LoadingTraceTabCache
        | ((current: LoadingTraceTabCache) => LoadingTraceTabCache),
    ) => {
      const current = tabCacheRef.current.get(tabKey) || {
        reports: [],
        selectedTraceId: undefined,
      };
      const next = typeof update === 'function' ? update(current) : update;
      tabCacheRef.current.set(tabKey, next);
      if (activeTabKeyRef.current === tabKey) {
        setReports(next.reports);
        setSelectedTraceId(next.selectedTraceId);
      }
      return next;
    },
    [],
  );

  const clearTabCache = useCallback(
    (tabKey: string) =>
      applyTabCache(tabKey, {
        reports: [],
        selectedTraceId: undefined,
      }),
    [applyTabCache],
  );

  const refreshSnapshot = useCallback(
    async (targetTabKey = activeTabKeyRef.current) => {
      const snapshot = await readObservabilitySnapshot();
      setConfig(snapshot.config);
      setSavedConfig(snapshot.config);
      setStored(snapshot.stored);
      setScopes(snapshot.scopes);
      setHasUserObservabilityPlugin(snapshot.hasUserObservabilityPlugin);
      const cached = tabCacheRef.current.get(targetTabKey) || {
        reports: [],
        selectedTraceId: undefined,
      };
      const mergedReports = mergeObservabilityReports(
        cached.reports,
        snapshot.reports,
      );
      const nextCache = applyTabCache(targetTabKey, {
        reports: mergedReports,
        selectedTraceId: cached.selectedTraceId || snapshot.reports[0]?.traceId,
      });

      return {
        ...snapshot,
        reports: nextCache.reports,
      };
    },
    [applyTabCache],
  );

  const clearScheduledRefresh = useCallback(() => {
    refreshTimersRef.current.forEach((timer) => clearTimeout(timer));
    refreshTimersRef.current = [];
  }, []);

  const scheduleRefreshBurst = useCallback(() => {
    clearScheduledRefresh();
    const delays = [200, 600, 1200, 2400];
    const targetTabKey = activeTabKeyRef.current;

    refreshTimersRef.current = delays.map((delay, index) =>
      setTimeout(async () => {
        const snapshot = await refreshSnapshot(targetTabKey);
        const isLast = index === delays.length - 1;
        if (snapshot.reports.length) {
          setStatusText(t('loadingTrace.status.synced'));
          clearScheduledRefresh();
          return;
        }
        if (isLast) {
          setStatusText(t('loadingTrace.status.noReports'));
        }
      }, delay),
    );
  }, [clearScheduledRefresh, refreshSnapshot, t]);

  useEffect(() => {
    activeTabKeyRef.current = activeTabKey;
    const cached = tabCacheRef.current.get(activeTabKey);
    setReports(cached?.reports || []);
    setSelectedTraceId(cached?.selectedTraceId);
    setReportKeyword('');
  }, [activeTabKey]);

  useEffect(() => {
    if (resetKey === resetKeyRef.current) {
      return;
    }
    resetKeyRef.current = resetKey;
    clearScheduledRefresh();
    clearTabCache(activeTabKeyRef.current);
    setStatusText(t('loadingTrace.status.noReports'));
  }, [clearScheduledRefresh, clearTabCache, resetKey, t]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const pageConfig = await readObservabilityConfig();
        if (!cancelled) {
          setConfig(pageConfig);
          setSavedConfig(pageConfig);
        }
        const snapshot = await refreshSnapshot();
        if (!cancelled) {
          setStatusText(
            snapshot.stored
              ? t('loadingTrace.status.enabled')
              : snapshot.hasUserObservabilityPlugin
                ? t('loadingTrace.status.userPlugin')
                : t('loadingTrace.status.disabled'),
          );
        }
      } catch (error) {
        if (!cancelled) {
          setStatusText(t('loadingTrace.status.unavailable'));
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
      clearScheduledRefresh();
    };
  }, [clearScheduledRefresh, refreshSnapshot, t, tabId]);

  useEffect(() => {
    if (userPluginPollTimerRef.current) {
      clearInterval(userPluginPollTimerRef.current);
      userPluginPollTimerRef.current = null;
    }

    if (!hasUserObservabilityPlugin) {
      return;
    }

    let polling = false;
    userPluginPollTimerRef.current = setInterval(async () => {
      if (polling) {
        return;
      }
      polling = true;
      try {
        const snapshot = await refreshSnapshot(activeTabKeyRef.current);
        if (snapshot.reports.length) {
          setStatusText(t('loadingTrace.status.synced'));
        }
      } finally {
        polling = false;
      }
    }, 1500);

    return () => {
      if (userPluginPollTimerRef.current) {
        clearInterval(userPluginPollTimerRef.current);
        userPluginPollTimerRef.current = null;
      }
    };
  }, [hasUserObservabilityPlugin, refreshSnapshot, t]);

  useEffect(() => {
    const onMessage = (
      message: { type?: string; data?: any },
      sender: chrome.runtime.MessageSender,
    ) => {
      if (message?.type !== MESSAGE_OBSERVABILITY_DEVTOOLS_EVENT) {
        return;
      }
      const senderTabId = sender?.tab?.id;
      const messageTabKey = getLoadingTraceTabKey(senderTabId || tabId);
      const isCurrentTabMessage =
        !tabId || !senderTabId || senderTabId === tabId;

      const payload = message.data;
      if (payload?.config && isCurrentTabMessage) {
        const nextConfig = normalizeObservabilityDevtoolsConfig(payload.config);
        setConfig(nextConfig);
        setSavedConfig(nextConfig);
        setStored(payload.config.enabled !== false);
      }
      if (payload?.kind === 'installed' && isCurrentTabMessage) {
        setStatusText(t('loadingTrace.status.enabled'));
        scheduleRefreshBurst();
      }
      if (payload?.report?.traceId) {
        const report = {
          ...payload.report,
          __scope: payload.scope || payload.report.__scope,
        } as ObservabilityDevtoolsReport;
        applyTabCache(messageTabKey, (current) => ({
          reports: mergeObservabilityReports(current.reports, [report]),
          selectedTraceId: current.selectedTraceId || report.traceId,
        }));
        if (isCurrentTabMessage) {
          clearScheduledRefresh();
          setStatusText(t('loadingTrace.status.synced'));
        }
      }
    };

    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, [applyTabCache, clearScheduledRefresh, scheduleRefreshBurst, tabId, t]);

  const updateConfig = (patch: Partial<ObservabilityDevtoolsConfig>) => {
    setConfig((current) =>
      normalizeObservabilityDevtoolsConfig({
        ...current,
        ...patch,
      }),
    );
  };

  const applyAndReload = async () => {
    setBusy(true);
    try {
      const nextConfig = normalizeObservabilityDevtoolsConfig({
        ...config,
        enabled: true,
      });
      await applyObservabilityConfig(nextConfig);
      setConfig(nextConfig);
      setSavedConfig(nextConfig);
      setStored(true);
      clearTabCache(activeTabKeyRef.current);
      setStatusText(t('loadingTrace.status.reloading'));
      await reloadInspectedPage();
      scheduleRefreshBurst();
    } finally {
      setBusy(false);
    }
  };

  const confirmApply = () => {
    Modal.confirm({
      title: isObservabilityEnabled
        ? t('loadingTrace.confirm.updateTitle')
        : t('loadingTrace.confirm.observeTitle'),
      content: t('loadingTrace.confirm.content'),
      okText: t('loadingTrace.actions.confirm'),
      cancelText: t('loadingTrace.actions.cancel'),
      onOk: () => applyAndReload(),
    });
  };

  const disableAndReload = async () => {
    setBusy(true);
    try {
      await disableObservabilityConfig();
      clearScheduledRefresh();
      setStored(false);
      clearTabCache(activeTabKeyRef.current);
      setStatusText(t('loadingTrace.status.disabled'));
      await reloadInspectedPage();
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = async () => {
    setBusy(true);
    try {
      const snapshot = await refreshSnapshot();
      setStatusText(
        snapshot.reports.length
          ? t('loadingTrace.status.synced')
          : t('loadingTrace.status.noReports'),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () => {
    downloadJson(`mf-observability-${Date.now()}.json`, {
      exportedAt: new Date().toISOString(),
      config,
      scopes,
      reports,
    });
  };

  const currentLoadRows = useMemo<CurrentLoadRow[]>(() => {
    if (!selectedReport) {
      return [];
    }

    const rows: CurrentLoadRow[] = [
      {
        labelKey: 'consumer',
        value: selectedReport.hostName,
      },
    ];

    if (selectedReport.shared) {
      rows.push(
        {
          labelKey: 'shared',
          value: selectedReport.shared.name,
        },
        {
          labelKey: 'provider',
          value: selectedReport.shared.provider,
        },
        {
          labelKey: 'requiredVersion',
          value: selectedReport.shared.requiredVersion,
        },
        {
          labelKey: 'selectedVersion',
          value: selectedReport.shared.selectedVersion,
        },
        {
          labelKey: 'availableVersions',
          value: selectedReport.shared.availableVersions?.join(', '),
        },
      );
    } else {
      rows.push(
        {
          labelKey: 'request',
          value: selectedReport.requestId,
        },
        {
          labelKey: 'producer',
          value: selectedReport.remote?.alias || selectedReport.remote?.name,
        },
        {
          labelKey: 'remoteName',
          value: selectedReport.remote?.name,
        },
        {
          labelKey: 'expose',
          value: selectedReport.expose,
        },
      );
    }

    return rows.filter((row) => formatCurrentLoadValue(row.value));
  }, [selectedReport]);

  return (
    <div className={styles.wrapper}>
      <section className={styles.toolbar}>
        <div className={styles.titleGroup}>
          <span className={styles.title}>{t('loadingTrace.title')}</span>
          {statusText ? (
            <span className={styles.subtitle}>{statusText}</span>
          ) : null}
        </div>
        <div className={styles.actions}>
          <Button
            className={`${styles.configButton} ${
              showConfigPanel ? styles.configButtonActive : ''
            }`}
            shape="circle"
            icon={<IconSettings />}
            aria-pressed={showConfigPanel}
            title={t('loadingTrace.actions.config')}
            onClick={() => setShowConfigPanel((visible) => !visible)}
          />
          {shouldShowApplyButton ? (
            <Button
              className={styles.primaryAction}
              icon={<IconPlayArrow />}
              loading={busy}
              onClick={confirmApply}
            >
              {isObservabilityEnabled
                ? t('loadingTrace.actions.updateConfig')
                : t('loadingTrace.actions.observeNow')}
            </Button>
          ) : null}
          {isObservabilityEnabled ? (
            <Button loading={busy} onClick={disableAndReload}>
              {t('loadingTrace.actions.disable')}
            </Button>
          ) : null}
          <Button icon={<IconRefresh />} loading={busy} onClick={handleRefresh}>
            {t('loadingTrace.actions.refresh')}
          </Button>
          <Button
            icon={<IconDownload />}
            disabled={!reports.length}
            onClick={handleExport}
          >
            {t('loadingTrace.actions.export')}
          </Button>
        </div>
      </section>

      {showConfigPanel ? (
        <>
          <section className={styles.configGrid}>
            <label className={styles.field}>
              <FieldLabel
                label={t('loadingTrace.config.level')}
                tip={t('loadingTrace.config.levelTip')}
              />
              <SegmentedControl
                value={config.level}
                options={levelOptions}
                onChange={(level) => updateConfig({ level })}
              />
            </label>
            <label className={styles.field}>
              <FieldLabel
                label={t('loadingTrace.config.console')}
                tip={t('loadingTrace.config.consoleTip')}
              />
              <Switch
                checked={config.console}
                onChange={(checked) => updateConfig({ console: checked })}
              />
            </label>
          </section>
        </>
      ) : null}

      <>
        <section className={styles.stats}>
          <div>
            <span className={styles.statValueWithHelp}>
              <span className={styles.statValue}>{sourceStateLabel}</span>
              {sourceStateLabel === 'CUSTOM' ? (
                <span
                  className={`${styles.inlineHelpIcon} ${styles.statHelpIcon}`}
                  data-tip={t('loadingTrace.stats.customTip')}
                  tabIndex={0}
                  aria-label={t('loadingTrace.stats.customTip')}
                >
                  <IconQuestionCircle />
                </span>
              ) : null}
            </span>
            <span className={styles.statLabel}>
              {t('loadingTrace.stats.state')}
            </span>
          </div>
          <div>
            <span className={styles.statValue}>{reports.length}</span>
            <span className={styles.statLabel}>
              {t('loadingTrace.stats.reports')}
            </span>
          </div>
          <div>
            <span className={styles.statValue}>{eventCount}</span>
            <span className={styles.statLabel}>
              {t('loadingTrace.stats.events')}
            </span>
          </div>
          <div>
            <span className={styles.statValue}>
              {latestReport?.summary?.outcome || '-'}
            </span>
            <span className={styles.statLabel}>
              {t('loadingTrace.stats.latest')}
            </span>
          </div>
        </section>

        <section
          className={`${styles.viewer} ${
            reports.length ? '' : styles.viewerEmpty
          }`}
        >
          {reports.length ? (
            <>
              <div className={styles.reportList}>
                <div className={styles.reportFilter}>
                  <Input
                    className={styles.reportSearch}
                    prefix={<IconSearch />}
                    allowClear
                    placeholder={t('loadingTrace.reports.search')}
                    value={reportKeyword}
                    onChange={(value) => setReportKeyword(value)}
                  />
                </div>
                {filteredReports.length ? (
                  filteredReports.map((report) => {
                    const state = getReportState(report);
                    return (
                      <button
                        key={report.traceId}
                        type="button"
                        className={`${styles.reportItem} ${
                          selectedReport?.traceId === report.traceId
                            ? styles.activeReport
                            : ''
                        }`}
                        onClick={() =>
                          applyTabCache(activeTabKeyRef.current, (current) => ({
                            ...current,
                            selectedTraceId: report.traceId,
                          }))
                        }
                      >
                        <span className={styles.reportTitle}>
                          {getReportTitle(report)}
                        </span>
                        <span className={styles.reportTagRow}>
                          <span
                            className={`${styles.statusTag} ${
                              styles[`statusTag${state}`]
                            }`}
                          >
                            {t(`loadingTrace.reports.${state}`)}
                          </span>
                        </span>
                        <span className={styles.reportMeta}>
                          {formatTime(report.updatedAt)}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className={styles.emptyPanel}>
                    <Empty description={t('loadingTrace.reports.noMatch')} />
                  </div>
                )}
              </div>

              <div className={styles.timeline}>
                {selectedReport ? (
                  <>
                    {(() => {
                      const limitedObservability =
                        getLimitedObservabilityLabel(selectedReport);
                      const observabilityScopeLabel =
                        getObservabilityReportScopeLabel(selectedReport);
                      return (
                        <div className={styles.reportHeader}>
                          <div>
                            <span className={styles.reportHeading}>
                              {getReportTitle(selectedReport)}
                            </span>
                            <span className={styles.traceId}>
                              {selectedReport.traceId}
                            </span>
                          </div>
                          <div className={styles.tags}>
                            <span
                              className={`${styles.statusTag} ${
                                styles[
                                  `statusTag${getReportState(selectedReport)}`
                                ]
                              }`}
                            >
                              {t(
                                `loadingTrace.reports.${getReportState(selectedReport)}`,
                              )}
                            </span>
                            {observabilityScopeLabel ? (
                              <span className={styles.limitedTag}>
                                <span>{observabilityScopeLabel}</span>
                              </span>
                            ) : null}
                            {limitedObservability ? (
                              <span className={styles.limitedTag}>
                                <span>{t('loadingTrace.reports.limited')}</span>
                                <span
                                  className={styles.inlineHelpIcon}
                                  data-tip={t(
                                    `loadingTrace.reports.${limitedObservability}Tip`,
                                  )}
                                  tabIndex={0}
                                  aria-label={t(
                                    `loadingTrace.reports.${limitedObservability}Tip`,
                                  )}
                                >
                                  <IconQuestionCircle />
                                </span>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })()}
                    {currentLoadRows.length ? (
                      <div className={styles.currentLoad}>
                        <div className={styles.currentLoadHeader}>
                          <span className={styles.currentLoadTitle}>
                            {t('loadingTrace.currentLoad.title')}
                          </span>
                          <span className={styles.currentLoadSummary}>
                            {selectedReport.shared
                              ? t('loadingTrace.currentLoad.sharedReport')
                              : t('loadingTrace.currentLoad.remoteReport')}
                          </span>
                        </div>
                        <div className={styles.currentLoadRows}>
                          {currentLoadRows.map((row) => (
                            <div
                              className={styles.currentLoadRow}
                              key={row.labelKey}
                            >
                              <span className={styles.currentLoadLabel}>
                                {t(`loadingTrace.currentLoad.${row.labelKey}`)}
                              </span>
                              <span className={styles.currentLoadValue}>
                                {formatCurrentLoadValue(row.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {selectedReport.diagnosis?.title ? (
                      <div className={styles.diagnosis}>
                        {selectedReport.diagnosis.title}
                      </div>
                    ) : null}
                    {selectedReport.loadedBefore ? (
                      <div className={styles.loadedBefore}>
                        <div className={styles.loadedBeforeHeader}>
                          <span className={styles.loadedBeforeTitle}>
                            {t('loadingTrace.loadedBefore.title')}
                          </span>
                          <span className={styles.loadedBeforeSummary}>
                            {t('loadingTrace.loadedBefore.consumerCount', {
                              count:
                                selectedReport.loadedBefore.consumers.length,
                            })}
                          </span>
                        </div>
                        <div className={styles.loadedBeforeTags}>
                          <span
                            className={`${styles.loadedBeforeTag} ${styles.loadedBeforeTagSuccess}`}
                          >
                            {t('loadingTrace.loadedBefore.producerLoaded')}
                          </span>
                          <span
                            className={`${styles.loadedBeforeTag} ${
                              selectedReport.loadedBefore.expose
                                ? styles.loadedBeforeTagSuccess
                                : styles.loadedBeforeTagNeutral
                            }`}
                          >
                            {selectedReport.loadedBefore.expose
                              ? t('loadingTrace.loadedBefore.exposeLoaded')
                              : t('loadingTrace.loadedBefore.exposeNotLoaded')}
                          </span>
                        </div>
                        <div className={styles.loadedBeforeConsumers}>
                          {selectedReport.loadedBefore.consumers.map(
                            (consumer, index) => (
                              <div
                                className={styles.loadedBeforeConsumer}
                                key={`${consumer.name || 'consumer'}-${index}`}
                              >
                                <div className={styles.loadedBeforeRow}>
                                  <span className={styles.loadedBeforeLabel}>
                                    {t('loadingTrace.loadedBefore.consumer')}
                                  </span>
                                  <span className={styles.loadedBeforeName}>
                                    {consumer.name ||
                                      t(
                                        'loadingTrace.loadedBefore.unknownConsumer',
                                      )}
                                  </span>
                                </div>
                                <div className={styles.loadedBeforeRow}>
                                  <span className={styles.loadedBeforeLabel}>
                                    {t('loadingTrace.loadedBefore.status')}
                                  </span>
                                  <span className={styles.loadedBeforeMeta}>
                                    {[
                                      consumer.remoteEntryExports
                                        ? t(
                                            'loadingTrace.loadedBefore.entryReady',
                                          )
                                        : t(
                                            'loadingTrace.loadedBefore.entryMissing',
                                          ),
                                      consumer.containerInitialized
                                        ? t(
                                            'loadingTrace.loadedBefore.initReady',
                                          )
                                        : t(
                                            'loadingTrace.loadedBefore.initMissing',
                                          ),
                                    ].join(' · ')}
                                  </span>
                                </div>
                                <div className={styles.loadedBeforeRow}>
                                  <span className={styles.loadedBeforeLabel}>
                                    {t('loadingTrace.loadedBefore.exposes')}
                                  </span>
                                  <span className={styles.loadedBeforeExposes}>
                                    {consumer.exposes?.length
                                      ? consumer.exposes.join(', ')
                                      : t(
                                          'loadingTrace.loadedBefore.noExposes',
                                        )}
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ) : null}
                    <div className={styles.eventList}>
                      {(selectedReport.events || []).map((event, index) => (
                        <div
                          className={styles.eventItem}
                          key={`${event.traceId}-${event.phase}-${event.timestamp}-${index}`}
                        >
                          <div className={styles.eventTime}>
                            {formatTime(event.timestamp)}
                          </div>
                          <div className={styles.eventBody}>
                            <div className={styles.eventMain}>
                              <span className={styles.phase}>
                                {event.phase}
                              </span>
                              <span
                                className={`${styles.eventStatusTag} ${
                                  styles[
                                    `eventStatusTag${getEventStatusState(
                                      event.status,
                                    )}`
                                  ]
                                }`}
                              >
                                {event.status}
                              </span>
                              {event.recovered ? (
                                <span className={styles.eventRecoveredTag}>
                                  {t('loadingTrace.reports.eventRecovered')}
                                </span>
                              ) : null}
                              {event.duration !== undefined ? (
                                <span className={styles.duration}>
                                  {event.duration}ms
                                </span>
                              ) : null}
                            </div>
                            <div className={styles.eventMeta}>
                              {event.message ||
                                event.lifecycle ||
                                event.requestId ||
                                '-'}
                            </div>
                            {event.errorMessage ? (
                              <div className={styles.error}>
                                {event.errorCode
                                  ? `${event.errorCode}: ${event.errorMessage}`
                                  : event.errorMessage}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </>
          ) : (
            <div className={styles.emptyPanel}>
              <Empty description={emptyDescription} />
            </div>
          )}
        </section>
      </>
    </div>
  );
};

export default LoadingTrace;
