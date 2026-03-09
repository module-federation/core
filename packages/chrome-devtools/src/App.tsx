import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import '@arco-design/web-react/es/_util/react-19-adapter';
import './App.css';
import { Empty, Tag, Button, Tooltip } from '@arco-design/web-react';
import type { GlobalModuleInfo } from '@module-federation/sdk';
import { I18nextProvider, useTranslation } from 'react-i18next';

import './init';
import { IconRefresh } from '@arco-design/web-react/icon';
import ProxyLayout from './component/Layout';
import Dependency from './component/DependencyGraph';
import ModuleInfo from './component/ModuleInfo';
import SharedDepsExplorer from './component/SharedDepsExplorer';
import LanguageSwitch from './component/LanguageSwitch';
import ThemeToggle from './component/ThemeToggle';
import {
  getGlobalModuleInfo,
  refreshModuleInfo,
  RootComponentProps,
  separateType,
  syncActiveTab,
} from './utils';
import { MESSAGE_ACTIVE_TAB_CHANGED } from './utils/chrome/messages';
import { useDevtoolsTheme, DevtoolsTheme } from './hooks/useDevtoolsTheme';
import i18n from './i18n';

import '@arco-design/web-react/dist/css/arco.css';
import styles from './App.module.scss';
import btnStyles from './component/ThemeToggle.module.scss';

const cloneModuleInfo = (info?: GlobalModuleInfo | null): GlobalModuleInfo => {
  try {
    return JSON.parse(JSON.stringify(info || {}));
  } catch (error) {
    console.warn('[MF Devtools] cloneModuleInfo failed', error);
    return info || {};
  }
};

const normalizeShareValue = (
  target: any,
  seen: WeakSet<object> = new WeakSet(),
): any => {
  if (typeof target === 'function') {
    const name = target.name ? `: ${target.name}` : '';
    return `[Function${name}]`;
  }
  if (!target || typeof target !== 'object') {
    return target;
  }
  if (seen.has(target)) {
    return '[Circular]';
  }
  seen.add(target);

  if (target instanceof Map) {
    const mapped: Record<string, any> = {};
    target.forEach((value, key) => {
      mapped[String(key)] = normalizeShareValue(value, seen);
    });
    return mapped;
  }

  if (target instanceof Set) {
    const setItems: Array<any> = [];
    target.forEach((value) => {
      setItems.push(normalizeShareValue(value, seen));
    });
    return setItems;
  }

  if (Array.isArray(target)) {
    return target.map((item) => normalizeShareValue(item, seen));
  }

  return Object.keys(target).reduce<Record<string, any>>((memo, key) => {
    memo[key] = normalizeShareValue((target as Record<string, any>)[key], seen);
    return memo;
  }, {});
};

const buildShareSnapshot = (share: any): Record<string, any> => {
  const normalize = (value: any) => {
    try {
      return normalizeShareValue(value);
    } catch (error) {
      console.warn('[MF Devtools] normalize share snapshot failed', error);
      return normalizeShareValue(value);
    }
  };

  const scopes = normalize(share || {});

  return scopes;
};

const NAV_ITEMS = [
  { key: 'moduleInfo', i18nKey: 'app.nav.moduleInfo' },
  { key: 'proxy', i18nKey: 'app.nav.proxy' },
  { key: 'dependency', i18nKey: 'app.nav.dependency' },
  { key: 'share', i18nKey: 'app.nav.share' },
  { key: 'performance', i18nKey: 'app.nav.performance' },
] as const;

type TabKey = (typeof NAV_ITEMS)[number]['key'];

const THEME_STORAGE_KEY = 'mf-devtools-theme';

type ThemeChoice = DevtoolsTheme | null;

