import { Handle, Position } from 'reactflow';
import { Avatar } from '@arco-design/web-react';

import styles from './index.module.scss';
import 'reactflow/dist/style.css';

const GraphItem = (props: {
  data: { info?: string; color?: string; remote?: any };
}) => {
  let name;
  let version;

  const { info = '', color, remote } = props.data;

  const infoArray = info.split(':');
  if (info.endsWith('.json')) {
    name = infoArray.shift();
    version = infoArray.join(':');
  } else {
    [name, version] = infoArray;
  }

  const isEntryType = version?.startsWith('http') || version?.startsWith('//');
  const exposes =
    remote?.modules?.map((item: { modulePath: string }) => item.modulePath) ||
    [];
  const shareds =
    remote?.shared?.map((item: { sharedName: string }) => item.sharedName) ||
    [];

  return (
    <div style={{ background: color }} className={styles.Wrapper}>
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

            {exposes.length > 0 ? (
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
            <div>
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
