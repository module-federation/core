import { useState, useEffect } from 'react';
import { Layout, Empty } from '@arco-design/web-react';

import ProxyLayout from './component/Layout';
import { getGlobalModuleInfo } from './utils';

import '@arco-design/web-react/dist/css/arco.css';
import styles from './App.module.scss';

const { Content } = Layout;

const App = () => {
  const [module, setModule] = useState({});

  console.log('module', module);
  useEffect(() => {
    getGlobalModuleInfo(setModule);
  }, []);

  return (
    <>
      <Layout className={styles.layout}>
        <Content className={styles.content}>
          {Object.keys(module).length > 0 ||
          process.env.NODE_ENV === 'development' ? (
            <ProxyLayout moduleInfo={module} />
          ) : (
            <Empty description={'No ModuleInfo Detected'} />
          )}
        </Content>
      </Layout>
    </>
  );
};

export default App;
