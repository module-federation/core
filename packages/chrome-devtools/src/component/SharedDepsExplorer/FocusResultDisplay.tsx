import React from 'react';
import { Tag } from '@arco-design/web-react';
import { LoadedStatus } from './share-utils';
import styles from './FocusResultDisplay.module.scss';

interface FocusResult {
  packageName: string;
  version: string;
  status: LoadedStatus;
  providers: string[];
}

interface FocusResultDisplayProps {
  focusResult: FocusResult | null;
  hasData: boolean;
  loadedStatusLabel: (status: LoadedStatus) => string;
}

const FocusResultDisplay: React.FC<FocusResultDisplayProps> = ({
  focusResult,
  hasData,
  loadedStatusLabel,
}) => {
  if (focusResult) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.packageInfo}>
            {focusResult.packageName}@{focusResult.version}
          </span>
          <Tag size="small" className="loaded-status-tag">
            {loadedStatusLabel(focusResult.status)}
          </Tag>
        </div>
        <div className={styles.providers}>
          <span className={styles.label}>Provider: </span>
          {focusResult.providers.map((p) => (
            <span key={p} className={styles.providerTag}>
              {p}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (hasData) {
    return (
      <p className={styles.emptyText}>
        No version matching the criteria was found in the current shared data.
        Please check if the package name / version is correct.
      </p>
    );
  }

  return (
    <p className={styles.emptyText}>No shared dependency data loaded yet.</p>
  );
};

export default FocusResultDisplay;
