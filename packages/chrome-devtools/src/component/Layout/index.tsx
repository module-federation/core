import { useEffect, useState } from 'react';
import { useDebounceFn, useUpdateEffect } from 'ahooks';
import { Form, FormInstance } from '@arco-design/web-react';
import {
  GlobalModuleInfo,
  MODULE_DEVTOOL_IDENTIFIER,
} from '@module-federation/sdk';
import type { Federation } from '@module-federation/runtime';

import FormComponent from '../Form';
import Dependency from '../Graph';
import {
  getModuleInfo,
  getScope,
  injectScript,
  isObject,
  separateType,
  reloadPage,
  setChromeStorage,
  mergeStorage,
  removeStorageKey,
  removeStorage,
  setStorage,
  FormItemStatus,
  RootComponentProps,
} from '../../utils';
import {
  defaultModuleData,
  proxyFormField,
  FormID,
  statusInfo,
  ENABLEHMR,
  __ENABLE_FAST_REFRESH__,
  BROWSER_ENV_KEY,
  __FEDERATION_DEVTOOLS__,
} from '../../template/constant';
interface FormItemType {
  key: string;
  value: string;
  checked: boolean;
}
declare global {
  interface Window {
    __FEDERATION__: Federation & {
      originModuleInfo: GlobalModuleInfo;
      moduleInfo: GlobalModuleInfo;
    };
  }
}

const Layout = (
  props: { moduleInfo: GlobalModuleInfo } & RootComponentProps,
) => {
  const {
    moduleInfo,
    handleSnapshot,
    versionList,
    setVersionList,
    getVersion,
    handleProxyAddress,
    customValueValidate,
  } = props;
  const { producer } = separateType(moduleInfo);
  const [condition, setCondition] = useState(statusInfo.processing);
  const [formStatus, setFormStatus] = useState<Array<FormItemStatus>>([]);
  const [snapshot, setSnapshot] = useState(moduleInfo);
  const [form] = Form.useForm();
  const [enableHMR, setEnalbeHMR] = useState('disable');

  const { run } = useDebounceFn(
    async (formData) => {
      window.__FEDERATION__.moduleInfo = JSON.parse(
        JSON.stringify(window.__FEDERATION__.originModuleInfo),
      );
      const filterFormData = formData[proxyFormField].reduce(
        (memo: Array<FormItemType>, current: FormItemType, idx: number) => {
          if (!formStatus[idx]) {
            return memo;
          }

          const { keyStatus, valueStatus } = formStatus[idx];
          if (!keyStatus || !valueStatus || !current.checked) {
            return memo;
          }
          const duplicate = JSON.parse(JSON.stringify(current));
          if (handleProxyAddress) {
            const value = handleProxyAddress(duplicate.value);
            duplicate.value = value;
          }
          return [...memo, duplicate];
        },
        [],
      );

      try {
        setCondition(statusInfo.processing);
        if (!filterFormData.length) {
          await removeStorage(MODULE_DEVTOOL_IDENTIFIER);
          await removeStorage(BROWSER_ENV_KEY);

          await removeStorageKey(__FEDERATION_DEVTOOLS__, 'overrides');
          await injectScript(reloadPage, false);
          setCondition(statusInfo.noProxy);
          setSnapshot(window.__FEDERATION__.originModuleInfo);
          return;
        }
        const { moduleInfo, status, overrides } = handleSnapshot
          ? await handleSnapshot(filterFormData)
          : await getModuleInfo(filterFormData);
        const snapshotJson = JSON.stringify(moduleInfo);
        await setStorage(MODULE_DEVTOOL_IDENTIFIER, snapshotJson);
        await setStorage(BROWSER_ENV_KEY);

        await mergeStorage(__FEDERATION_DEVTOOLS__, 'overrides', overrides);
        await injectScript(reloadPage, false);
        window.__FEDERATION__.moduleInfo = moduleInfo;
        setSnapshot(moduleInfo);
        setCondition(statusInfo[status]);
      } catch (e) {
        console.log(e);
        setCondition(statusInfo.error);
      }
    },
    {
      wait: 700,
    },
  );

  useEffect(() => {
    setSnapshot(moduleInfo);
  }, [moduleInfo]);

  useEffect(() => {
    getScope().then(async (scope) => {
      const data = await chrome.storage.sync.get([FormID]);
      const config = data?.[FormID]?.[scope];

      let storeData;
      if (isObject(config)) {
        storeData = JSON.parse(JSON.stringify(config));
        storeData[proxyFormField] = storeData[proxyFormField]?.filter(
          (item: { key: string }) => producer.includes(item.key),
        );
        if (!storeData[proxyFormField]?.length) {
          storeData = defaultModuleData;
        }
      } else {
        storeData = defaultModuleData;
      }

      form.setFieldsValue(storeData);
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.get([ENABLEHMR]).then((data) => {
      const enable = data[ENABLEHMR];
      if (typeof enable === 'boolean') {
        onHMRChange(enable);
      }
    });
  }, []);

  useEffect(() => {
    validateForm(form);
  }, []);

  useUpdateEffect(() => {
    const formData = form.getFieldsValue();
    run(formData);
  }, []);

  const validateForm = (
    form: FormInstance<any, any, string | number | symbol>,
  ) => {
    // 不能同步检查，添加或者 setFieldsValue 操作此时都未完成导致新增部分没验证
    setTimeout(() => {
      form.validate().catch(() => {
        console.log('Invalid proxy rules');
      });
    }, 50);
  };

  const onValuesChange = (target: any, formData: any) => {
    validateForm(form);
    setChromeStorage(formData);
    run(formData);
  };

  const onHMRChange = (on: boolean) => {
    setEnalbeHMR(on ? 'enable' : 'disable');
    chrome.storage.sync.set({
      [ENABLEHMR]: on,
    });
    if (on) {
      mergeStorage(__FEDERATION_DEVTOOLS__, __ENABLE_FAST_REFRESH__, on);
    } else {
      removeStorageKey(__FEDERATION_DEVTOOLS__, __ENABLE_FAST_REFRESH__);
    }
    injectScript(reloadPage, false);
  };

  return (
    <>
      <Form
        form={form}
        onValuesChange={(value, formData) => onValuesChange(value, formData)}
        initialValues={defaultModuleData}
      >
        <FormComponent
          form={form}
          condition={condition}
          formStatus={formStatus}
          setFormStatus={setFormStatus}
          validateForm={() => validateForm(form)}
          enableHMR={enableHMR}
          onHMRChange={onHMRChange}
          versionList={versionList}
          setVersionList={setVersionList}
          getVersion={getVersion}
          customValueValidate={customValueValidate}
        />
      </Form>

      <Dependency snapshot={snapshot} />
    </>
  );
};

export default Layout;
