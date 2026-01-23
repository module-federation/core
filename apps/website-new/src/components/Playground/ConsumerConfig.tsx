import React, { type ChangeEvent } from 'react';
import type {
  ConsumerBuildState,
  ConsumerRuntimeState,
  PlaygroundAction,
  PlaygroundState,
} from './state';
import styles from './index.module.scss';

interface ConsumerConfigProps {
  state: PlaygroundState['consumer'];
  dispatch: React.Dispatch<PlaygroundAction>;
}

const ConsumerConfig: React.FC<ConsumerConfigProps> = ({ state, dispatch }) => {
  const handleRuntimeFieldChange =
    (field: keyof ConsumerRuntimeState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch({
        type: 'SET_CONSUMER_RUNTIME_FIELD',
        field,
        value: event.target.value,
      });
    };

  const handleBuildFieldChange =
    (field: keyof ConsumerBuildState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      dispatch({
        type: 'SET_CONSUMER_BUILD_FIELD',
        field,
        value: event.target.value,
      });
    };

  const switchMode = (mode: 'runtime' | 'build') => {
    if (state.mode !== mode) {
      dispatch({ type: 'SET_CONSUMER_MODE', mode });
    }
  };

  return (
    <div>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Consumer mode</h3>
          <p className={styles.sectionDescription}>
            Choose how the consumer integrates the producer: pure runtime or
            build-time plugin.
          </p>
        </div>
        <div className={styles.modeSwitch}>
          <button
            type="button"
            className={`${styles.modeButton} ${
              state.mode === 'runtime' ? styles.modeButtonActive : ''
            }`}
            onClick={() => switchMode('runtime')}
          >
            Runtime (manifest)
          </button>
          <button
            type="button"
            className={`${styles.modeButton} ${
              state.mode === 'build' ? styles.modeButtonActive : ''
            }`}
            onClick={() => switchMode('build')}
          >
            Build plugin
          </button>
        </div>
      </div>

      {state.mode === 'runtime' ? (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Runtime loader</h3>
            <p className={styles.sectionDescription}>
              Configure the manifest URL and remote id used by
              <code> @module-federation/runtime</code> or the enhanced runtime.
            </p>
          </div>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Remote name</label>
              <input
                className={styles.fieldInput}
                value={state.runtime.remoteName}
                onChange={handleRuntimeFieldChange('remoteName')}
                placeholder="playground_provider"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Exposed module</label>
              <input
                className={styles.fieldInput}
                value={state.runtime.exposedModule}
                onChange={handleRuntimeFieldChange('exposedModule')}
                placeholder="./Button"
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Manifest URL</label>
            <input
              className={styles.fieldInput}
              value={state.runtime.manifestUrl}
              onChange={handleRuntimeFieldChange('manifestUrl')}
              placeholder="http://localhost:3001/mf-manifest.json"
            />
          </div>
        </div>
      ) : (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Build plugin</h3>
            <p className={styles.sectionDescription}>
              Configure the host name and remote entry used by the
              bundler&apos;s Module Federation plugin.
            </p>
          </div>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Host name</label>
              <input
                className={styles.fieldInput}
                value={state.build.hostName}
                onChange={handleBuildFieldChange('hostName')}
                placeholder="playground_consumer"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Remote alias</label>
              <input
                className={styles.fieldInput}
                value={state.build.remoteAlias}
                onChange={handleBuildFieldChange('remoteAlias')}
                placeholder="playground_remote"
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Remote entry URL</label>
            <input
              className={styles.fieldInput}
              value={state.build.remoteEntryUrl}
              onChange={handleBuildFieldChange('remoteEntryUrl')}
              placeholder="http://localhost:3001/remoteEntry.js"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerConfig;
