import React from 'react';
import { Tag } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
          <span className={styles.label}>
            {t('sharedDeps.focusResult.providerLabel')}
          </span>
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
        {t('sharedDeps.messages.noFocusMatch')}
      </p>
    );
  }

  return <p className={styles.emptyText}>{t('sharedDeps.messages.noData')}</p>;
};

export default FocusResultDisplay;