const InnerApp = (props: RootComponentProps) => {
  const {
    versionList,
    setVersionList,
    getVersion,
    handleSnapshot,
    handleProxyAddress,
    customValueValidate,
    headerSlot,
  } = props;

  const autoTheme = useDevtoolsTheme();
  const [userTheme, setUserTheme] = useState<ThemeChoice>(null);
  const effectiveTheme: DevtoolsTheme = userTheme ?? autoTheme;
  const { t } = useTranslation();

  const [moduleInfo, setModuleInfo] = useState<GlobalModuleInfo>(() =>
    cloneModuleInfo(window.__FEDERATION__?.moduleInfo || {}),
  );
  const [shareInfo, setShareInfo] = useState<Record<string, any>>(() =>
    buildShareSnapshot((window as any).__FEDERATION__?.__SHARE__),
  );
  const [inspectedTab, setInspectedTab] = useState<chrome.tabs.Tab | undefined>(
    window.targetTab,
  );
  const [activePanel, setActivePanel] = useState<TabKey>('proxy');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const panelSyncReadyRef = useRef(false);

  const applyModuleUpdate = useCallback((info: GlobalModuleInfo) => {
    setModuleInfo(cloneModuleInfo(info));
    const shareSnapshot = buildShareSnapshot(
      (window as any).__FEDERATION__?.__SHARE__,
    );
    setShareInfo(shareSnapshot);
    panelSyncReadyRef.current = true;
  }, []);

  const { producer, consumers } = useMemo(
    () => separateType(moduleInfo),
    [moduleInfo],
  );
  const moduleKeys = useMemo(() => Object.keys(moduleInfo || {}), [moduleInfo]);
  const moduleCount = moduleKeys.length;
  const consumerCount = useMemo(
    () => Object.keys(consumers || {}).length,
    [consumers],
  );
  const hasModule = moduleCount > 0 || process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let cancelled = false;

    const applyTheme = (value: unknown) => {
      if (cancelled) {
        return;
      }
      if (value === 'light' || value === 'dark') {
        setUserTheme(value);
      }
    };

    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        applyTheme(stored);
        return;
      }
    } catch (error) {
      console.warn('[MF Devtools] read theme from localStorage failed', error);
    }

    try {
      const chromeObj = (window as any).chrome;
      const storage = chromeObj?.storage?.sync;
      if (storage && typeof storage.get === 'function') {
        storage.get([THEME_STORAGE_KEY], (result: any) => {
          applyTheme(result?.[THEME_STORAGE_KEY]);
        });
      }
    } catch (error) {
      console.warn(
        '[MF Devtools] read theme from chrome.storage.sync failed',
        error,
      );
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const { body } = document;
    if (!body) {
      return;
    }

    if (effectiveTheme === 'dark') {
      body.setAttribute('arco-theme', 'dark');
    } else {
      body.removeAttribute('arco-theme');
    }

    return () => {
      body.removeAttribute('arco-theme');
    };
  }, [effectiveTheme]);

  useEffect(() => {
    if (!moduleKeys.length) {
      setSelectedModuleId(null);
      return;
    }
    if (!selectedModuleId || !moduleKeys.includes(selectedModuleId)) {
      setSelectedModuleId(moduleKeys[0]);
    }
  }, [moduleKeys, selectedModuleId]);

  useEffect(() => {
    const bootstrap = async () => {
      const tab = await syncActiveTab();
      setInspectedTab(tab || undefined);
      const detach = await getGlobalModuleInfo((info) =>
        applyModuleUpdate(info),
      );
      panelSyncReadyRef.current = true;
      return detach;
    };
    const cleanupPromise = bootstrap();
    return () => {
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [applyModuleUpdate]);

  useEffect(() => {
    const updateActiveTab = async (tabId?: number) => {
      const tab = await syncActiveTab(tabId);
      setInspectedTab(tab || undefined);
      if (window.__FEDERATION__?.moduleInfo) {
        applyModuleUpdate(cloneModuleInfo(window.__FEDERATION__?.moduleInfo));
      }
      await refreshModuleInfo();
    };

    const onMessage = (
      message: { type?: string; tabId?: number },
      _sender: chrome.runtime.MessageSender,
      _sendResponse: (response?: any) => void,
    ) => {
      if (message?.type === MESSAGE_ACTIVE_TAB_CHANGED) {
        updateActiveTab(message.tabId);
      }
    };

    chrome.runtime.onMessage.addListener(onMessage);

    const onActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      updateActiveTab(activeInfo.tabId);
    };
    chrome.tabs.onActivated.addListener(onActivated);

    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
      chrome.tabs.onActivated.removeListener(onActivated);
    };
  }, [applyModuleUpdate]);

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    try {
      await refreshModuleInfo();
      if (window.__FEDERATION__?.moduleInfo) {
        applyModuleUpdate(cloneModuleInfo(window.__FEDERATION__?.moduleInfo));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleThemeToggle = () => {
    const current = effectiveTheme;
    const next: DevtoolsTheme = current === 'dark' ? 'light' : 'dark';

    setUserTheme(next);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch (error) {
        console.warn(
          '[MF Devtools] persist theme to localStorage failed',
          error,
        );
      }

      try {
        const chromeObj = (window as any).chrome;
        const storage = chromeObj?.storage?.sync;
        if (storage && typeof storage.set === 'function') {
          storage.set({ [THEME_STORAGE_KEY]: next });
        }
      } catch (error) {
        console.warn(
          '[MF Devtools] persist theme to chrome.storage.sync failed',
          error,
        );
      }
    }
  };

  const resetModuleInfo = useCallback(() => {
    const origin = window.__FEDERATION__?.originModuleInfo || {};
    applyModuleUpdate(cloneModuleInfo(origin));
  }, [applyModuleUpdate]);

  useEffect(() => {
    const shouldAutoSync =
      activePanel === 'proxy' ||
      activePanel === 'dependency' ||
      activePanel === 'share';
    if (!shouldAutoSync || !panelSyncReadyRef.current) {
      return;
    }

    let cancelled = false;

    const syncPanelData = async () => {
      await refreshModuleInfo();
      if (cancelled) {
        return;
      }
      if (window.__FEDERATION__?.moduleInfo) {
        applyModuleUpdate(cloneModuleInfo(window.__FEDERATION__?.moduleInfo));
      }
    };

    void syncPanelData();

    return () => {
      cancelled = true;
    };
  }, [activePanel, applyModuleUpdate]);

  const renderContent = () => {
    switch (activePanel) {
      case 'moduleInfo':
        return (
          <ModuleInfo
            moduleInfo={moduleInfo}
            selectedModuleId={selectedModuleId}
            onSelectModule={(id) => setSelectedModuleId(id)}
          />
        );
      case 'proxy':
        return (
          <ProxyLayout
            moduleInfo={moduleInfo}
            versionList={versionList}
            setVersionList={setVersionList}
            getVersion={getVersion}
            handleSnapshot={handleSnapshot}
            handleProxyAddress={handleProxyAddress}
            customValueValidate={customValueValidate}
            headerSlot={headerSlot}
            onModuleInfoChange={applyModuleUpdate}
            onModuleInfoReset={resetModuleInfo}
            tabId={inspectedTab?.id}
          />
        );
      case 'dependency':
        return hasModule ? (
          <Dependency snapshot={moduleInfo} />
        ) : (
          <div className={styles.emptyState}>
            <Empty
              description={t('common.empty.noModuleInfo')}
              className={styles.empty}
            />
          </div>
        );
      case 'share':
        return (
          <SharedDepsExplorer
            shareData={JSON.parse(
              JSON.stringify(window.__FEDERATION__?.__SHARE__),
            )}
          />
        );
      case 'performance':
        return (
          <div className={styles.placeholder}>
            {t('app.performance.placeholder')}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`${styles.shell} ${styles.overrideArco} ${
        effectiveTheme === 'dark' ? 'arco-theme-dark' : ''
      }`}
    >
      <aside className={styles.sidebar}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`${styles.tabItem} ${
              activePanel === item.key ? styles.activeTab : ''
            }`}
            onClick={() => setActivePanel(item.key)}
          >
            {t(item.i18nKey)}
          </button>
        ))}
      </aside>
      <section className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.branding}>
              <span className={styles.logo}>{t('app.header.title')}</span>
              <span className={styles.subtitle}>
                {t('app.header.subtitle')}
              </span>
            </div>
            <div className={styles.headerActions}>
              <LanguageSwitch />
              <ThemeToggle
                theme={effectiveTheme}
                onToggle={handleThemeToggle}
              />
              <Tooltip content={t('app.header.refresh.tooltip')}>
                <Button
                  size="default"
                  icon={<IconRefresh />}
                  loading={refreshing}
                  onClick={handleRefresh}
                  className={btnStyles.themeToggle}
                />
              </Tooltip>
            </div>
          </div>
          <div className={styles.meta}>
            <div className={styles.scope}>
              <span className={styles.scopeLabel}>
                {t('app.header.scope.label')}
              </span>
              <Tag className={'common-tag'}>
                {inspectedTab?.title || t('app.header.scope.waiting')}
              </Tag>
            </div>
            <div className={styles.stats}>
              <div className={styles.statBlock}>
                <span className={styles.statValue}>{moduleCount}</span>
                <span className={styles.statLabel}>
                  {t('app.header.stats.modules')}
                </span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statValue}>{producer.length}</span>
                <span className={styles.statLabel}>
                  {t('app.header.stats.remotes')}
                </span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statValue}>{consumerCount}</span>
                <span className={styles.statLabel}>
                  {t('app.header.stats.consumers')}
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className={styles.body}>
          <div className={styles.content}>{renderContent()}</div>
        </div>
      </section>
    </div>
  );
};

const App = (props: RootComponentProps) => {
  return (
    <I18nextProvider i18n={i18n}>
      <InnerApp {...props} />
    </I18nextProvider>
  );
};

export default App;
