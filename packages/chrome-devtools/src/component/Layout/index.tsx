import { useEffect, useMemo, useState, useRef } from 'react';
import { useDebounceFn, useUpdateEffect } from 'ahooks';
import { Form, FormInstance } from '@arco-design/web-react';
import {
  GlobalModuleInfo,
  MODULE_DEVTOOL_IDENTIFIER,
} from '@module-federation/sdk';
import type { Federation } from '@module-federation/runtime';

import FormComponent from '../Form';
import {
  getModuleInfo,
  getScope,
  injectScript,
  isObject,
  separateType,
  reloadPage,
  setChromeStorage,
  getStorageValue,
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
  ENABLE_CLIP,
  __ENABLE_FAST_REFRESH__,
  BROWSER_ENV_KEY,
  __FEDERATION_DEVTOOLS__,
  __EAGER_SHARE__,
} from '../../template/constant';
import styles from './index.module.scss';

interface FormItemType {
  key: string;
  value: string;
  checked: boolean;
}

const sortRulesForSignature = (rules: Array<FormItemType>) =>
  [...rules]
    .sort((a, b) => {
      const keyCompare = (a.key || '').localeCompare(b.key || '');
      if (keyCompare !== 0) {
        return keyCompare;
      }
      return (a.value || '').localeCompare(b.value || '');
    })
    .map((rule) => ({
      key: rule.key || '',
      value: rule.value || '',
      checked: Boolean(rule.checked),
    }));

