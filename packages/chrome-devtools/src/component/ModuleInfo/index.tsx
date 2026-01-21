import { useMemo } from 'react';
import { Empty, Select, Tag, Table } from '@arco-design/web-react';
import type {
  BasicProviderModuleInfo,
  GlobalModuleInfo,
} from '@module-federation/sdk';

import styles from './index.module.scss';

interface HomeProps {
  moduleInfo: GlobalModuleInfo;
  selectedModuleId: string | null;
  onSelectModule: (moduleId: string) => void;
}

const renderValue = (value: GlobalModuleInfo[string]) => {
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
    if (Object.keys(value).length === 0) {
      return null;
    }
    return (
      <div className="flex flex-col gap-3">
        {Object.entries(value).map(([key, val]) => (
          <div
            key={key}
            className="flex flex-col border-b border-zinc-100 pb-2 last:border-0 last:pb-0"
          >
            <span className="font-medium text-zinc-700 text-xs mb-1">
              {key}
            </span>
            <div className="text-zinc-600 text-xs break-all font-mono bg-zinc-50 p-2 rounded border border-zinc-100">
              {(() => {
                if (Array.isArray(val)) {
                  return (
                    <div className="flex flex-col gap-1">
                      {val.map((item, idx) => (
                        <div
                          key={idx}
                          className="border-b border-zinc-200 last:border-0 pb-1 last:pb-0"
                        >
                          {typeof item === 'object'
                            ? JSON.stringify(item)
                            : String(item)}
                        </div>
                      ))}
                    </div>
                  );
                }
                return typeof val === 'object'
                  ? JSON.stringify(val)
                  : String(val);
              })()}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <span className={styles.valueText}>{String(value)}</span>;
};

const RemotesTable = ({ data }: { data: Record<string, any> }) => {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }
  const dataSource = Object.entries(data).map(([key, val]: [string, any]) => ({
    key,
    name: key,
    type: val.type || val.remoteType || '-',
    version: val.version || val.matchedVersion || '-',
    scmVersion: val.scmVersion || val.buildVersion || '-',
  }));

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Version', dataIndex: 'version' },
    { title: 'SCM Version', dataIndex: 'scmVersion' },
  ];

  return (
    <Table
      columns={columns}
      data={dataSource}
      pagination={false}
      border={false}
      rowKey="key"
      className="bg-zinc-50 rounded border border-zinc-200"
    />
  );
};

const ExposesTable = ({ data }: { data: any[] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  const dataSource = data.map((item: any, index: number) => ({
    key: index,
    name: item.name || item.moduleName || item.expose || '-',
    path: item.path || item.file || '-',
    shared: Array.isArray(item.requires)
      ? item.requires.join(', ')
      : item.requires || 'None',
  }));

  const columns = [
    { title: 'Module Name', dataIndex: 'name' },
    { title: 'File Path', dataIndex: 'path' },
    { title: 'Shared Dependencies', dataIndex: 'shared' },
  ];

  return (
    <Table
      columns={columns}
      data={dataSource}
      pagination={false}
      border={false}
      rowKey="key"
      className="bg-zinc-50 rounded border border-zinc-200"
    />
  );
};

const ConsumersTable = ({ data }: { data: any[] }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  const dataSource = data.map((item: any, index: number) => ({
    key: index,
    name: item.name || item.consumerName || '-',
    type: item.type || '-',
    version: item.version || '-',
    moduleName: item.moduleName || '-',
    usedIn: Array.isArray(item.usedIn)
      ? item.usedIn.join(', ')
      : item.usedIn || '-',
    time: item.time || '-',
  }));

  const columns = [
    { title: 'Consumer Name', dataIndex: 'name' },
    { title: 'Consumer Type', dataIndex: 'type' },
    { title: 'Consumer Version', dataIndex: 'version' },
    { title: 'Consumed Module Name', dataIndex: 'moduleName' },
    { title: 'Used In', dataIndex: 'usedIn' },
    { title: 'Time', dataIndex: 'time' },
  ];

  return (
    <Table
      columns={columns}
      data={dataSource}
      pagination={false}
      border={false}
      rowKey="key"
      className="bg-zinc-50 rounded border border-zinc-200"
    />
  );
};

const SharedTable = ({
  data,
}: {
  data?: BasicProviderModuleInfo['shared'];
}) => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }
  // Shared data structure can be object or array depending on SDK version
  const dataSource = Object.entries(data).map(([key, val]) => ({
    key,
    name: val.sharedName,
    version: val.version || '-',
  }));

  const columns = [
    { title: 'Dependency Name', dataIndex: 'name' },
    { title: 'Version', dataIndex: 'version' },
    { title: 'Required Version', dataIndex: 'requiredVersion' },
    { title: 'Singleton', dataIndex: 'singleton' },
    { title: 'Eager', dataIndex: 'eager' },
  ];

  return (
    <Table
      columns={columns}
      data={dataSource}
      pagination={false}
      border={false}
      rowKey="key"
      className="bg-zinc-50 rounded border border-zinc-200"
    />
  );
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
    () =>
      Object.entries(moduleInfo || {}).filter(([key]) => key !== 'extendInfos'),
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
      <Select
        className={styles.moduleSelect}
        placeholder="Select MF module"
        style={{ width: '100%' }}
        allowClear
        showSearch
        autoWidth
        onChange={onSelectModule}
      >
        {moduleEntries.map(([moduleId, snapshot]) => (
          <Select.Option key={moduleId} value={moduleId}>
            {snapshot &&
            'remotesInfo' in snapshot &&
            Object.keys(snapshot.remotesInfo).length ? (
              <Tag color="pinkpurple">Consumer</Tag>
            ) : (
              <Tag color="cyan">Provider</Tag>
            )}
            &nbsp;
            {moduleId}
          </Select.Option>
        ))}
      </Select>
      <div className={styles.moduleSelector}>
        <div className={styles.moduleDetail}>
          <div className={styles.detailHeader}>
            <div className="flex items-center gap-2">
              <span className={styles.detailTitle}>{currentModuleId}</span>
              {currentSnapshot &&
              'remotesInfo' in currentSnapshot &&
              Object.keys(currentSnapshot.remotesInfo).length ? (
                <Tag color="pinkpurple">Consumer</Tag>
              ) : (
                <Tag color="cyan">Provider</Tag>
              )}
            </div>
          </div>
          <div className={styles.detailBody}>
            {detailSections.map((section) => {
              let content;
              switch (section.label) {
                case 'Remotes':
                  content = <RemotesTable data={section.value} />;
                  break;
                case 'Exposes':
                  content = <ExposesTable data={section.value} />;
                  break;
                case 'Consumers':
                  content = <ConsumersTable data={section.value} />;
                  break;
                case 'Shared':
                  content = <SharedTable data={section.value} />;
                  break;
                default:
                  content = renderValue(section.value);
              }

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
