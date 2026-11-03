import { useLang } from '@rspress/core/runtime';
import { useState } from 'react';
import styles from './Collapse.module.scss';

const Collapse = (props) => {
  const lang = useLang();
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
        &nbsp;{' '}
        {props.title || (lang === 'de' ? 'Typdeklaration' : 'Type declaration')}
      </summary>
      {props.children}
    </details>
  );
};

export default Collapse;
