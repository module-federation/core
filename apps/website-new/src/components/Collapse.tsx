import { useState } from 'react';
import styles from './Collapse.module.scss';

const Collapse = (props) => {
  const [collapse, setCollapse] = useState(true);

  return (
    <details className={styles.details}>
      <summary
        onClick={() => {
          setCollapse(!collapse);
        }}
        className={styles.summary}
      >
        <span
          className={collapse ? styles['arrow-right'] : styles['arrow-down']}
        ></span>
        &nbsp; Type declaration
      </summary>
      {props.children}
    </details>
  );
};

export default Collapse;
