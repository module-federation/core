import { Handle, Position } from 'reactflow';
import { Avatar } from '@arco-design/web-react';

import styles from './index.module.scss';

const GraphItem = (props: { data: { info?: string; color?: string } }) => {
  let name;
  let version;
  const { info = '', color } = props.data;
  const infoArray = info.split(':');
  if (info.endsWith('.json')) {
    name = infoArray.shift();
    version = infoArray.join(':');
  } else {
    [name, version] = infoArray;
  }

  return (
    <div style={{ borderColor: color }} className={styles.Wrapper}>
      <Handle type={'target'} position={Position.Top} />
      <div className={styles.group}>
        <Avatar size={35}>
          <img src="https://avatars.githubusercontent.com/u/61727377?s=200&v=4" />
        </Avatar>
        <div className={styles.name}>{name}</div>
      </div>
      <div className={styles.version}>{version}</div>
      <Handle type={'source'} position={Position.Bottom} id={'source'} />
    </div>
  );
};

export default GraphItem;
