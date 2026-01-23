import React, { type ChangeEvent } from 'react';
import type {
  BuildTool,
  PlaygroundAction,
  ProducerConfigState,
  ProducerExpose,
  ProducerShared,
} from './state';
import styles from './index.module.scss';

interface ProducerConfigProps {
  state: ProducerConfigState;
  dispatch: React.Dispatch<PlaygroundAction>;
}

const BUILD_TOOLS: { value: BuildTool; label: string }[] = [
  { value: 'webpack', label: 'Webpack' },
  { value: 'rspack', label: 'Rspack' },
  { value: 'vite', label: 'Vite' },
  { value: 'rsbuild', label: 'Rsbuild' },
];

const ProducerConfig: React.FC<ProducerConfigProps> = ({ state, dispatch }) => {
  const handleFieldChange =
    (field: keyof Omit<ProducerConfigState, 'exposes' | 'shared'>) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = event.target;
      const value =
        field === 'manifestEnabled' && target instanceof HTMLInputElement
          ? target.checked
          : target.value;

      dispatch({
        type: 'SET_PRODUCER_FIELD',
        field,
        value,
      });
    };

  const handleExposeChange =
    (id: string, key: keyof ProducerExpose) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = state.exposes.map((item) =>
        item.id === id ? { ...item, [key]: event.target.value } : item,
      );
      dispatch({ type: 'SET_PRODUCER_EXPOSES', exposes: next });
    };

  const handleSharedChange =
    (id: string, key: keyof ProducerShared) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const isBooleanField = key === 'singleton' || key === 'eager';
      const value = isBooleanField ? event.target.checked : event.target.value;
      const next = state.shared.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      );
      dispatch({ type: 'SET_PRODUCER_SHARED', shared: next });
    };

  const handleAddExpose = () => {
    const next: ProducerExpose[] = [
      ...state.exposes,
      {
        id: `expose-${Date.now().toString(36)}`,
        moduleName: '',
        importPath: '',
        description: '',
      },
    ];
    dispatch({ type: 'SET_PRODUCER_EXPOSES', exposes: next });
  };

  const handleRemoveExpose = (id: string) => {
    const next = state.exposes.filter((item) => item.id !== id);
    dispatch({ type: 'SET_PRODUCER_EXPOSES', exposes: next });
  };

  const handleAddShared = () => {
    const next: ProducerShared[] = [
      ...state.shared,
      {
        id: `shared-${Date.now().toString(36)}`,
        packageName: '',
        singleton: true,
        eager: false,
        requiredVersion: '',
      },
    ];
    dispatch({ type: 'SET_PRODUCER_SHARED', shared: next });
  };

  const handleRemoveShared = (id: string) => {
    const next = state.shared.filter((item) => item.id !== id);
    dispatch({ type: 'SET_PRODUCER_SHARED', shared: next });
  };

  return (
    <div>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Producer basics</h3>
          <p className={styles.sectionDescription}>
            Configure the producer name, version and build tool. These values
            are used to generate config snippets.
          </p>
        </div>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Producer name</label>
            <input
              className={styles.fieldInput}
              value={state.name}
              onChange={handleFieldChange('name')}
              placeholder="playground_provider"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Version</label>
            <input
              className={styles.fieldInput}
              value={state.version}
              onChange={handleFieldChange('version')}
              placeholder="1.0.0"
            />
          </div>
        </div>
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Build tool</label>
            <select
              className={styles.fieldInput}
              value={state.buildTool}
              onChange={handleFieldChange('buildTool')}
            >
              {BUILD_TOOLS.map((tool) => (
                <option key={tool.value} value={tool.value}>
                  {tool.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Remote entry filename</label>
            <input
              className={styles.fieldInput}
              value={state.filename}
              onChange={handleFieldChange('filename')}
              placeholder="remoteEntry.js"
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Manifest</h3>
          <p className={styles.sectionDescription}>
            Enable manifest generation so runtime consumers can discover exposes
            via
            <code> mf-manifest.json</code>.
          </p>
        </div>
        <div className={styles.fieldGrid}>
          <div className={styles.fieldInline}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={state.manifestEnabled}
                onChange={handleFieldChange('manifestEnabled')}
              />
              <span>Enable manifest</span>
            </label>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Manifest output path</label>
            <input
              className={styles.fieldInput}
              value={state.manifestPath}
              onChange={handleFieldChange('manifestPath')}
              placeholder="./dist"
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Exposed modules</h3>
          <p className={styles.sectionDescription}>
            Configure the exposes map. Each entry generates an{' '}
            <code>exposes</code> field in the config.
          </p>
          <button
            type="button"
            className={styles.smallButton}
            onClick={handleAddExpose}
          >
            Add module
          </button>
        </div>
        <div className={styles.arrayRows}>
          {state.exposes.map((expose) => (
            <div key={expose.id} className={styles.arrayRow}>
              <div className={styles.arrayRowInputs}>
                <input
                  className={styles.fieldInput}
                  value={expose.moduleName}
                  onChange={handleExposeChange(expose.id, 'moduleName')}
                  placeholder="./Button"
                />
                <input
                  className={styles.fieldInput}
                  value={expose.importPath}
                  onChange={handleExposeChange(expose.id, 'importPath')}
                  placeholder="./src/components/Button.tsx"
                />
                <input
                  className={styles.fieldInput}
                  value={expose.description || ''}
                  onChange={handleExposeChange(expose.id, 'description')}
                  placeholder="Description (optional)"
                />
              </div>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => handleRemoveExpose(expose.id)}
              >
                Remove
              </button>
            </div>
          ))}
          {!state.exposes.length && (
            <div className={styles.sectionHint}>
              No exposes yet. Click &quot;Add module&quot; to start.
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Shared dependencies</h3>
          <p className={styles.sectionDescription}>
            Configure shared dependencies such as <code>react</code> and{' '}
            <code>react-dom</code>.
          </p>
          <button
            type="button"
            className={styles.smallButton}
            onClick={handleAddShared}
          >
            Add dependency
          </button>
        </div>
        <div className={styles.arrayRows}>
          {state.shared.map((item) => (
            <div key={item.id} className={styles.arrayRow}>
              <div className={styles.arrayRowInputs}>
                <input
                  className={styles.fieldInput}
                  value={item.packageName}
                  onChange={handleSharedChange(item.id, 'packageName')}
                  placeholder="react"
                />
                <input
                  className={styles.fieldInput}
                  value={item.requiredVersion || ''}
                  onChange={handleSharedChange(item.id, 'requiredVersion')}
                  placeholder="^18.0.0 (optional)"
                />
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={item.singleton}
                    onChange={handleSharedChange(item.id, 'singleton')}
                  />
                  <span>singleton</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={item.eager}
                    onChange={handleSharedChange(item.id, 'eager')}
                  />
                  <span>eager</span>
                </label>
              </div>
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => handleRemoveShared(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
          {!state.shared.length && (
            <div className={styles.sectionHint}>
              No shared dependencies yet. Click &quot;Add&quot; to add.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProducerConfig;