const getEffectiveSignature = (rules: Array<FormItemType>) =>
  rules.length ? JSON.stringify(sortRulesForSignature(rules)) : '';
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
    headerSlot,
    onModuleInfoChange,
    onModuleInfoReset,
    tabId,
  } = props;
  const { producer } = separateType(moduleInfo);
  const producerKey = useMemo(() => producer.join('|'), [producer]);
  const [condition, setCondition] = useState(statusInfo.processing);
  const [formStatus, setFormStatus] = useState<Array<FormItemStatus>>([]);
  const [form] = Form.useForm();
  const [enableHMR, setEnalbeHMR] = useState('disable');
  const [enableClip, setEnableClip] = useState(() => {
    try {
      if (tabId) {
        return localStorage.getItem(`${ENABLE_CLIP}_${tabId}`) === 'true';
      }
      return false;
    } catch (e) {
      return false;
    }
  });
  const lastFormSignatureRef = useRef<string>('');
  const lastEffectiveRulesRef = useRef<string>('');
  const lastRawRulesRef = useRef<Array<FormItemType>>([]);
  const lastEnableClipRef = useRef(enableClip);

  const ensureFederationContext = () => {
    if (!window.__FEDERATION__) {
      window.__FEDERATION__ = {
        originModuleInfo: moduleInfo || ({} as GlobalModuleInfo),
        moduleInfo: moduleInfo || ({} as GlobalModuleInfo),
      } as Federation & {
        originModuleInfo: GlobalModuleInfo;
        moduleInfo: GlobalModuleInfo;
      };
    }
    if (!window.__FEDERATION__.originModuleInfo) {
      window.__FEDERATION__.originModuleInfo =
        moduleInfo || ({} as GlobalModuleInfo);
    }
    if (!window.__FEDERATION__.moduleInfo) {
      window.__FEDERATION__.moduleInfo = moduleInfo || ({} as GlobalModuleInfo);
    }
  };

  useEffect(() => {
    ensureFederationContext();
    window.__FEDERATION__.moduleInfo = JSON.parse(
      JSON.stringify(moduleInfo || {}),
    ) as GlobalModuleInfo;
    window.__FEDERATION__.originModuleInfo = JSON.parse(
      JSON.stringify(moduleInfo || {}),
    ) as GlobalModuleInfo;
    const rawRules = form.getFieldValue(proxyFormField) || [];
    lastRawRulesRef.current = JSON.parse(JSON.stringify(rawRules));
  }, [moduleInfo, form]);

  const collectEffectiveRules = (
    rules: Array<FormItemType>,
    statusList: Array<FormItemStatus>,
  ) => {
    return rules.reduce((memo: Array<FormItemType>, current, idx) => {
      if (!current?.checked) {
        return memo;
      }
      const status = statusList[idx];
      const keyValid = status ? status.keyStatus : Boolean(current.key);
      const valueValid = status ? status.valueStatus : Boolean(current.value);
      if (!keyValid || !valueValid) {
        return memo;
      }
      const duplicate = JSON.parse(JSON.stringify(current));
      if (handleProxyAddress) {
        duplicate.value = handleProxyAddress(duplicate.value);
      }
      memo.push(duplicate);
      return memo;
    }, []);
  };

  const hasPendingRule = (
    rules: Array<FormItemType>,
    statusList: Array<FormItemStatus>,
  ) => {
    return rules.some((rule, idx) => {
      if (!rule?.checked) {
        return false;
      }
      const status = statusList[idx];
      if (!status) {
        return Boolean(rule.key) && !rule.value;
      }
      return Boolean(status.keyStatus) && !status.valueStatus;
    });
  };

  const { run } = useDebounceFn(
    async (formData) => {
      ensureFederationContext();
      window.__FEDERATION__.moduleInfo = JSON.parse(
        JSON.stringify(window.__FEDERATION__.originModuleInfo),
      );
      const rawRules = formData[proxyFormField] || [];
      const rawSignature = JSON.stringify(rawRules);
      if (rawSignature === lastFormSignatureRef.current) {
        return;
      }
      const effectiveRules = collectEffectiveRules(rawRules, formStatus);
      const effectiveSignature = getEffectiveSignature(effectiveRules);
      const pendingRule = hasPendingRule(rawRules, formStatus);
      const hadPreviousEffective =
        lastEffectiveRulesRef.current !== '' &&
        lastEffectiveRulesRef.current !== '[]';

      const clipChanged = enableClip !== lastEnableClipRef.current;
      lastEnableClipRef.current = enableClip;

      try {
        setCondition(statusInfo.processing);
        if (!effectiveRules.length) {
          if (pendingRule) {
            return;
          }
          if (hadPreviousEffective) {
            await removeStorage(MODULE_DEVTOOL_IDENTIFIER);
            await removeStorage(BROWSER_ENV_KEY);
            await removeStorageKey(__FEDERATION_DEVTOOLS__, 'overrides');
            await injectScript(reloadPage, false);
            setCondition(statusInfo.noProxy);
            lastEffectiveRulesRef.current = '';
            if (typeof onModuleInfoReset === 'function') {
              onModuleInfoReset();
            } else {
              onModuleInfoChange?.(window.__FEDERATION__.originModuleInfo);
            }
          } else {
            setCondition(statusInfo.noProxy);
          }
          setCondition(statusInfo.noProxy);
          return;
        }
        if (
          !clipChanged &&
          effectiveSignature === lastEffectiveRulesRef.current
        ) {
          if (hadPreviousEffective) {
            setCondition(statusInfo.success);
          } else {
            setCondition(statusInfo.noProxy);
          }
          return;
        }
        if (rawRules.every((rule: FormItemType) => !rule.value)) {
          if (hadPreviousEffective) {
            setCondition(statusInfo.success);
          } else {
            setCondition(statusInfo.noProxy);
          }
          return;
        }
        const { moduleInfo, status, overrides } = handleSnapshot
          ? await handleSnapshot(effectiveRules)
          : await getModuleInfo(effectiveRules);
        if (enableClip) {
          Object.values(moduleInfo).forEach((val: any) => {
            if (val.modules) {
              val.modules = [];
            }
            if (val.shared) {
              val.shared = [];
            }
          });
        }
        const snapshotJson = JSON.stringify(moduleInfo);
        await setStorage(MODULE_DEVTOOL_IDENTIFIER, snapshotJson);
        await setStorage(BROWSER_ENV_KEY);

        await mergeStorage(__FEDERATION_DEVTOOLS__, 'overrides', overrides);

        await injectScript(reloadPage, false);
        window.__FEDERATION__.moduleInfo = moduleInfo;
        onModuleInfoChange?.(moduleInfo);
        setCondition(statusInfo[status]);
        lastEffectiveRulesRef.current = effectiveSignature;
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
    ensureFederationContext();
    let cancelled = false;

    const hydrateForm = async () => {
      const scope = await getScope();
      const data = await chrome.storage.sync.get([FormID]);
      const config = data?.[FormID]?.[scope];

      let storeData;
      if (isObject(config)) {
        storeData = JSON.parse(JSON.stringify(config));
        if (producer.length) {
          storeData[proxyFormField] = storeData[proxyFormField]?.filter(
            (item: { key: string }) => producer.includes(item.key),
          );
          if (!storeData[proxyFormField]?.length) {
            storeData = JSON.parse(JSON.stringify(defaultModuleData));
          }
        }
      } else {
        storeData = JSON.parse(JSON.stringify(defaultModuleData));
      }

      let overridesApplied = false;
      try {
        const overridesState = await getStorageValue(__FEDERATION_DEVTOOLS__);
        if (typeof overridesState === 'string' && overridesState) {
          const parsedState = JSON.parse(overridesState);
          const overrides = parsedState?.overrides;
          if (isObject(overrides)) {
            const overrideRules = Object.entries(overrides)
              .map(([key, value]) => ({
                key,
                value: typeof value === 'string' ? value : '',
                checked: true,
              }))
              .filter(
                (rule): rule is FormItemType =>
                  Boolean(rule.key) && Boolean(rule.value),
              );
            const filteredRules = producer.length
              ? overrideRules.filter((rule) => producer.includes(rule.key))
              : overrideRules;
            if (filteredRules.length) {
              storeData = {
                ...storeData,
                [proxyFormField]: filteredRules,
              };
              overridesApplied = true;
            }
          }
        }
      } catch (error) {
        console.warn(
          '[MF Devtools] hydrate overrides from localStorage failed',
          error,
        );
      }

      if (!cancelled) {
        form.setFieldsValue(storeData);
        lastFormSignatureRef.current = JSON.stringify(storeData);
        const rules: Array<FormItemType> = Array.isArray(
          storeData[proxyFormField],
        )
          ? storeData[proxyFormField]
          : [];
        const effectiveRules = collectEffectiveRules(rules, []);
        lastEffectiveRulesRef.current = getEffectiveSignature(effectiveRules);
        lastRawRulesRef.current = JSON.parse(JSON.stringify(rules));
        setFormStatus(
          rules.map<FormItemStatus>((rule) => ({
            keyStatus: Boolean(rule?.key),
            valueStatus: Boolean(rule?.value),
          })),
        );
        if (overridesApplied) {
          setChromeStorage(storeData);
        }
        if (effectiveRules.length) {
          setCondition(statusInfo.success);
        } else {
          setCondition(statusInfo.noProxy);
        }
      }
    };

    hydrateForm();

    return () => {
      cancelled = true;
    };
  }, [moduleInfo, producerKey, form]);

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
    if (!producer.length) {
      return;
    }
    const formData = form.getFieldsValue();
    const signature = JSON.stringify(formData);
    if (signature === lastFormSignatureRef.current) {
      return;
    }
    lastFormSignatureRef.current = signature;
    const effectiveRules = collectEffectiveRules(
      formData[proxyFormField] || [],
      formStatus,
    );
    const effectiveSignature = getEffectiveSignature(effectiveRules);
    if (effectiveSignature === lastEffectiveRulesRef.current) {
      return;
    }
    run(formData);
  }, [producerKey, formStatus]);

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
    const signature = JSON.stringify(formData);
    if (signature === lastFormSignatureRef.current) {
      return;
    }
    lastFormSignatureRef.current = signature;
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
      removeStorageKey(__FEDERATION_DEVTOOLS__, __EAGER_SHARE__);
    }
    injectScript(reloadPage, false);
  };

  const onClipChange = (on: boolean) => {
    setEnableClip(on);
    try {
      if (tabId) {
        localStorage.setItem(`${ENABLE_CLIP}_${tabId}`, String(on));
      }
    } catch (e) {
      console.error(e);
    }
    run(form.getFieldsValue());
  };

  const remotePreview = producer
    .map((id) => {
      const [, name] = id.split(':');
      return name || id;
    })
    .filter(Boolean);
  const previewList = remotePreview.slice(0, 4);
  const extraCount =
    remotePreview.length > previewList.length
      ? remotePreview.length - previewList.length
      : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <span className={styles.summaryTitle}>Remotes in scope</span>
          <span className={styles.summaryHint}>
            Override manifests to verify integration without redeploying.
          </span>
        </div>
        <div className={styles.chipGroup}>
          {previewList.length ? (
            previewList.map((name) => (
              <span className={styles.chip} key={name}>
                {name}
              </span>
            ))
          ) : (
            <span className={styles.chipPlaceholder}>
              Waiting for module map
            </span>
          )}
          {extraCount > 0 && (
            <span className={styles.moreChip}>+{extraCount} more</span>
          )}
        </div>
      </div>

      <section className={styles.formSection}>
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
            enableClip={enableClip}
            onClipChange={onClipChange}
            versionList={versionList}
            setVersionList={setVersionList}
            getVersion={getVersion}
            customValueValidate={customValueValidate}
            headerSlot={headerSlot}
          />
        </Form>
      </section>
    </div>
  );
};

export default Layout;
