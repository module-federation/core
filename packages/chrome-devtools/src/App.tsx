import { useState, useEffect } from 'react';
import { Layout, Empty } from '@arco-design/web-react';

import './init';
import ProxyLayout from './component/Layout';
import { getGlobalModuleInfo, RootComponentProps } from './utils';

import '@arco-design/web-react/dist/css/arco.css';
import styles from './App.module.scss';

const { Content } = Layout;

const App = (props: RootComponentProps) => {
  const {
    versionList,
    setVersionList,
    getVersion,
    handleSnapshot,
    handleProxyAddress,
    customValueValidate,
  } = props;
  const [module, setModule] = useState(window.__FEDERATION__?.moduleInfo || {});

  useEffect(() => {
    getGlobalModuleInfo(setModule);
  }, []);

  return (
    <>
      <Layout className={styles.layout}>
        <Content className={styles.content}>
          {Object.keys(module).length > 0 ||
          process.env.NODE_ENV === 'development' ? (
            <ProxyLayout
              moduleInfo={module}
              versionList={versionList}
              setVersionList={setVersionList}
              getVersion={getVersion}
              handleSnapshot={handleSnapshot}
              handleProxyAddress={handleProxyAddress}
              customValueValidate={customValueValidate}
            />
          ) : (
            <Empty description={'No ModuleInfo Detected'} />
          )}
        </Content>
      </Layout>
    </>
  );
};

export default App;
