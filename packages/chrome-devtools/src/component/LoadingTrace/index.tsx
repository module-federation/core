import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Empty,
  Input,
  Modal,
  Switch,
  Tag,
} from '@arco-design/web-react';
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

const getReportState = (report: ObservabilityDevtoolsReport) => {
  const outcome = getReportOutcome(report);
  if (
    report.status === 'error' ||
    outcome === 'failed' ||
    report.failedPhase ||
    report.errorMessage
  ) {
    return 'failed';
  }
  if (report.status === 'success') {
    return 'success';
  }
  return 'pending';
};

const getReportSearchText = (report: ObservabilityDevtoolsReport) =>
  [
    getReportTitle(report),
    report.traceId,
    report.status,
    getReportOutcome(report),
    report.hostName,
    report.remote?.name,
    report.remote?.alias,
    report.remote?.entry,
    report.shared?.name,
    report.shared?.provider,
    report.expose,
    report.failedPhase,
    report.errorCode,
    report.errorName,
    report.errorMessage,
    report.ownerHint,
    report.summary?.lastPhase,
    report.diagnosis?.title,
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

const getConfigSignature = (config: ObservabilityDevtoolsConfig) =>
  JSON.stringify(normalizeObservabilityDevtoolsConfig(config));

const LoadingTrace = ({ tabId }: LoadingTraceProps) => {
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
  const [selectedTraceId, setSelectedTraceId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [reportKeyword, setReportKeyword] = useState('');

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
  const eventCount = useMemo(
    () =>
      reports.reduce(
        (count, report) => count + (report.events?.length || 0),
        0,
      ),
    [reports],
  );

  const refreshSnapshot = useCallback(async () => {
    const snapshot = await readObservabilitySnapshot();
    setConfig(snapshot.config);
    setSavedConfig(snapshot.config);
    setStored(snapshot.stored);
    setScopes(snapshot.scopes);
    setReports((current) =>
      mergeObservabilityReports(current, snapshot.reports),
    );
    setSelectedTraceId((current) => current || snapshot.reports[0]?.traceId);
    return snapshot;
  }, []);

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
    };
  }, [refreshSnapshot, t, tabId]);

  useEffect(() => {
    const onMessage = (
      message: { type?: string; data?: any },
      sender: chrome.runtime.MessageSender,
    ) => {
      if (message?.type !== MESSAGE_OBSERVABILITY_DEVTOOLS_EVENT) {
        return;
      }
      const senderTabId = sender?.tab?.id;
      if (tabId && senderTabId && senderTabId !== tabId) {
        return;
      }

      const payload = message.data;
      if (payload?.config) {
        const nextConfig = normalizeObservabilityDevtoolsConfig(payload.config);
        setConfig(nextConfig);
        setSavedConfig(nextConfig);
        setStored(payload.config.enabled !== false);
      }
      if (payload?.kind === 'installed') {
        setStatusText(t('loadingTrace.status.enabled'));
      }
      if (payload?.report?.traceId) {
        const report = {
          ...payload.report,
          __scope: payload.scope || payload.report.__scope,
        } as ObservabilityDevtoolsReport;
        setReports((current) => mergeObservabilityReports(current, [report]));
        setSelectedTraceId((current) => current || report.traceId);
      }
    };

    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, [tabId, t]);

  const updateConfig = (patch: Partial<ObservabilityDevtoolsConfig>) => {
    setConfig((current) =>
      normalizeObservabilityDevtoolsConfig({
        ...current,
        ...patch,
      }),
    );
  };

  const updateReactConfig = (
    patch: Partial<Omit<ObservabilityDevtoolsConfig['react'], 'remoteIds'>> & {
      remoteIds?: string[] | string;
    },
  ) => {
    setConfig((current) =>
      normalizeObservabilityDevtoolsConfig({
        ...current,
        react: {
          ...current.react,
          ...patch,
        },
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
      setReports([]);
      setSelectedTraceId(undefined);
      setStatusText(t('loadingTrace.status.reloading'));
      await reloadInspectedPage();
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
      setStored(false);
      setReports([]);
      setSelectedTraceId(undefined);
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

  return (
    <div className={styles.wrapper}>
      <section className={styles.toolbar}>
        <div className={styles.titleGroup}>
          <span className={styles.title}>{t('loadingTrace.title')}</span>
          {isObservabilityEnabled ? (
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
            <>
              <Button loading={busy} onClick={disableAndReload}>
                {t('loadingTrace.actions.disable')}
              </Button>
              <Button
                icon={<IconRefresh />}
                loading={busy}
                onClick={handleRefresh}
              >
                {t('loadingTrace.actions.refresh')}
              </Button>
              <Button
                icon={<IconDownload />}
                disabled={!reports.length}
                onClick={handleExport}
              >
                {t('loadingTrace.actions.export')}
              </Button>
            </>
          ) : null}
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
            <label className={styles.switchField}>
              <FieldLabel
                label={t('loadingTrace.config.reactCallback')}
                tip={t('loadingTrace.config.reactCallbackTip')}
              />
              <Switch
                checked={config.react.injectLoadedCallback}
                onChange={(checked) =>
                  updateReactConfig({ injectLoadedCallback: checked })
                }
              />
            </label>
            <label className={styles.fieldWide}>
              <FieldLabel
                label={t('loadingTrace.config.remoteIds')}
                tip={t('loadingTrace.config.remoteIdsTip')}
              />
              <Input
                className={styles.remoteInput}
                value={config.react.remoteIds.join(', ')}
                onChange={(value) => updateReactConfig({ remoteIds: value })}
                disabled={!config.react.injectLoadedCallback}
              />
            </label>
          </section>
        </>
      ) : null}

      {isObservabilityEnabled ? (
        <>
          <section className={styles.stats}>
            <div>
              <span className={styles.statValue}>ON</span>
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

          <section className={styles.viewer}>
            <div className={styles.reportList}>
              {reports.length ? (
                <>
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
                          onClick={() => setSelectedTraceId(report.traceId)}
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
                </>
              ) : (
                <div className={styles.emptyPanel}>
                  <Empty description={t('loadingTrace.empty')} />
                </div>
              )}
            </div>

            <div className={styles.timeline}>
              {selectedReport ? (
                <>
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
                          styles[`statusTag${getReportState(selectedReport)}`]
                        }`}
                      >
                        {t(
                          `loadingTrace.reports.${getReportState(selectedReport)}`,
                        )}
                      </span>
                      {selectedReport.__scope ? (
                        <Tag>{selectedReport.__scope}</Tag>
                      ) : null}
                    </div>
                  </div>
                  {selectedReport.diagnosis?.title ? (
                    <div className={styles.diagnosis}>
                      {selectedReport.diagnosis.title}
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
                            <span className={styles.phase}>{event.phase}</span>
                            <Tag>{event.status}</Tag>
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
              ) : (
                <div className={styles.emptyPanel}>
                  <Empty description={t('loadingTrace.empty')} />
                </div>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
};

export default LoadingTrace;
