import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Handle, Position } from 'reactflow';

import styles from './index.module.scss';
import 'reactflow/dist/style.css';

const GraphItem = (props: {
  data: { info?: string; color?: string; remote?: any };
}) => {
  const [shareds, setShareds] = useState([]);
  const [exposes, setExposes] = useState([]);

  let name: string;
  let version: string;
  const { info = '', color, remote } = props.data;
  const infoArray = info.split(':');
  if (info.endsWith('.json') || info.endsWith('.js')) {
    name = infoArray.shift() as string;
    version = infoArray.join(':');
  } else {
    [name, version] = infoArray;
  }

  const isEntryType = version?.startsWith('http') || version?.startsWith('//');

  useEffect(() => {
    let exposes;
    let shareds;
    if (isEntryType) {
      fetch(version)
        .then((response) => response.json())
        .then((json) => {
          const exposeList = Array.isArray(json?.exposes) ? json.exposes : [];
          const sharedList = Array.isArray(json?.shared) ? json.shared : [];
          exposes =
            exposeList.map((expose: { path: string }) => expose.path) || [];
          shareds =
            sharedList.map(
              (share: { name: string; version: string }) =>
                `${share.name}:${share.version}`,
            ) || [];
          setExposes(exposes);
          setShareds(shareds);
        })
        .catch(() => {
          setExposes([]);
          setShareds([]);
        });
    } else {
      exposes =
        remote?.modules?.map(
          (item: { modulePath: string }) => item.modulePath,
        ) || [];
      shareds =
        remote?.shared?.map(
          (item: { sharedName: string; version: string }) =>
            `${item.sharedName}:${item.version}`,
        ) || [];
      setExposes(exposes);
      setShareds(shareds);
    }
  }, [isEntryType, remote, version]);

  const accentColor = color || 'rgba(99, 102, 241, 0.45)';
  const style = {
    ['--mf-accent' as string]: accentColor,
  } as CSSProperties;

  return (
    <div style={style} className={styles.Wrapper}>
      <Handle type={'target'} position={Position.Top} />
      <div className={styles.container}>
        <div className={styles.group}>
          <div className={styles.name}>{name}</div>
        </div>
        {version && (
          <div className={styles.info}>
            {exposes.length > 0 ? (
              <div className={styles['expose-container']}>
                <span className={styles.type}>Expose</span>
                <div>
                  {exposes.map((expose: string, index: number) => {
                    return (
                      <span className={styles.item} key={index}>
                        {expose}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {shareds.length > 0 ? (
              <div className={styles['expose-container']}>
                <span className={styles.type}>Shared</span>
                <div>
                  {shareds.map((shared: string, index: number) => {
                    return (
                      <span className={styles.item} key={index}>
                        {shared}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}
            <div className={styles.message}>
              <span className={styles.type}>
                {isEntryType ? 'Entry' : 'Version'}
              </span>
              <span className={styles.item}>{version}</span>
            </div>
          </div>
        )}
      </div>
      <Handle type={'source'} position={Position.Bottom} id={'source'} />
    </div>
  );
};

export default GraphItem;
