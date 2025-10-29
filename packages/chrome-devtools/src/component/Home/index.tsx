import { useMemo } from 'react';
import { Empty } from '@arco-design/web-react';
import type { GlobalModuleInfo } from '@module-federation/sdk';

import styles from './index.module.scss';

interface HomeProps {
  moduleInfo: GlobalModuleInfo;
  selectedModuleId: string | null;
  onSelectModule: (moduleId: string) => void;
}

const renderValue = (value: any) => {
  if (value === undefined || value === null) {
    return null;
  }
  if (Array.isArray(value)) {
    if (!value.length) {
      return null;
    }
    return (
      <div className={styles.pillGroup}>
        {value.map((item, index) => (
          <span className={styles.pill} key={index}>
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </span>
        ))}
      </div>
    );
  }
  if (typeof value === 'object') {
    return (
      <pre className={styles.jsonBlock}>{JSON.stringify(value, null, 2)}</pre>
    );
  }
  return <span className={styles.valueText}>{String(value)}</span>;
};

const extractDetailSections = (moduleSnapshot: any) => {
  if (!moduleSnapshot) {
    return [];
  }

  const sections: Array<{ label: string; value: any }> = [];
  const remoteEntry =
    moduleSnapshot.remoteEntry ||
    moduleSnapshot.entry ||
    moduleSnapshot.version;
  if (remoteEntry) {
    sections.push({
      label: 'Remote Entry',
      value: remoteEntry,
    });
  }

  if (moduleSnapshot.version) {
    sections.push({
      label: 'Version',
      value: moduleSnapshot.version,
    });
  }

  if (moduleSnapshot.consumerList) {
    sections.push({
      label: 'Consumers',
      value: moduleSnapshot.consumerList,
    });
  }

  if (moduleSnapshot.modules) {
    sections.push({
      label: 'Exposes',
      value: moduleSnapshot.modules,
    });
  }

  if (moduleSnapshot.remotesInfo) {
    sections.push({
      label: 'Remotes',
      value: moduleSnapshot.remotesInfo,
    });
  }

  if (moduleSnapshot.shared) {
    sections.push({
      label: 'Shared',
      value: moduleSnapshot.shared,
    });
  }

  if (!sections.length) {
    sections.push({
      label: 'Snapshot',
      value: moduleSnapshot,
    });
  }

  return sections;
};

const Home = (props: HomeProps) => {
  const { moduleInfo, selectedModuleId, onSelectModule } = props;

  const moduleEntries = useMemo(
    () => Object.entries(moduleInfo || {}),
    [moduleInfo],
  );

  const [currentModuleId, currentSnapshot] = useMemo(() => {
    if (!moduleEntries.length) {
      return [null, null] as [string | null, any];
    }
    const entry =
      moduleEntries.find(([moduleId]) => moduleId === selectedModuleId) ||
      moduleEntries[0];
    return entry;
  }, [moduleEntries, selectedModuleId]);

  const detailSections = useMemo(
    () => extractDetailSections(currentSnapshot),
    [currentSnapshot],
  );

  if (!moduleEntries.length || !currentModuleId) {
    return (
      <div className={styles.emptyState}>
        <Empty description={'No ModuleInfo Detected'} />
      </div>
    );
  }

  return (
    <div className={styles.home}>
      <div className={styles.moduleSelector}>
        <div className={styles.moduleList}>
          {moduleEntries.map(([moduleId]) => {
            const active = moduleId === currentModuleId;
            return (
              <button
                type="button"
                key={moduleId}
                className={`${styles.moduleItem} ${
                  active ? styles.moduleItemActive : ''
                }`}
                onClick={() => onSelectModule(moduleId)}
              >
                <span className={styles.moduleName}>{moduleId}</span>
              </button>
            );
          })}
        </div>
        <div className={styles.moduleDetail}>
          <div className={styles.detailHeader}>
            <span className={styles.detailTitle}>{currentModuleId}</span>
          </div>
          <div className={styles.detailBody}>
            {detailSections.map((section) => {
              const content = renderValue(section.value);
              if (!content) {
                return null;
              }
              return (
                <div className={styles.detailRow} key={section.label}>
                  <div className={styles.detailLabel}>{section.label}</div>
                  <div className={styles.detailValue}>{content}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
