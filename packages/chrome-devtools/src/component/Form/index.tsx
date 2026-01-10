import { SetStateAction, ReactNode, useEffect } from 'react';
import {
  Checkbox,
  Button,
  Empty,
  Tooltip,
  Badge,
  Form,
  Select,
  Switch,
  FormInstance,
} from '@arco-design/web-react';
import {
  IconDelete,
  IconPlus,
  IconInfoCircle,
  IconQuestionCircle,
} from '@arco-design/web-react/icon';

import { defaultDataItem, proxyFormField } from '../../template/constant';
import {
  validateCustom,
  validateSemver,
  validatePort,
  isObject,
  separateType,
  FormItemStatus,
  RootComponentProps,
} from '../../utils';
import styles from './index.module.scss';

const FormItem = Form.Item;
const FormList = Form.List;
const { Option } = Select;

interface FormProps {
  form: FormInstance<any, any, string | number | symbol>;
  condition: {
    status: string;
    message: string;
    color: string;
  };
  formStatus: Array<FormItemStatus>;
  setFormStatus: React.Dispatch<SetStateAction<FormItemStatus[]>>;
  validateForm: any;
  enableHMR: string;
  onHMRChange: (on: boolean) => void;
  enableClip: boolean;
  onClipChange: (on: boolean) => void;
  headerSlot?: ReactNode;
}
const FormComponent = (props: FormProps & RootComponentProps) => {
  const {
    form,
    condition,
    formStatus,
    setFormStatus,
    validateForm,
    enableHMR,
    onHMRChange,
    versionList,
    setVersionList,
    getVersion,
    customValueValidate,
    enableClip,
    onClipChange,
  } = props;
  const federation = window.__FEDERATION__ || {
    moduleInfo: {} as any,
    originModuleInfo: {} as any,
  };
  const { moduleInfo } = federation;
  let { producer } = separateType(moduleInfo);
  const filterDupMap = new Map();
  producer = producer.filter((t) => {
    const [typeOrName, name] = t.split(':');
    const marked = filterDupMap.get(name || typeOrName);
    filterDupMap.set(name || typeOrName, true);
    return !marked;
  });
  const formatProducer = producer.map((id) => {
    const hasType = id.includes(':');
    if (hasType) {
      return {
        label: id.split(':')[1],
        value: id,
      };
    } else {
      return {
        label: id,
        value: id,
      };
    }
  });

  useEffect(() => {
    producer.forEach(async (target) => {
      const version = await getVersion?.(target);
      const list = [...(versionList || [])];
      if (version) {
        list.push(version);
      }
      setVersionList?.(list);
    });
  }, []);

  const getCheckStatus = (index: number) => {
    const formData = form.getFieldsValue();
    return formData[proxyFormField][index].checked;
  };

  const validateKey = (
    key: string,
    callback: (error?: string) => void,
    index: number,
  ) => {
    const status = getCheckStatus(index);
    if (!status) {
      return callback();
    }

    const statusSet = [...formStatus];
    if (!isObject(statusSet[index])) {
      statusSet[index] = {
        keyStatus: false,
        valueStatus: false,
      };
    }

    if (key) {
      statusSet[index].keyStatus = true;
      // 在 React 19 中，使用 setTimeout 来确保状态更新在下一个事件循环中执行
      setTimeout(() => {
        setFormStatus(statusSet);
        callback();
      }, 0);
      return;
    }

    statusSet[index].keyStatus = false;
    setTimeout(() => {
      setFormStatus(statusSet);
    }, 0);
    return callback('Module name can not be empty');
  };

  const validateValue = (
    value: string,
    callback: (error?: string) => void,
    index: number,
  ) => {
    const status = getCheckStatus(index);
    if (!status) {
      return callback();
    }

    const statusSet = [...formStatus];
    if (!isObject(statusSet[index])) {
      statusSet[index] = {
        keyStatus: false,
        valueStatus: false,
      };
    }

    if (
      validateCustom(value) ||
      validateSemver(value) ||
      validatePort(value) ||
      customValueValidate?.(value)
    ) {
      statusSet[index].valueStatus = true;
      // 在 React 19 中，使用 setTimeout 来确保状态更新在下一个事件循环中执行
      setTimeout(() => {
        setFormStatus(statusSet);
        callback();
      }, 0);
      return;
    }

    statusSet[index].valueStatus = false;
    setTimeout(() => {
      setFormStatus(statusSet);
    }, 0);
    return callback(
      'The module information format is incorrect, check the format in the upper left corner',
    );
  };

  const onAdd = (add: {
    (defaultValue?: any, index?: number | undefined): void;
    (arg0: { key: string; value: string; checked: boolean }): void;
  }) => {
    add(defaultDataItem);
    setVersionList?.([...(versionList || []), []]);
    validateForm();
  };

  const onRemove = (remove: (index: number) => void, index: number) => {
    if (Array.isArray(versionList)) {
      versionList.splice(index, 1);
      setVersionList?.(versionList);
    }
    remove(index);
  };

  const hmrChange = (on: boolean) => {
    onHMRChange(on);
  };

  const handleSwitchChange = (on: boolean) => {
    onClipChange(on);
  };

  const onKeyChange = async (key: string, index: number) => {
    const version = await getVersion?.(key);
    if (version) {
      const list = [...(versionList || [])];
      list.splice(index, 1, version);
      setVersionList?.(list);
    }
  };

  return (
    <FormList field={proxyFormField}>
      {(fields, { add, remove }) => (
        <div className={styles.wrapper}>
          <div className={styles.sectionHeader}>
            <div className={styles.heading}>
              <div className={styles.titleRow}>
                <Tooltip
                  content={
                    <div>
                      Example: Customise the remote module address ending with
                      「.json」. For instance key: @module-federation/button,
                      value: http://localhost:3000/mf-manifest.json
                    </div>
                  }
                >
                  <IconInfoCircle />
                </Tooltip>
                <span className={styles.title}>Proxy Overrides</span>
                <span
                  className={styles.statusMessage}
                  style={{ marginLeft: 8 }}
                >
                  <Badge color={condition.color} className={styles.badge} />
                  {condition.message}
                </span>
              </div>
              <span className={styles.subtitle}>
                Point consumers to specific remote bundles or manifests for
                quicker validation.
              </span>
            </div>
            <div className={styles.headerActions}>
              <span className={styles.hmrArea}>
                {props.headerSlot}
                <Switch
                  checked={enableClip}
                  checkedText={'Enable Clip'}
                  uncheckedText={'Disable Clip'}
                  onChange={handleSwitchChange}
                  className={styles.switch}
                />
                <Tooltip content="After enabling data clipping, snapshot modules and shared information will be removed, affecting preloading logic.">
                  <IconQuestionCircle
                    style={{ marginLeft: 5, cursor: 'pointer' }}
                  />
                </Tooltip>
                <div className={styles.divider} />
                <Switch
                  checked={enableHMR === 'enable'}
                  checkedText={'Enable HMR'}
                  uncheckedText={'Disable HMR'}
                  onChange={hmrChange}
                  className={styles.switch}
                />
              </span>
              <Button
                icon={<IconPlus />}
                shape="circle"
                className={styles.add}
                onClick={() => onAdd(add)}
                data-set-e2e={'e2eAdd'}
                type="primary"
              />
            </div>
          </div>

          {fields.length ? (
            <div className={styles.rules}>
              {fields.map((item, index) => (
                <div className={styles.ruleCard} key={item.field}>
                  <div className={styles.ruleHeader}>
                    <FormItem
                      field={`${item.field}.checked`}
                      triggerPropName={'checked'}
                    >
                      <Checkbox className={styles.toggle} />
                    </FormItem>
                    <Button
                      icon={<IconDelete />}
                      shape="circle"
                      status="danger"
                      className={styles.delete}
                      data-set-e2e={'e2eDelete'}
                      onClick={() => onRemove(remove, index)}
                    />
                  </div>
                  <div className={styles.inputs} data-set-e2e={'e2eProxyItem'}>
                    <FormItem
                      field={`${item.field}.key`}
                      rules={[
                        {
                          validator: (value, cb) => {
                            const isValid = Boolean(value);
                            if (isValid) {
                              cb();
                              validateKey(value, () => {}, index);
                            } else {
                              cb('Module name can not be empty');
                              validateKey(value, () => {}, index);
                            }
                          },
                        },
                      ]}
                      className={styles.field}
                    >
                      <Select
                        data-set-e2e={'e2eProxyKey'}
                        placeholder={'Module Name'}
                        onChange={(key) => onKeyChange(key, index)}
                        allowClear
                        showSearch
                        dropdownMenuClassName={styles.dropdown}
                      >
                        {formatProducer.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.label}
                          </Option>
                        ))}
                      </Select>
                    </FormItem>
                    <FormItem
                      field={`${item.field}.value`}
                      rules={[
                        {
                          validator: (value, cb) => {
                            const isValid =
                              validateCustom(value) ||
                              validateSemver(value) ||
                              validatePort(value) ||
                              customValueValidate?.(value);
                            if (isValid) {
                              cb();
                              validateValue(value, () => {}, index);
                            } else {
                              cb(
                                'The module information format is incorrect, check the format in the upper left corner',
                              );
                              validateValue(value, () => {}, index);
                            }
                          },
                        },
                      ]}
                      className={styles.field}
                    >
                      <Select
                        data-set-e2e={'e2eProxyValue'}
                        placeholder={'Custom Manifest URL'}
                        allowClear
                        showSearch
                        allowCreate
                        dropdownMenuClassName={styles.dropdown}
                      >
                        {(versionList || [])?.[index]?.map((version) => (
                          <Option key={version} value={version}>
                            {version}
                          </Option>
                        ))}
                      </Select>
                    </FormItem>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyWrapper}>
              <Empty
                description="Add your first override to begin redirecting remotes."
                className={styles.empty}
              />
            </div>
          )}

          <div className={styles.footerHint}>
            Changes persist per domain and refresh the inspected tab when valid.
          </div>
        </div>
      )}
    </FormList>
  );
};

export default FormComponent;
