import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import '@arco-design/web-react/es/_util/react-19-adapter';
import './App.css';
import { Empty, Tag, Button, Tooltip } from '@arco-design/web-react';
import type { GlobalModuleInfo } from '@module-federation/sdk';

import './init';
import ProxyLayout from './component/Layout';
import Dependency from './component/DependencyGraph';
import ModuleInfo from './component/ModuleInfo';
import SharedDepsExplorer from './component/SharedDepsExplorer';
import {
  getGlobalModuleInfo,
  refreshModuleInfo,
  RootComponentProps,
  separateType,
  syncActiveTab,
} from './utils';
import { MESSAGE_ACTIVE_TAB_CHANGED } from './utils/chrome/messages';

import '@arco-design/web-react/dist/css/arco.css';
import styles from './App.module.scss';

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
  { key: 'moduleInfo', label: 'Module info' },
  { key: 'proxy', label: 'Proxy' },
  { key: 'dependency', label: 'Dependency graph' },
  { key: 'share', label: 'Shared' },
  { key: 'performance', label: 'Performance' },
] as const;

type TabKey = (typeof NAV_ITEMS)[number]['key'];

const App = (props: RootComponentProps) => {
  const {
    versionList,
    setVersionList,
    getVersion,
    handleSnapshot,
    handleProxyAddress,
    customValueValidate,
    headerSlot,
  } = props;

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
              description={'No ModuleInfo Detected'}
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
        return <div className={styles.placeholder}>WIP...</div>;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.shell} ${styles.overrideArco}`}>
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
            {item.label}
          </button>
        ))}
      </aside>
      <section className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.branding}>
              <span className={styles.logo}>Module Federation</span>
              <span className={styles.subtitle}>DevTools Companion</span>
            </div>
            <Tooltip content="重新同步当前页面的 Federation 信息">
              <Button
                size="mini"
                type="primary"
                loading={refreshing}
                onClick={handleRefresh}
                className={styles.refresh}
              >
                Refresh
              </Button>
            </Tooltip>
          </div>
          <div className={styles.meta}>
            <div className={styles.scope}>
              <span className={styles.scopeLabel}>Focus Tab</span>
              <Tag className={'common-tag'}>
                {inspectedTab?.title || 'Waiting for target'}
              </Tag>
            </div>
            <div className={styles.stats}>
              <div className={styles.statBlock}>
                <span className={styles.statValue}>{moduleCount}</span>
                <span className={styles.statLabel}>Modules</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statValue}>{producer.length}</span>
                <span className={styles.statLabel}>Remotes</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statValue}>{consumerCount}</span>
                <span className={styles.statLabel}>Consumers</span>
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

export default App;
